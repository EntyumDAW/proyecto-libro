# BookSwap — Book Exchange Platform

**[Live Demo](https://proyecto-libro-frontend.onrender.com)** · 
**[Backend API](https://proyecto-libro-backend.onrender.com/health)**

The backend runs on Render's free tier and may take ~30 seconds to wake up on first request.

---

A full-stack web application for buying, selling, and exchanging second-hand books between users. Built with React, Node.js/Express, PostgreSQL and Docker.

> **Portfolio project** — showcases a complete REST API, JWT authentication, real-time messaging, encrypted data storage, and a fully containerised deployment.

---

## Screenshots

| Home | Listings | Book Detail | Notifications |
|------|----------|-------------|---------------|
| ![Home](docs/screenshots/page-home.png) | ![Listings](docs/screenshots/listings.png) | ![Book Detail](docs/screenshots/book-detail.png) | ![Notifications](docs/screenshots/notifications.png) |

| Transactions | Messages | My Account |
|--------------|----------|------------|
| ![Transactions](docs/screenshots/transactions.png) | ![Messages](docs/screenshots/messages.png) | ![Account](docs/screenshots/account.png) |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Features

### Books
- Search books via **Google Books API** (title, author, ISBN)
- View detailed book information with high-resolution covers
- Manual book creation for books not in the Google catalog
- Hierarchical category system

### Trading
- **Sale listings** — list books at a fixed price
- **Exchange listings** — request specific books, accept alternatives
- Full transaction lifecycle: `pending → accepted/rejected → completed/cancelled`
- Independent confirmation from both parties before a transaction completes
- Optional shipping tracking per transaction

### Messaging
- Direct 1-to-1 conversations between users
- **AES-256-CBC encrypted** message content
- Unread message badge with polling-based updates
- Optional transaction context per conversation

### Notifications
- In-app notification system (exchange requested, transaction updated, book available)
- Read/unread status per notification
- Badge counter in the header updated every 10 seconds

### User Accounts
- JWT-based authentication with bcrypt password hashing
- Strong password enforcement (uppercase, lowercase, numbers, special characters)
- Profile management (name, address, city, phone)
- Favourites list with external book references (ISBN or Google Books ID)
- Full transaction and listing history

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Material UI (MUI) | 7 | Component library |
| Axios | 1.13 | HTTP client |
| Font Awesome | 7 | Icons |
| Vitest | 4 | Unit testing |
| React Testing Library | — | Component testing |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18 | Runtime |
| Express | 5 | Web framework |
| Prisma | 6 | ORM & migrations |
| PostgreSQL | 16 | Database |
| JSON Web Token | 9 | Authentication |
| bcrypt | 6 | Password hashing |
| Axios | 1.13 | Google Books API client |
| Vitest | 4 | Unit & integration testing |
| Supertest | 7 | HTTP endpoint testing |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker | Containerisation |
| Docker Compose | Multi-service orchestration |
| Nginx | Static frontend serving in production |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌───────────────┐  │
│  │ Frontend │───▶│ Backend  │───▶│  PostgreSQL   │  │
│  │  Nginx   │    │ Express  │    │   (Prisma)    │  │
│  │  :5173   │    │  :4000   │    │    :5432      │  │
│  └──────────┘    └──────────┘    └───────────────┘  │
│                       │                             │
│                       ▼                             │
│               Google Books API                      │
└─────────────────────────────────────────────────────┘
```

### Backend Layers

```
HTTP Request
    │
    ▼
Routes          (src/routes/)        — Express routers
    │
    ▼
Middlewares     (src/middlewares/)   — Auth (JWT), Validation, Error handler
    │
    ▼
Controllers     (src/controllers/)   — Business logic
    │
    ▼
Repositories    (src/repositories/)  — Data access (Prisma queries)
    │
    ▼
Database        (PostgreSQL 16)
```

### Frontend Layers

```
Pages (src/pages/)
    │
    ├── Components (src/components/)   — Reusable UI
    ├── Services   (src/services/)     — Axios API calls
    ├── Context    (src/context/)      — Global auth state
    └── Utils      (src/utils/)        — Translations, error handling
```

---

## Database Schema

```
usuario ──────────────────────────────────────────────────────┐
  │                                                           │
  ├──< ejemplares >──< anuncio >──< intercambio_deseado       │
  │         │              │                                  │
  │         │         transacciones                           │
  │         │              │                                  │
  │         └──────────────┘                                  │
  │                    │                                      │
  │              transporte                                   │
  │                                                           │
  ├──< notificaciones                                         │
  ├──< favorito                                               │
  └──< conversacion >──< mensaje                              │
                                                              │
libros >──< libro_categoria >──< categorias ─── categorias    │
  │                                          (self-reference) │
  └──< ejemplares                                             │
```

**Key models:**

| Model | Description |
|-------|-------------|
| `usuario` | User accounts with profile, roles (user/admin) |
| `libros` | Book metadata (ISBN, title, author, synopsis, cover) |
| `ejemplares` | Individual physical copies owned by users |
| `anuncio` | Sale or exchange listings referencing an exemplar |
| `transacciones` | Complete transaction between two users |
| `transporte` | Shipping details for a transaction |
| `conversacion` | 1-to-1 messaging thread (unique per user pair) |
| `mensaje` | Individual encrypted message in a conversation |
| `notificaciones` | In-app notifications per user |
| `favorito` | Saved books per user (by ISBN or Google Books ID) |
| `categorias` | Hierarchical book categories |

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login and receive JWT |
| `GET` | `/libros/search?q=` | — | Search books via Google Books |
| `GET` | `/libros/:id` | — | Get book detail by ISBN or Google ID |
| `POST` | `/libros` | ✓ | Create a book manually |
| `GET` | `/categorias` | — | List all categories |
| `GET` | `/ejemplares` | ✓ | List user's book copies |
| `POST` | `/ejemplares` | ✓ | Add a new book copy |
| `PUT` | `/ejemplares/:id` | ✓ | Update a book copy |
| `GET` | `/anuncios` | — | Browse all active listings |
| `GET` | `/anuncios/:id` | — | Get listing detail |
| `POST` | `/anuncios` | ✓ | Create a listing |
| `PUT` | `/anuncios/:id` | ✓ | Update a listing |
| `DELETE` | `/anuncios/:id` | ✓ | Delete a listing |
| `GET` | `/transacciones` | ✓ | List user's transactions |
| `POST` | `/transacciones` | ✓ | Initiate a transaction |
| `PUT` | `/transacciones/:id` | ✓ | Update transaction status |
| `GET` | `/notificaciones` | ✓ | Get user notifications |
| `GET` | `/perfil` | ✓ | Get user profile |
| `PUT` | `/perfil` | ✓ | Update user profile |
| `GET` | `/favoritos` | ✓ | List favourite books |
| `POST` | `/favoritos` | ✓ | Toggle a favourite |
| `GET` | `/mensajes` | ✓ | List conversations |
| `GET` | `/mensajes/:id` | ✓ | Get messages in a conversation |
| `POST` | `/mensajes` | ✓ | Send a message |
| `GET` | `/health` | — | Server health check |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey)

### 1. Clone the repository

```bash
git clone https://github.com/EntyumDAW/proyecto-libro
cd ProyectoLibro
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Fill in your values (see [Environment Variables](#environment-variables)).

### 3. Start all services

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL and wait for it to be healthy
2. Run `prisma db push` to apply the schema
3. Start the Express API on port **4000**
4. Build the React app and serve it via Nginx on port **5173**

### 4. Open the app

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=proyectoLibro

# Prisma (used inside Docker — host is the service name)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_DATABASE}

# Backend
BACKEND_PORT=4000
JWT_SECRET=your_jwt_secret

# Google Books
GOOGLE_API_KEY=your_google_books_api_key
```

---

## Testing

Tests use **Vitest** in both frontend and backend. Repositories and external APIs are mocked so no database or network connection is needed to run them.

### Backend (16 tests)

```bash
cd backend
npm test                 
```

Covers:
- `GET /health` — server health check
- `POST /api/auth/register` — email validation, duplicate checks, password strength, success
- `POST /api/auth/login` — user not found, wrong password, success
- `GET /api/libros/search` — missing query, filtered results, image/description filters, zoom URL, API failure
- `GET /api/libros/:id` — book lookup from database

### Frontend (14 tests)

```bash
cd frontend
npm test
```

Covers:
- `getErrorMessage()` — network errors, server messages, all HTTP status codes (400/401/403/404/500), unknown codes
- `traducir()` — all translation categories (condition, type, status, transaction state, copy state), edge cases

---

## Project Structure

```
ProyectoLibro/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models & enums
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma client
│   │   ├── controllers/           # Business logic (10 files)
│   │   ├── middlewares/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── validator.js       # Input validation
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── repositories/          # Prisma query wrappers (10 files)
│   │   ├── routes/                # Express routers (10 files)
│   │   ├── utils/
│   │   │   ├── apiGoogle.js       # Google Books API client
│   │   │   ├── bcrypt.js          # Password helpers
│   │   │   ├── cifrado.js         # AES-256-CBC encryption
│   │   │   └── tokenGenerator.js  # JWT creation
│   │   └── server.js              # Express app setup & CORS
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── health.test.js
│   │   └── libros.test.js
│   ├── Dockerfile
│   ├── vitest.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI (10 files)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/                 # Route pages (18 files)
│   │   ├── services/              # Axios API wrappers (11 files)
│   │   ├── utils/
│   │   │   ├── errorHandler.js    # HTTP error messages
│   │   │   └── translations.js    # DB enum → display string
│   │   └── __tests__/
│   │       ├── errorHandler.test.js
│   │       ├── translations.test.js
│   │       └── setup.js
│   ├── Dockerfile                 # Multi-stage: Node build → Nginx
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── package.json
│
├── docker-compose.yml
└── .env.example
```

---

## Security Highlights

- **JWT authentication** — stateless, signed tokens with configurable secret
- **bcrypt password hashing** — industry-standard adaptive hashing
- **AES-256-CBC message encryption** — message content never stored in plaintext
- **Input validation middleware** — email format, username rules, password strength enforced server-side
- **Protected routes** — both frontend (ProtectedRoute component) and backend (auth middleware)
- **CORS configured** — only allowed origins can access the API

---

## License

Copyright (c) 2025 Antonio Armero Muñoz. All rights reserved.

This project and its source code are publicly visible for portfolio and educational purposes only. No part of this project may be copied, modified, distributed, or used in any form without the express written permission of the author.
