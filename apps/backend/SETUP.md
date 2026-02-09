# TypeScript Backend Setup Guide

## ✅ What Has Been Created

Your TypeScript backend has been fully initialized with the following structure:

### 📁 Directory Structure
```
apps/backend/
├── src/
│   ├── config/
│   │   ├── database.ts          ✅ MongoDB connection
│   │   ├── cloudinary.ts        ✅ File storage config
│   │   └── email.ts             ✅ Email service (SendGrid)
│   ├── middleware/
│   │   ├── auth.ts              ✅ JWT authentication
│   │   ├── roleCheck.ts         ✅ Role-based authorization
│   │   ├── errorHandler.ts      ✅ Error handling
│   │   └── upload.ts            ✅ File upload (Multer)
│   ├── types/
│   │   └── index.ts             ✅ TypeScript type definitions
│   ├── app.ts                   ✅ Express app setup
│   └── server.ts                ✅ Server entry point
├── uploads/                     ✅ File upload directory
├── .env                         ✅ Environment variables (configure this!)
├── .env.example                 ✅ Environment template
├── .gitignore                   ✅ Git ignore rules
├── tsconfig.json                ✅ TypeScript configuration
├── .eslintrc.json               ✅ ESLint configuration
├── nodemon.json                 ✅ Nodemon configuration
├── package.json                 ✅ Dependencies & scripts
└── README.md                    ✅ Documentation
```

## 🚀 Next Steps

### 1. Configure Environment Variables

Edit your `.env` file with actual values:

```bash
# Required configurations:
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-strong-secret-key>
FRONTEND_URL=http://localhost:3000

# Optional (add when ready):
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
SENDGRID_API_KEY=<your-sendgrid-key>
GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

### 2. Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get connection string and add to `.env`

### 3. Run the Backend

```bash
# Development mode (with hot reload)
yarn dev

# Build TypeScript
yarn build

# Production mode
yarn start

# Type checking
yarn check-types

# Linting
yarn lint
```

## 📝 What to Build Next

Based on your project spec, you need to create:

### Models (Component 1 - Lanka)
- [ ] `models/User.ts`
- [ ] `models/Project.ts`
- [ ] `models/Milestone.ts`
- [ ] `models/Sustainability.ts`

### Routes & Controllers (Component 1 - Lanka)
- [ ] `routes/auth.routes.ts` + `controllers/auth.controller.ts`
- [ ] `routes/project.routes.ts` + `controllers/project.controller.ts`
- [ ] `routes/sustainability.routes.ts` + `controllers/sustainability.controller.ts`

### Models (Component 2 - Member 2)
- [ ] `models/Document.ts`
- [ ] `models/Compliance.ts`
- [ ] `models/Inspection.ts`

### Routes & Controllers (Component 2 - Member 2)
- [ ] `routes/document.routes.ts` + `controllers/document.controller.ts`
- [ ] `routes/compliance.routes.ts` + `controllers/compliance.controller.ts`
- [ ] `routes/inspection.routes.ts` + `controllers/inspection.controller.ts`

### Models (Component 3 - Member 3)
- [ ] `models/Material.ts`
- [ ] `models/Equipment.ts`
- [ ] `models/Supplier.ts`

### Routes & Controllers (Component 3 - Member 3)
- [ ] `routes/material.routes.ts` + `controllers/material.controller.ts`
- [ ] `routes/equipment.routes.ts` + `controllers/equipment.controller.ts`
- [ ] `routes/supplier.routes.ts` + `controllers/supplier.controller.ts`

## 🔧 Development Workflow

1. **Create a Model** (e.g., `User.ts`)
   - Define Mongoose schema with TypeScript types
   - Add validation rules
   - Create indexes

2. **Create Controller** (e.g., `auth.controller.ts`)
   - Implement business logic
   - Handle requests/responses
   - Use proper error handling

3. **Create Routes** (e.g., `auth.routes.ts`)
   - Define API endpoints
   - Apply middleware (auth, validation)
   - Connect to controllers

4. **Import in app.ts**
   - Add route to Express app
   - Test with Postman/Thunder Client

## 📚 TypeScript Features Used

- ✅ Strict type checking
- ✅ Interface definitions for all data structures
- ✅ Enum types for constants
- ✅ Type-safe middleware
- ✅ Express Request type extensions
- ✅ Async/await with proper typing

## 🛡️ Security Features

- ✅ Helmet.js for HTTP headers
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15min)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ File upload validation
- ✅ Input validation (Joi)

## 📊 API Endpoints Structure

Once you implement routes, your API will have:

```
GET    /health                           # Health check
GET    /api                              # API info

POST   /api/auth/register                # Register user
POST   /api/auth/login                   # Login user
GET    /api/auth/me                      # Get current user

GET    /api/projects                     # List projects
POST   /api/projects                     # Create project
GET    /api/projects/:id                 # Get project
PUT    /api/projects/:id                 # Update project
DELETE /api/projects/:id                 # Delete project

... (and many more based on your spec)
```

## 🎯 Testing Your Setup

1. Start the server:
   ```bash
   yarn dev
   ```

2. Visit http://localhost:5000/health
   - Should return: `{"success": true, "message": "Server is running"}`

3. Visit http://localhost:5000/api
   - Should return API information

## 💡 Tips

- Use Postman or Thunder Client for API testing
- Check TypeScript errors with `yarn check-types`
- Use ESLint to maintain code quality
- Refer to the project spec for detailed API requirements
- Follow the component ownership (Lanka = Components 1 & 2)

## 🐛 Common Issues

**Port already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**MongoDB connection error:**
- Check your connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

**TypeScript errors:**
```bash
# Check types without running
yarn check-types
```

## 📖 Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Project Specification](../../docs/project-spec.md)
