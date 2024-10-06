# 🎥 Video Hosting Platform Backend (YouTube Clone)

Welcome to the **Video Hosting Platform Backend**. This project is a complete backend solution for a video hosting platform, similar to YouTube. It includes all the necessary features such as authentication, video uploading, liking, commenting, subscribing, playlist management, and more. Built using modern web technologies, this project adheres to best practices in security and architecture.

---

## 📑 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Videos](#videos)
  - [Comments](#comments)
  - [Likes](#likes)
  - [Playlists](#playlists)
  - [Subscriptions](#subscriptions)
  - [Tweets](#tweets)
  - [User](#user)
  - [Health Check](#health-check)

---

## 🚀 Features

- **Authentication & Authorization**: 
  - Secure login and signup using JWT (JSON Web Tokens) for access tokens and refresh tokens.
  - Password encryption using `bcrypt`.
- **Video Management**:
  - Upload videos with thumbnails.
  - Edit, delete, and publish/unpublish videos.
  - Get all videos, single video, or videos by channel.
- **User Interactions**:
  - Comment on videos and reply to comments.
  - Like/dislike videos and comments.
- **Subscription System**:
  - Subscribe and unsubscribe from channels.
  - View subscribers and subscribed channels.
- **Playlist Management**:
  - Create, update, and delete playlists.
  - Add/remove videos from playlists.
- **Tweets**:
  - Users can create, update, delete, and view their tweets.
- **User Profile**:
  - Edit user information, change profile avatar and cover image.
  - View user’s channel profile and watch history.
  
---

## 🛠 Tech Stack

- **Node.js**: Backend runtime.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user, video, comment, and playlist data.
- **Mongoose**: ODM for MongoDB to manage schema and relationships.
- **JWT**: JSON Web Token for secure authentication and authorization.
- **bcrypt**: Password hashing for secure storage.
- **Multer**: File upload handling for videos, thumbnails, avatars, and cover images.
- **Cloud Storage**: Used cloudinary for the Video and image storage. 

---



## 🛠 Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/VaibhavRtd7/YoutuebClone-Backend.git
   cd YoutuebClone-Backend

2. **Install Dependencies:**
   ```bash
     npm install
   
3. **Set the Environment Variables: Create a .env file in the root directory and add the following environment variables:**
   ```bash
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/video-platform
   JWT_SECRET=<your_jwt_secret>
   REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
   
4. **Start the server:**
    ```bash
     npm start

The server will start running on http://localhost:5000 or the port you specified in the .env file.

## 🔗 API Endpoints

### 🔑 Authentication

| Method | Endpoint               | Description                      |
|--------|-------------------------|----------------------------------|
| POST   | `/auth/register`         | Register a new user              |
| POST   | `/auth/login`            | Login and get JWT access token   |
| POST   | `/auth/logout`           | Logout user and invalidate token |
| POST   | `/auth/refresh-token`    | Get a new access token           |
| PATCH  | `/auth/change-password`  | Change user password             |

### 🎥 Videos

| Method | Endpoint                        | Description                                |
|--------|----------------------------------|--------------------------------------------|
| GET    | `/videos`                       | Get all videos                             |
| GET    | `/videos/:videoId`              | Get a single video by ID                   |
| POST   | `/videos`                       | Upload a new video (with thumbnail)        |
| PATCH  | `/videos/:videoId`              | Update video information (with thumbnail)  |
| DELETE | `/videos/:videoId`              | Delete a video                             |
| PATCH  | `/videos/toggle/publish/:videoId`| Toggle video publish/unpublish status      |

### 💬 Comments

| Method | Endpoint                          | Description                             |
|--------|------------------------------------|-----------------------------------------|
| GET    | `/comments/:videoId`               | Get comments for a specific video       |
| POST   | `/comments/:videoId`               | Add a comment to a video                |
| PATCH  | `/comments/c/:commentId`           | Update an existing comment              |
| DELETE | `/comments/c/:commentId`           | Delete a comment                        |

### 👍 Likes

| Method | Endpoint                        | Description                             |
|--------|----------------------------------|-----------------------------------------|
| POST   | `/likes/toggle/v/:videoId`       | Like or dislike a video                 |
| POST   | `/likes/toggle/c/:commentId`     | Like or dislike a comment               |
| GET    | `/likes/videos`                 | Get a list of videos the user has liked |

### 📂 Playlists

| Method | Endpoint                               | Description                                |
|--------|-----------------------------------------|--------------------------------------------|
| POST   | `/playlists`                           | Create a new playlist                      |
| GET    | `/playlists/:playlistId`               | Get details of a specific playlist         |
| PATCH  | `/playlists/:playlistId`               | Update playlist details                    |
| DELETE | `/playlists/:playlistId`               | Delete a playlist                          |
| PATCH  | `/playlists/add/:videoId/:playlistId`  | Add a video to a playlist                  |
| PATCH  | `/playlists/remove/:videoId/:playlistId`| Remove a video from a playlist             |
| GET    | `/playlists/user/:userId`              | Get all playlists for a specific user      |

### 📢 Subscriptions

| Method | Endpoint                            | Description                                 |
|--------|--------------------------------------|---------------------------------------------|
| POST   | `/subscriptions/c/:channelId`        | Subscribe/unsubscribe to/from a channel     |
| GET    | `/subscriptions/c/:channelId`        | Get subscribers of a specific channel       |
| GET    | `/subscriptions/u/:subscriberId`     | Get channels the user is subscribed to      |

### 🐦 Tweets

| Method | Endpoint                   | Description                                  |
|--------|-----------------------------|----------------------------------------------|
| POST   | `/tweets`                   | Create a new tweet                           |
| GET    | `/tweets/user/:userId`      | Get all tweets from a specific user          |
| PATCH  | `/tweets/:tweetId`          | Update a tweet                               |
| DELETE | `/tweets/:tweetId`          | Delete a tweet                               |

### 👤 User

| Method | Endpoint                         | Description                                 |
|--------|-----------------------------------|---------------------------------------------|
| GET    | `/users/current-user`             | Get current logged-in user information      |
| PATCH  | `/users/update-account`           | Update user account details                 |
| PATCH  | `/users/avatar`                   | Update user profile picture (avatar)        |
| PATCH  | `/users/cover-image`              | Update user cover image                     |
| GET    | `/users/c/:username`              | Get a specific user's channel profile       |
| GET    | `/users/history`                  | Get the logged-in user’s watch history      |

### 🩺 Health Check

| Method | Endpoint       | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/health-check`| Check if the API is running     |
