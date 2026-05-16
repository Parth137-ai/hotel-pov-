# Grand Palace Hotel POS — Railway Deployment Guide

## ✅ Why Railway (not Vercel)?

This POS system uses **Socket.io** for real-time sync between devices.  
Vercel is **serverless** (stateless, kills connections after ~10s) — **incompatible** with WebSockets.  
Railway runs a **persistent Node.js process** — perfect for Socket.io.

## 🚀 Deploy on Railway (Free)

1. Go to **https://railway.app**
2. Sign in with **GitHub**
3. Click **"New Project"** → **"Deploy from GitHub Repo"**
4. Select your repo: **`Parth137-ai/hotel-pov-`**
5. Railway auto-detects Node.js and runs `npm start`
6. Click **"Generate Domain"** for a free URL like `hotel-pov-production.up.railway.app`

That's it! No extra config needed.

## 📦 Project Structure

```
/
├── server.js          ← Main server (entry point)
├── package.json       ← { "start": "node server.js" }
├── index.html         ← Frontend app
├── styles/main.css
├── js/app.js
├── services/socket.service.js
├── utils/helpers.js
└── assets/
```
