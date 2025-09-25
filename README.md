# Smart Hustle AI - Modern CMS & Learning Platform

<div align="center">
  
![Smart Hustle AI](https://img.shields.io/badge/Smart_Hustle-AI-cyan.svg?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

</div>

<div align="center">
  <p>A modern, full-featured content management system (CMS) and learning platform built with React, Node.js, and AI integration.</p>
</div>

## ✨ Features

- 🎨 **Modern Admin Interface** - Beautiful, responsive dashboard with dark theme
- 📊 **Analytics Dashboard** - Track user engagement, course enrollments, and content performance
- 📝 **Rich Content Management** - Create and manage blog posts, courses, and media
- 🏷️ **Comprehensive Tagging** - Organize content with categories and tags
- 💬 **Comments System** - Advanced moderation tools for user engagement
- 📧 **Email Campaigns** - Create, schedule, and analyze email marketing campaigns
- 📱 **Responsive Design** - Optimized for all devices from mobile to desktop
- 🔒 **User Authentication** - Secure login and registration system
- 🎓 **Course Management** - Create, manage, and track learning content and enrollments

## 🚀 Tech Stack

### Frontend
- **React** - Modern UI library for building interactive interfaces
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Vite** - Next-generation frontend build tooling
- **React Router** - Navigation and routing for single-page applications
- **Axios** - Promise-based HTTP client for API requests
- **React Icons** - Popular icon sets for React projects

### Backend
- **Node.js** - JavaScript runtime for building server-side applications
- **Express** - Web framework for Node.js
- **Sequelize** - ORM for Node.js with MySQL
- **MySQL** - Relational database for data storage
- **JWT** - Secure authentication with JSON Web Tokens
- **Multer** - File upload handling

## 📂 Project Structure

```
smart-hustle-ai/
├── frontend/               # React frontend application
│   ├── public/             # Public assets
│   ├── src/                # React source code
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
└── backend/                # Node.js backend application
    ├── config/             # Configuration files
    ├── middleware/         # Express middleware
    ├── migrations/         # Database migrations
    ├── models/             # Sequelize models
    ├── routes/             # API route definitions
    ├── scripts/            # Utility scripts
    ├── seeders/            # Database seed files
    ├── uploads/            # Uploaded files storage
    ├── index.js            # Main application entry
    └── package.json        # Backend dependencies
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL (v8+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Denis060/Smart_Hustle_AI_CMS.git
   cd Smart_Hustle_AI_CMS
   ```

2. **Set up the backend:**
   ```sh
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `backend` directory:
   ```
   DB_NAME=smart_hustle
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret
   ```

4. **Run database migrations:**
   ```sh
   npx sequelize-cli db:migrate
   ```

5. **Set up the frontend:**
   ```sh
   cd ../frontend
   npm install
   ```

## 🖥️ Running the Application

### Development Mode

1. **Start the backend server:**
   ```sh
   cd backend
   node index.js
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```sh
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or next available port)

### Production Mode

1. **Build the frontend:**
   ```sh
   cd frontend
   npm run build
   ```

2. **Configure the backend for production:**
   Update the `.env` file in the backend directory:
   ```
   NODE_ENV=production
   ```

3. **Start the backend server:**
   ```sh
   cd backend
   node index.js
   ```

## 🔑 Admin Access

1. **Create an admin user:**
   Use the `/api/auth/register` endpoint with:
   ```json
   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "yourpassword"
   }
   ```

2. **Access the admin dashboard:**
   Navigate to `http://localhost:5173/admin` and log in with your credentials.

## 📱 Key Admin Features

- **Analytics Dashboard** - Visualize site performance metrics
- **Posts Management** - Create, edit, and publish blog content
- **Courses Management** - Manage learning materials and enrollments
- **Media Library** - Upload and organize images and media
- **Categories & Tags** - Organize content with taxonomies
- **Comments Management** - Moderate user comments and interactions
- **Email Campaigns** - Create and manage email marketing
- **Subscriber Management** - Handle newsletter subscriptions
- **Site Settings** - Configure global website settings

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

- **Denis** - [Denis060](https://github.com/Denis060)

## 🙏 Acknowledgments

- Thanks to all the open-source projects that made this possible
- Special thanks to the contributors and testers

---

<div align="center">
  <p>© 2025 Smart Hustle AI. All Rights Reserved.</p>
</div>

---

For any issues, check the terminal output for errors and ensure you are in the correct directory.
