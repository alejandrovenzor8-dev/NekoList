# NekoList 🐱

Una aplicación web moderna para rastrear y gestionar tus listas personales de anime, impulsada por la API GraphQL de AniList.

## Características

- 🔍 **Buscar y descubrir** anime con filtros avanzados (género, año, popularidad)
- 📋 **Listas personales** - Rastrea anime como Visto, Viendo o Planeo ver
- ⭐ **Calificaciones y reseñas** - Califica anime del 1 al 10 y escribe reseñas
- ❤️ **Favoritos** - Marca tu anime favorito
- 📊 **Panel** - Visualiza tus estadísticas y actividad
- 🌙 **Modo oscuro** - Interfaz oscura atractiva por defecto

## Arquitectura

Esta app sigue una arquitectura de datos basada solo en referencias:
- La base de datos **solo almacena** referencias del usuario (animeId, estado, calificación, reseña)
- Toda la información del anime (título, imagen, descripción) se obtiene **en tiempo real** desde la API de AniList
- Los resultados se almacenan en caché para minimizar llamadas a la API

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Axios
- **Backend**: Node.js + Express, autenticación JWT
- **Database**: MongoDB (Mongoose)
- **API**: AniList GraphQL API

## Setup

### Requisitos previos
- Node.js 18+
- MongoDB (local o Atlas)

### MongoDB con Docker (opcional recomendado)

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Para detener MongoDB:

```bash
docker compose down
```

Tu backend ya está preparado para conectarse con:

```bash
MONGODB_URI=mongodb://localhost:27017/nekolist
```

### Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tu URI de MongoDB y tu secreto JWT
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Variables de entorno

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nekolist
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Lista de anime (requiere JWT)
- `GET /api/list` - Obtener lista del usuario
- `GET /api/list/stats` - Obtener estadísticas del usuario
- `GET /api/list/:animeId` - Obtener entrada específica
- `POST /api/list` - Añadir a la lista
- `PUT /api/list/:animeId` - Actualizar entrada
- `DELETE /api/list/:animeId` - Eliminar de la lista

### AniList Proxy
- `POST /api/anilist` - Proxy de consultas GraphQL hacia AniList
Página para enlistar animes vistos y calificarlos.
