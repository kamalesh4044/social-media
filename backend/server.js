require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Import our database setup
const db = require('./database');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for easier production hosting
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json()); // Allow Express to parse JSON bodies

const JWT_SECRET = "super_secret_key_for_omni_social"; 

// --- EMAIL CONFIGURATION (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// --- MULTER CONFIGURATION FOR FILE UPLOADS ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, 
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the static frontend built files in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// --- AUTHENTICATION ENDPOINTS ---

// REGISTER ENDPOINT - Direct Account Creation
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [username, email, hashedPassword], function(err) {
            if (err) return res.status(400).json({ error: 'Username or email already exists.' });
            
            const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ message: 'User created successfully', token, user: { id: this.lastID, username, email } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(400).json({ error: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url } });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user; 
        next(); 
    });
}

// --- POST & FEED ENDPOINTS ---

app.get('/api/posts', authenticateToken, (req, res) => {
    const sql = `
        SELECT posts.*, users.username, users.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as like_count,
        EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?) as user_has_liked
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
        LIMIT 50
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        res.json(rows);
    });
});

app.post('/api/posts', authenticateToken, upload.single('media'), (req, res) => {
    const { type, content_text } = req.body;
    const user_id = req.user.id;
    const media_url = req.file ? `/uploads/${req.file.filename}` : (req.body.media_url || null);

    const sql = `INSERT INTO posts (user_id, type, content_text, media_url) VALUES (?, ?, ?, ?)`;
    db.run(sql, [user_id, type, content_text, media_url], function(err) {
        if (err) return res.status(500).json({ error: 'Error creating post.' });
        
        const fetchSql = `
            SELECT posts.*, users.username, users.avatar_url, 0 as like_count, 0 as user_has_liked
            FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?
        `;
        db.get(fetchSql, [this.lastID], (err, newPost) => {
            if (!err && newPost) {
                io.emit('new_post', newPost);
                res.status(201).json(newPost);
            } else {
                res.status(500).json({ error: 'Error retrieving created post.' });
            }
        });
    });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    const post_id = req.params.id;
    const user_id = req.user.id;

    db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [post_id, user_id], function(err) {
        if (err) return res.status(400).json({ error: 'Already liked or invalid post.' });
        io.emit('post_liked', { post_id: Number(post_id), user_id });
        res.json({ message: 'Post liked successfully.' });
    });
});

// --- COMMENTS ENDPOINTS ---
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const post_id = req.params.id;
    const sql = `
        SELECT comments.*, users.username, users.avatar_url 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.post_id = ? 
        ORDER BY comments.created_at ASC
    `;
    db.all(sql, [post_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        res.json(rows);
    });
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const post_id = req.params.id;
    const user_id = req.user.id;
    const { comment_text } = req.body;

    db.run(`INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)`, [post_id, user_id, comment_text], function(err) {
        if (err) return res.status(500).json({ error: 'Error adding comment.' });
        
        const fetchSql = `SELECT comments.*, users.username, users.avatar_url FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?`;
        db.get(fetchSql, [this.lastID], (err, newComment) => {
            if (!err && newComment) {
                io.emit('new_comment', newComment);
                res.status(201).json(newComment);
            }
        });
    });
});

// --- WEBSOCKETS (REAL-TIME ENGINE) ---
io.on('connection', (socket) => {
    console.log(`User connected to WebSocket: ${socket.id}`);
    socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

// --- PICSUM SEEDER (LIVE DATA) ---
async function seedRedditData() {
    try {
        db.get(`SELECT id FROM users WHERE username = 'system'`, async (err, row) => {
            let sysUserId;
            if (!row) {
                const hash = await bcrypt.hash('systempass', 10);
                db.run(`INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)`, 
                    ['system', 'sys@system.com', hash, 'https://ui-avatars.com/api/?name=System&background=random'], function() {
                    sysUserId = this.lastID;
                    fetchPicsumPosts(sysUserId);
                });
            } else {
                sysUserId = row.id;
                fetchPicsumPosts(sysUserId);
            }
        });
    } catch (e) {
        console.error("Seeding failed:", e.message);
    }
}

async function fetchPicsumPosts(userId) {
    try {
        console.log("Fetching live data from Picsum API...");
        const randomPage = Math.floor(Math.random() * 10) + 1;
        const response = await axios.get(`https://picsum.photos/v2/list?page=${randomPage}&limit=15`);
        const posts = response.data; // Array of { id, author, width, height, url, download_url }
        
        for (const p of posts) {
            const imageUrl = p.download_url;
            const caption = `Stunning capture by ${p.author}`;
            
            db.get(`SELECT id FROM posts WHERE media_url = ?`, [imageUrl], (err, row) => {
                if (!row) {
                    db.run(`INSERT INTO posts (user_id, type, content_text, media_url) VALUES (?, 'IMAGE', ?, ?)`,
                        [userId, caption, imageUrl]
                    );
                }
            });
        }
        console.log("Database seeded successfully with real images!");
    } catch (e) {
        console.error("Picsum fetching error:", e.message);
    }
}
// React Router catch-all: send any non-API requests to the React app
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Real-Time Server running on http://localhost:${PORT}`);
    // Run seeder once on startup
    seedRedditData();
});
