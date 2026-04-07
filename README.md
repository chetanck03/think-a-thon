# StartupOps Platform

A comprehensive digital platform designed for early-stage founders to streamline startup operations, validate business ideas, collaborate effectively with teams, and gain data-driven insights for informed decision-making.

![StartupOps Platform](./public/img/StartupOps.png)

## Overview

StartupOps Platform provides an integrated suite of tools that address the core challenges faced by startup founders during the critical early stages of business development. The platform combines project management, team collaboration, feedback collection, and analytics in a unified interface, enabling founders to focus on building their vision while maintaining operational excellence.

## Key Features

### Workspace Management
![Workspace Overview](./public/img/workspace.png)

Create and manage dedicated workspaces for your startup projects. Each workspace serves as a centralized hub for all project-related activities, team collaboration, and resource management.

### Task Management & Milestone Tracking
![Task Management](./public/img/tasks.png) ![Milestone Timeline](./public/img/milestone.png)

- Comprehensive task board with drag-and-drop functionality
- Milestone timeline visualization for project planning
- Progress tracking and deadline management
- Task assignment and priority management

### Team Collaboration
![Team Management](./public/img/team.png) ![Real-time Chat](./public/img/real-time-chat.png)

- Team member management and role-based access control
- Real-time chat functionality with file sharing capabilities
- Channel-based communication system
- Live collaboration features powered by WebSocket technology

### Analytics & Insights Dashboard
![Analytics Dashboard](./public/img/analytics.png) ![Dashboard Overview](./public/img/dashboard.png)

- Comprehensive analytics dashboard with key performance indicators
- Progress visualization through interactive charts and graphs
- Data-driven insights for strategic decision making
- Performance metrics tracking across all workspace activities

### AI-Powered Insights
![AI Insights](./public/img/ai-insights.png)

- Intelligent task recommendations based on project patterns
- AI-generated insights for business growth opportunities
- Automated pitch deck generation for investor presentations
- Smart suggestions for workflow optimization

### Feedback Collection System
![Feedback Management](./public/img/feedback.png)

- Structured feedback collection from stakeholders and customers
- Public feedback forms with shareable links
- Feedback analysis and categorization
- Response tracking and follow-up management

## Technology Stack

### Frontend Architecture
- **Next.js 16** - React-based framework with App Router
- **React 19** - Latest React features and optimizations
- **TypeScript** - Type-safe development environment
- **Tailwind CSS 4** - Utility-first CSS framework
- **Tanstack React Query** - Server state management
- **Zustand** - Client-side state management
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization library
- **Lucide React** - Modern icon library
- **Google OAuth** - Authentication integration

### Backend Infrastructure
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **PostgreSQL** - Relational database system
- **Prisma ORM** - Database toolkit and query builder
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing and security
- **Google Generative AI** - AI-powered insights
- **Cloudinary** - Media management and optimization
- **Nodemailer** - Email service integration

## System Requirements

- Node.js 18.0 or higher
- PostgreSQL 12.0 or higher
- npm 8.0 or higher (or yarn equivalent)
- Modern web browser with ES2020 support

## Installation & Setup

### Prerequisites Setup

1. **Database Configuration**
   Ensure PostgreSQL is installed and running on your system. Create a new database for the project:
   ```sql
   CREATE DATABASE startupops;
   ```

2. **Environment Configuration**
   Copy the environment template files and configure them with your specific settings:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Edit `server/.env` with your database connection string and other required configurations:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/startupops"
   JWT_SECRET="your-secure-jwt-secret"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. **Return to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Edit `.env` with your API endpoints:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:3000`

### Development Workflow

For optimal development experience, run both servers simultaneously:

```bash
# Terminal 1 - Backend Server
cd server && npm run dev

# Terminal 2 - Frontend Server  
npm run dev
```

## Deployment Guide

### Production Deployment Architecture

The StartupOps Platform is designed for scalable deployment using modern cloud infrastructure:

- **Frontend**: Deployed on Vercel for optimal Next.js performance
- **Backend**: Deployed on Render for reliable API hosting
- **Database**: PostgreSQL hosted on cloud providers (Render, Railway, or Supabase)

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Vercel automatically detects Next.js configuration

2. **Environment Variables**
   Configure the following environment variables in Vercel dashboard:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
   ```

3. **Build Configuration**
   Vercel automatically handles build and deployment for Next.js applications.

### Backend Deployment (Render)

