# PlayTube 🎥

A full-stack YouTube-inspired video streaming platform built with a modern production-style architecture. PlayTube supports adaptive HLS streaming, background video processing, cloud storage, authentication, playlists, comments, likes, subscriptions, watch history, and more.

---

# 🚀 Live Demo

### Frontend

[https://playtube-tau.vercel.app](https://playtube-tau.vercel.app)

### Backend API

[https://playtube-awdo.onrender.com](https://playtube-awdo.onrender.com)

---

# ✨ Features

## Authentication

* Email & Password Authentication
* Google OAuth Login
* JWT Authentication
* Refresh Token Support
* Secure HTTP Only Cookies
* Email Verification
* Forgot Password
* Password Reset using OTP

---

## User

* Create Account
* Login / Logout
* Update Profile
* Profile Photo Upload
* Watch History
* Watch Later
* Like Videos
* Subscribe / Unsubscribe Channels

---

## Channel

* Create Channel
* Update Channel
* Banner Upload
* Logo Upload
* Handle System
* Subscriber Count
* Video Count

---

## Video

* Upload Videos
* Upload Shorts
* Thumbnail Upload
* Delete Video
* Update Video
* Publish / Unpublish
* Search Videos
* View Counter
* Like Counter

---

## Comments

* Add Comment
* View Comments
* Delete Comments

---

## Playlist

* Create Playlist
* Add Videos
* Remove Videos

---

# ⚡ Production Video Processing Pipeline

Unlike a normal CRUD project, every uploaded video is processed asynchronously.

```
Client Upload
      │
      ▼
Express + Multer
      │
      ▼
Cloudinary (Thumbnail)
      │
      ▼
Amazon S3 (Original Video)
      │
      ▼
RabbitMQ Queue
      │
      ▼
Background Worker
      │
      ▼
FFmpeg
      │
      ├────────► 360p HLS
      │
      ├────────► 720p HLS
      │
      ├────────► Sprite Thumbnail
      │
      ▼
Amazon S3
      │
      ▼
Prisma Database Update
      │
      ▼
Frontend Streaming using HLS.js
```

---

# 🎬 Adaptive Streaming

Implemented adaptive HLS streaming similar to YouTube.

Features

* HLS (.m3u8)
* 360p Streaming
* 720p Streaming
* Automatic Quality Detection
* Manual Quality Switching
* Adaptive Bitrate Streaming

---

# 📸 Timeline Preview

Implemented YouTube-style hover preview.

* Sprite Sheet Generation
* FFmpeg Sprite Creation
* Timeline Preview on Hover

---

# ☁️ Cloud Storage

Amazon S3

Stores

* Original Videos
* HLS Segments
* Master Playlist
* Sprite Images

Cloudinary

Stores

* Thumbnails
* User Profile Photos
* Channel Logos
* Channel Banners

---

# 📨 Background Jobs

RabbitMQ is used for asynchronous processing.

Queue

```
video-processing
```

Worker Responsibilities

* Download Original Video
* Transcode Video
* Generate HLS
* Generate Sprite
* Upload Assets
* Update Database
* Cleanup Temporary Files

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Redux Toolkit
* React Router
* Tailwind CSS
* Axios
* HLS.js
* Framer Motion
* Lucide Icons

---

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* Multer
* Passport.js
* Nodemailer
* Cloudinary
* RabbitMQ
* FFmpeg
* Amazon S3

---

# 🗄 Database

* PostgreSQL
* Prisma ORM

Models

* User
* Channel
* Video
* Comment
* Like
* Playlist
* PlaylistVideo
* Subscription
* WatchHistory
* WatchLater
* Post

---

# 📂 Project Structure

```
Frontend
│
├── components
├── pages
├── redux
├── services
├── hooks
├── utils
└── types

Backend
│
├── controllers
├── middleware
├── routes
├── workers
├── rabbitmq
├── utils
├── services
├── prisma
├── config
└── lib
```

---

# 🔐 Security

* JWT Authentication
* HTTP Only Cookies
* Password Hashing (bcrypt)
* Input Validation
* Protected Routes
* Email Verification
* Password Reset Tokens

---

# ⚙️ Installation

Clone repository

```bash
git clone https://github.com/VoidLakshay/playtube.git
```

Backend

```bash
cd Backend

npm install

npx prisma generate

npx prisma migrate deploy

npm run dev
```

Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Backend

```env
DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

RABBIT_URL=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Frontend

```env
VITE_API_URL=
```

---

# 📈 Future Improvements

* 1080p Streaming
* Live Streaming
* Video Analytics
* AI Subtitle Generation
* AI Video Recommendation
* WebSockets
* Notifications
* Video Chapters
* Multi-language Support
* Video Reporting
* Admin Dashboard

---

# 👨‍💻 Author

**Lakshay Vashisth**

GitHub

[https://github.com/VoidLakshay](https://github.com/VoidLakshay)

LinkedIn

(Add LinkedIn URL)

---

# ⭐ If you like this project

Give this repository a ⭐ on GitHub.

---


