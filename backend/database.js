const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (this will create 'social-media.db' if it doesn't exist)
const dbPath = path.resolve(__dirname, 'social-media.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Enable foreign key constraints
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) console.error("Error enabling foreign keys:", err);
        });

        // Initialize our database schema
        createTables();
    }
});

function createTables() {
    // 1. Users Table
    // Stores all our registered users. 'email' and 'username' must be unique.
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // 2. Posts Table
    // Stores text, image, and video posts. It references the 'users' table via 'user_id' (Foreign Key)
    const createPostsTable = `
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('TEXT', 'IMAGE', 'VIDEO')),
            content_text TEXT,
            media_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    // 3. Likes Table
    // Stores which user liked which post.
    // The UNIQUE(post_id, user_id) constraint prevents a user from liking the same post twice.
    const createLikesTable = `
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(post_id, user_id)
        )
    `;

    // 4. OTPs Table for Email Verification
    const createOtpsTable = `
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            otp_code TEXT NOT NULL,
            expires_at DATETIME NOT NULL
        )
    `;

    // 5. Comments Table for real interactions
    const createCommentsTable = `
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            comment_text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    // Run the queries in order (serialized ensures one runs after the other)
    db.serialize(() => {
        db.run(createUsersTable, (err) => {
            if (err) console.error("Error creating users table:", err);
            else console.log("Users table initialized.");
        });
        db.run(createPostsTable, (err) => {
            if (err) console.error("Error creating posts table:", err);
            else console.log("Posts table initialized.");
        });
        db.run(createLikesTable, (err) => {
            if (err) console.error("Error creating likes table:", err);
            else console.log("Likes table initialized.");
        });
        db.run(createOtpsTable, (err) => {
            if (err) console.error("Error creating otps table:", err);
            else console.log("OTPs table initialized.");
        });
        db.run(createCommentsTable, (err) => {
            if (err) console.error("Error creating comments table:", err);
            else console.log("Comments table initialized.");
        });
    });
}

// Export the db connection so we can use it in our Express server to query data
module.exports = db;