1. **Service Configuration**
   - Create a new Web Service on Render
   - Set root directory to `server`
   - Configure build command: `npm run build`
   - Configure start command: `npm start`

2. **Environment Variables**
   Configure the following in Render dashboard:
   ```env
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

3. **Database Setup**
   - Create PostgreSQL database on Render or preferred provider
   - Run database migrations: `npm run db:migrate`

### Environment Configuration

#### Frontend Environment Variables (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

#### Backend Environment Variables (server/.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/startupops
JWT_SECRET=your-secure-jwt-secret-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GEMINI_API_KEY=your-google-gemini-api-key
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
```

## Project Architecture

```
startupops/
├── app/                          # Next.js App Router (Frontend)
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/               # User login interface
│   │   └── register/            # User registration interface
│   ├── dashboard/               # Main dashboard interface
│   ├── workspace/               # Workspace management
│   │   └── [id]/               # Dynamic workspace pages
│   │       ├── analytics/       # Workspace analytics
│   │       ├── chat/           # Team communication
│   │       ├── feedback/       # Feedback management
│   │       ├── insights/       # AI-powered insights
│   │       ├── milestones/     # Milestone tracking
│   │       ├── pitch/          # Pitch generation
│   │       ├── tasks/          # Task management
│   │       └── team/           # Team management
│   ├── feedback/[link]/        # Public feedback collection
│   ├── invite/[token]/         # Team invitation handling
│   ├── pricing/                # Pricing information
│   ├── profile/                # User profile management
│   └── settings/               # Application settings
├── components/                  # Reusable React Components
│   ├── ai/                     # AI-related components
│   ├── analytics/              # Analytics visualizations
│   ├── auth/                   # Authentication components
│   ├── chat/                   # Chat and communication
│   ├── dashboard/              # Dashboard components
│   ├── feedback/               # Feedback collection UI
│   ├── milestones/             # Milestone visualization
│   ├── pitch/                  # Pitch generation tools
│   ├── tasks/                  # Task management UI
│   ├── ui/                     # Base UI components
│   └── workspace/              # Workspace-specific components
├── lib/                        # Frontend Utilities
│   ├── api.ts                  # API client configuration
│   ├── stores/                 # State management
│   └── utils.ts                # Helper functions
├── server/                     # Backend API Server
│   ├── index.ts                # Server entry point
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Express middleware
│   ├── prisma/                 # Database schema and migrations
│   │   └── schema.prisma       # Database schema definition
│   └── utils/                  # Server utilities
│       ├── cloudinary.ts       # Media management
│       ├── email.ts            # Email services
│       ├── gemini.ts           # AI integration
│       └── google-oauth.ts     # OAuth implementation
└── public/                     # Static Assets
    └── img/                    # Application screenshots and assets
```

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user account | None |
| POST | `/api/auth/login` | Authenticate user credentials | None |
| GET | `/api/auth/me` | Retrieve current user profile | JWT Required |
| POST | `/api/auth/logout` | Invalidate user session | JWT Required |

### Workspace Management
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/workspaces` | Create new workspace | JWT Required |
| GET | `/api/workspaces` | List user workspaces | JWT Required |
| GET | `/api/workspaces/:id` | Get workspace details | JWT Required |
| PUT | `/api/workspaces/:id` | Update workspace information | JWT Required |
| DELETE | `/api/workspaces/:id` | Delete workspace | JWT Required |

### Task Management
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/tasks` | Create new task | JWT Required |
| GET | `/api/tasks/workspace/:workspaceId` | Get workspace tasks | JWT Required |
| PUT | `/api/tasks/:id` | Update task details | JWT Required |
| DELETE | `/api/tasks/:id` | Delete task | JWT Required |
| PATCH | `/api/tasks/:id/status` | Update task status | JWT Required |

### Milestone Tracking
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/milestones` | Create milestone | JWT Required |
| GET | `/api/milestones/workspace/:workspaceId` | Get workspace milestones | JWT Required |
| PUT | `/api/milestones/:id` | Update milestone | JWT Required |
| DELETE | `/api/milestones/:id` | Delete milestone | JWT Required |

### Feedback System
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/feedback/request` | Create feedback request | JWT Required |
| POST | `/api/feedback/submit/:shareableLink` | Submit feedback (public) | None |
| GET | `/api/feedback/workspace/:workspaceId` | Get workspace feedback | JWT Required |
| PUT | `/api/feedback/:id/address` | Mark feedback as addressed | JWT Required |

