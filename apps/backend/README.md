# Backend - Sustainable Construction Management API

TypeScript-based Express.js backend for the Sustainable Construction Project Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Yarn 1.22.22

### Installation

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
# Then edit .env with your actual values

# Run in development mode
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files (database, cloudinary, email)
├── middleware/      # Express middleware (auth, error handling, upload)
├── models/          # Mongoose models
├── routes/          # API routes
├── controllers/     # Route controllers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🔧 Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Run production server
- `yarn check-types` - Type check without building
- `yarn lint` - Lint TypeScript files

## 🌍 Environment Variables

See `.env.example` for all required environment variables.

## 📚 API Documentation

Once the server is running, visit:
- Health check: `http://localhost:5000/health`
- API info: `http://localhost:5000/api`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 👥 User Roles

- **ADMIN** - Full system access
- **PROJECT_MANAGER** - Manage projects and resources
- **INSPECTOR** - Update sustainability metrics and conduct inspections
- **SUPPLIER** - Update material delivery status
- **VIEWER** - Read-only access

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Email:** SendGrid
- **Validation:** Joi
