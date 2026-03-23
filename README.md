# NekoList 🐱

A modern web application for tracking and managing your personal anime lists, powered by the AniList GraphQL API.

## Features

- 🔍 **Search & Discover** anime with advanced filters (genre, year, popularity)
- 📋 **Personal Lists** - Track anime as Watched, Watching, or Plan to Watch
- ⭐ **Rating & Reviews** - Rate anime 1-10 and write reviews
- ❤️ **Favorites** - Mark your favorite anime
- 📊 **Dashboard** - View your stats and activity
- 🌙 **Dark Mode** - Beautiful dark UI by default

## Architecture

This app follows a reference-only data architecture:
- The database **only stores** user references (animeId, status, rating, review)
- All anime info (title, image, description) is fetched **in real-time** from AniList API
- Results are cached to minimize API calls

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Axios
- **Backend**: Node.js + Express, JWT authentication
- **Database**: MongoDB (Mongoose)
- **API**: AniList GraphQL API

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nekolist
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Anime List (requires JWT)
- `GET /api/list` - Get user's list
- `GET /api/list/stats` - Get user stats
- `GET /api/list/:animeId` - Get specific entry
- `POST /api/list` - Add to list
- `PUT /api/list/:animeId` - Update entry
- `DELETE /api/list/:animeId` - Remove from list

### AniList Proxy
- `POST /api/anilist` - Proxy GraphQL queries to AniList
pagina para enlistar animes vistos y calificarlos