### Analytics & Insights
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/analytics/workspace/:workspaceId` | Get workspace analytics | JWT Required |
| GET | `/api/insights/ai/:workspaceId` | Get AI-generated insights | JWT Required |

## Development & Testing

### Development Commands

#### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
```

#### Backend Development
```bash
cd server
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
```

### Database Management

#### Development Database Setup
```bash
cd server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to development database
```

#### Production Database Migration
```bash
cd server
npm run db:migrate   # Apply migrations to production database
```

#### Database Inspection
```bash
cd server
npx prisma studio    # Open Prisma Studio for database inspection
```

### Code Quality & Standards

The project follows modern development practices:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Prisma**: Type-safe database operations
- **React Compiler**: Optimized React component compilation

### Testing Strategy

While comprehensive testing is planned for future iterations, the current development approach includes:

- **Type Safety**: TypeScript provides compile-time error detection
- **Database Validation**: Prisma schema validation
- **API Testing**: Manual testing through development environment
- **Browser Testing**: Cross-browser compatibility verification

## Troubleshooting Guide

### Common Issues and Solutions

#### Backend Server Issues

**Problem**: Backend server fails to start
```bash
# Solution: Reinstall dependencies and reset database
cd server
rm -rf node_modules package-lock.json
npm install
npm run db:push
npm run dev
```

**Problem**: Database connection errors
```bash
# Solution: Verify database URL and reset connection
cd server
# Check DATABASE_URL in .env file
npm run db:push -- --force-reset
```

#### Frontend Connection Issues

**Problem**: Frontend cannot connect to backend API
- Verify backend server is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in frontend `.env` file
- Ensure CORS is properly configured in backend

**Problem**: Real-time features not working
- Verify `NEXT_PUBLIC_SOCKET_URL` configuration
- Check Socket.io server status in backend logs
- Ensure WebSocket connections are not blocked by firewall

#### Development Environment Issues

**Problem**: TypeScript compilation errors
```bash
# Solution: Clear TypeScript cache and rebuild
rm -rf .next
npm run build
```

**Problem**: Database schema out of sync
```bash
# Solution: Reset and regenerate database
cd server
npm run db:push -- --force-reset
npm run db:generate
```

### Performance Optimization

#### Frontend Optimization
- Enable React Compiler for optimized component rendering
- Implement proper image optimization using Next.js Image component
- Use React Query for efficient data fetching and caching

#### Backend Optimization
- Implement database connection pooling
- Add Redis caching for frequently accessed data
- Optimize Prisma queries with proper indexing

### Security Considerations

- JWT tokens are securely generated and validated
- Password hashing uses bcrypt with appropriate salt rounds
- CORS is configured to allow only trusted origins
- Input validation is implemented using express-validator
- File uploads are handled securely through Cloudinary

## Getting Started Checklist

1. **Prerequisites Installation**
   - [ ] Node.js 18+ installed
   - [ ] PostgreSQL database setup
   - [ ] Git repository cloned

2. **Backend Configuration**
   - [ ] Navigate to server directory
   - [ ] Install dependencies (`npm install`)
   - [ ] Configure environment variables
   - [ ] Initialize database (`npm run db:push`)
   - [ ] Start backend server (`npm run dev`)

3. **Frontend Configuration**
   - [ ] Return to project root
   - [ ] Install dependencies (`npm install`)
   - [ ] Configure environment variables
   - [ ] Start frontend server (`npm run dev`)

4. **Verification**
   - [ ] Backend API accessible at `http://localhost:3001`
   - [ ] Frontend application accessible at `http://localhost:3000`
   - [ ] User registration and login functional
   - [ ] Workspace creation working
   - [ ] Real-time features operational

## Contributing Guidelines

This project welcomes contributions from the developer community. To contribute:

1. **Fork the Repository**
   Create a personal fork of the project repository

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Standards**
   - Follow TypeScript best practices
   - Maintain consistent code formatting
   - Add appropriate type definitions
   - Test functionality thoroughly

4. **Submit Pull Request**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Ensure all checks pass

## License & Usage

This project is released under the MIT License, making it freely available for both personal and commercial use. The codebase serves as an excellent foundation for startup management platforms and can be adapted for various business needs.

**Commercial Usage**: Permitted under MIT License terms
**Modification**: Encouraged for customization and improvement
**Distribution**: Allowed with proper attribution

---

**StartupOps Platform** - Empowering early-stage founders with comprehensive digital tools for startup success.
