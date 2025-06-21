# 🏌️ Golf Shot Transcription App

A full-stack web application that uses AI to analyze golf simulator screenshots and extract shot metrics like speed, distance, spin, and launch angle.

## 🚀 Features

- **AI-Powered Analysis**: Upload golf simulator screenshots and get instant analysis using OpenAI GPT-4o Vision
- **Google OAuth Authentication**: Secure login with Google accounts
- **Shot Dashboard**: View and manage all your analyzed shots
- **Leaderboard**: Compete with other users across different metrics
- **Social Sharing**: Share your best shots with custom URLs
- **Mobile-Friendly**: Responsive design works on all devices

## 🏗️ Architecture

- **Frontend**: Next.js + React + TypeScript + Tailwind CSS (deployed on Vercel)
- **Backend**: Node.js + Express + PostgreSQL (deployed on Render)
- **AI**: OpenAI GPT-4o Vision API for image analysis
- **Database**: PostgreSQL with automatic migrations
- **Authentication**: Google OAuth 2.0 with JWT tokens

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Render's managed PostgreSQL)
- Google OAuth credentials
- OpenAI API key

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd golf-shot-transcription
npm install
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp env.example .env

# Edit .env with your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# - OPENAI_API_KEY
# - JWT_SECRET (generate a secure random string)
# - SESSION_SECRET (generate a secure random string)
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 4. Database Setup

```bash
cd backend
npm run migrate
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - `https://your-backend-domain.onrender.com/auth/google/callback` (production)

### 6. OpenAI API Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your backend `.env` file
3. Ensure you have sufficient credits for GPT-4o Vision API calls

## 🚀 Development

Start both backend and frontend in development mode:

```bash
# From root directory
npm run dev

# Or start individually:
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🌐 Deployment

### Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the `backend` directory as the root
4. Set environment variables in Render dashboard
5. Deploy using the provided `render.yaml` configuration

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
4. Deploy automatically on push to main branch

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/auth/google/callback
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## 📱 Usage

1. **Sign In**: Click "Continue with Google" to authenticate
2. **Upload Shot**: Drag and drop or select a golf simulator screenshot
3. **View Analysis**: See extracted metrics (speed, distance, spin, launch angle)
4. **Dashboard**: View all your shots with statistics
5. **Leaderboard**: Check rankings across different metrics
6. **Share**: Copy share links to show off your best shots

## 🔧 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Shots
- `POST /api/shots` - Upload and analyze shot
- `GET /api/shots/me` - Get user's shots
- `GET /api/shots/leaderboard` - Get leaderboard
- `DELETE /api/shots/:id` - Delete shot

### Sharing
- `GET /share/shot/:id` - Public shot view

## 🧪 Testing

The app includes mock data functionality for development:
- If no OpenAI API key is provided, it uses mock shot analysis
- This allows testing the full flow without API costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details

---

Built with ❤️ for golf enthusiasts who want to improve their game through data analysis! 