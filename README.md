<<<<<<< HEAD
# MERN Stack Agent Management System

A full-stack web application built with MongoDB, Express.js, React.js, and Node.js for managing agents and distributing CSV/Excel lists among them.

## Features

### 1. Admin User Login
- Secure JWT-based authentication
- Email and password validation
- Automatic redirect to dashboard on successful login
- Error handling for invalid credentials

### 2. Agent Management
- Create new agents with name, email, mobile number (with country code), and password
- View all agents in a responsive grid layout
- Delete agents with confirmation
- Form validation and error handling

### 3. File Upload & Distribution
- Upload CSV, XLSX, and XLS files
- Automatic validation of file format and content
- Required columns: FirstName, Phone, Notes (optional)
- Equal distribution among up to 5 active agents
- Handles remainder items by distributing sequentially
- Real-time upload progress and success feedback

### 4. List Distribution Viewer
- View all uploaded lists with metadata
- Expandable agent distributions showing assigned items
- Delete lists with confirmation
- Responsive design for mobile and desktop

## Technical Stack

- **Frontend**: React.js with React Router for navigation
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Processing**: Multer for uploads, csv-parser and xlsx for parsing
- **Styling**: Custom CSS with responsive design

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mern-agent-management
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/agent-management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**Important**: Change the JWT_SECRET to a secure random string in production.

### 4. Database Setup
Make sure MongoDB is running on your system. If using MongoDB Atlas, update the MONGODB_URI in the .env file with your connection string.

### 5. Seed Admin User
Create the initial admin user by running:
```bash
node backend/scripts/seedAdmin.js
```

This will create an admin user with:
- Email: admin@example.com
- Password: password123

## Running the Application

### Development Mode
To run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Individual Services
To run services separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Usage Instructions

### 1. Login
1. Navigate to http://localhost:3000
2. Use the demo credentials:
   - Email: admin@example.com
   - Password: password123
3. Click "Login" to access the dashboard

### 2. Managing Agents
1. Click on "Manage Agents" tab
2. Click "Add New Agent" to create a new agent
3. Fill in all required fields:
   - Name
   - Email (must be unique)
   - Country Code (select from dropdown)
   - Mobile Number
   - Password (minimum 6 characters)
4. Click "Create Agent" to save
5. View all agents in the grid below
6. Delete agents using the "Delete" button (with confirmation)

### 3. Uploading Lists
1. Click on "Upload Lists" tab
2. Click on the file upload area or drag and drop a file
3. Select a CSV, XLSX, or XLS file with the required columns:
   - **FirstName**: Text field (required)
   - **Phone**: Phone number field (required)
   - **Notes**: Optional text field
4. Click "Upload & Distribute" to process the file
5. The system will automatically distribute items equally among active agents
6. View the distribution summary after successful upload

### 4. Viewing Distributions
1. Click on "View Distributions" tab
2. See all uploaded lists with metadata
3. Click "View Details" to expand a list
4. Click the arrow button next to each agent to see their assigned items
5. Delete lists using the "Delete" button if needed

## File Format Requirements

### CSV Format Example:
```csv
FirstName,Phone,Notes
John,+1234567890,Important client
Jane,+1987654321,Follow up needed
Bob,+1555123456,
```

### Excel Format:
- First row should contain column headers
- Supported columns: FirstName, Phone, Notes
- Column names are case-insensitive
- Variations like "First Name", "first_name" are supported

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new admin (for setup)
- `GET /api/auth/me` - Get current user info

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent by ID
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Lists
- `GET /api/lists` - Get all distribution lists
- `POST /api/lists/upload` - Upload and distribute file
- `GET /api/lists/:id` - Get specific list
- `DELETE /api/lists/:id` - Delete list

## Project Structure

```
mern-agent-management/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Agent.js
│   │   └── List.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── agents.js
│   │   └── lists.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── uploads/ (created automatically)
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentManagement.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FileUpload.js
│   │   │   ├── ListDistribution.js
│   │   │   ├── Login.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
├── .env
├── package.json
└── README.md
```

## Security Features

- JWT-based authentication with token expiration
- Password hashing using bcryptjs
- Input validation and sanitization
- File type validation for uploads
- Protected routes requiring authentication
- CORS configuration for cross-origin requests

## Error Handling

- Comprehensive error messages for user actions
- File upload validation with specific error messages
- Database connection error handling
- Authentication error handling with appropriate redirects
- Form validation with real-time feedback

## Responsive Design

- Mobile-first responsive design
- Optimized layouts for tablets and desktops
- Touch-friendly interface elements
- Accessible form controls and navigation

## Production Deployment

### Environment Variables for Production:
```env
MONGODB_URI=your_production_mongodb_connection_string
JWT_SECRET=your_secure_random_jwt_secret
PORT=5000
NODE_ENV=production
```

### Build for Production:
```bash
npm run build
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file
   - Verify network connectivity for MongoDB Atlas

2. **File Upload Issues**
   - Check file format (CSV, XLSX, XLS only)
   - Ensure required columns are present
   - Verify file size is under 5MB

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env file
   - Verify admin user exists in database

4. **Agent Creation Issues**
   - Ensure all required fields are filled
   - Check for duplicate email addresses
   - Verify password meets minimum requirements

## License

This project is created for educational purposes as part of a MERN stack developer assessment.

## Support

For any issues or questions, please check the troubleshooting section above or review the error messages displayed in the application interface.
=======
# Agent-Management-System
A full-stack MERN application for managing agents and distributing CSV/Excel data among them. Features JWT authentication, file upload with visual progress indicators, and automated equal distribution algorithm. Built with React.js, Node.js, Express.js, and MongoDB.
>>>>>>> e3ba3ff2a1ecb3939b40539469e1251d78b93e45
