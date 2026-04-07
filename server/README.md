# StartupOps Backend

Express.js API server with Socket.io for real-time features.

## Tech Stack
- Express.js
- Socket.io
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL and JWT secret

3. **Database setup**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/workspace/:workspaceId` - Get workspace tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Milestones
- `POST /api/milestones` - Create milestone
- `GET /api/milestones/workspace/:workspaceId` - Get workspace milestones
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

### Feedback
- `POST /api/feedback/request` - Create feedback request
- `POST /api/feedback/submit/:shareableLink` - Submit feedback
- `GET /api/feedback/workspace/:workspaceId` - Get workspace feedback
- `PUT /api/feedback/:id/address` - Mark feedback as addressed

### Analytics
- `GET /api/analytics/workspace/:workspaceId` - Get workspace analytics

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Render deployment instructions.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
