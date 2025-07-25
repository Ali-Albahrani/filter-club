# Filter Club Backend

Express.js API backend for the Filter Club coffee tasting application.

## Features

- Session management for coffee tastings
- Voting system with rankings
- Results calculation
- MongoDB integration

## API Endpoints

- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get a specific session
- `PUT /api/sessions/:id` - Update a session (add votes/results)
- `DELETE /api/sessions/:id` - Delete a session

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (set automatically by Render)
- `NODE_ENV` - Environment (production/development)

## Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following configuration:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if deploying from monorepo)
4. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
5. Deploy!

## Local Development

1. Install dependencies: `npm install`
2. Copy `env.example` to `.env` and configure
3. Run: `npm run dev`
