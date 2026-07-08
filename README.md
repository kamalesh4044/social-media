<div align="center">
  <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" alt="OmniSocial Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px; max-height: 300px; object-fit: cover;" />

  # 🌌 OmniSocial - The Premium Real-Time Network

  <p>
    <strong>A next-generation, high-performance social media platform featuring a stunning glassmorphism UI, real-time WebSocket interactions, and live algorithmic data seeding.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  </p>
</div>

---

## ✨ Features

- **🎨 Premium Glassmorphism UI**: A custom, vibrant dark-mode aesthetic utilizing deep background gradients and `backdrop-filter` for a luxurious frosted glass effect.
- **⚡ Real-Time Engine**: Powered by `Socket.io`, all interactions (new posts, likes, and comments) are broadcasted to all connected clients instantly without refreshing the page.
- **📱 Instagram-Inspired Layout**: Features a fixed left sidebar for seamless navigation and a centralized, highly-focused feed that scales perfectly across devices.
- **🌍 Live Data Seeding**: The backend automatically fetches real, trending, high-quality images from the internet on startup so the feed is never empty.
- **🔐 Secure Authentication**: Includes JWT-based authentication and secure `bcrypt` password hashing.
- **🖼️ Native File Uploads**: Robust backend file handling with `multer` allowing users to upload physical images and videos seamlessly.

---

## 📸 Screenshots

*(Imagine beautiful screenshots of the dark mode glass UI here. Replace these URLs with actual screenshots of the deployed app later!)*

<div align="center">
  <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop" alt="Feed View" width="48%" style="border-radius: 8px; margin-right: 2%;"/>
  <img src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop" alt="Explore View" width="48%" style="border-radius: 8px;"/>
</div>

---

## 🛠️ Architecture

OmniSocial is designed to be lightweight yet immensely powerful, adopting a standard SPA (Single Page Application) architecture coupled with an event-driven Node API.

### Frontend
- **Vite + React**: Chosen for blazing-fast Hot Module Replacement (HMR) and optimized production builds.
- **React Router DOM**: Handles dynamic client-side routing between Home, Explore, and Profile pages.
- **Axios**: Manages standard REST HTTP requests securely attaching JWT tokens.

### Backend
- **Express.js**: REST API routing layer handling authentication, posts, and media serving.
- **Socket.IO**: Maintains constant duplex connections for instant payload delivery.
- **SQLite3**: A self-contained, serverless database engine for rapid development and testing.

---

## 🚀 Getting Started

Follow these steps to run the platform locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/kamalesh4044/social-media.git
cd social-media
```

### 2. Start the Backend
The backend runs on **Port 3000**.
```bash
cd backend
npm install
node server.js
```
*Note: The server will automatically seed the SQLite database with real images upon startup!*

### 3. Start the Frontend
The frontend runs on **Port 5173**. Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Verify Live Functionality
1. Open `http://localhost:5173` in your browser.
2. Sign up for a new account.
3. Open a second window (Incognito) and sign up with a different account.
4. Try uploading a post or dropping a comment in one window—watch it instantly appear in the other!

---

<div align="center">
  <i>Built with passion by Kamalesh</i>
</div>
