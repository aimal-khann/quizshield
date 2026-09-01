# Exam Quiz Platform

A secure, anti-cheat quiz platform for a 5-person study group. Built with Next.js (frontend) and Express + Prisma (backend).

## Architecture

- **Frontend**: Next.js 16 App Router + Tailwind CSS → deployed on **Vercel**
- **Backend**: Express + TypeScript + Prisma → deployed on **Hugging Face Spaces** (Docker)
- **Database**: PostgreSQL (Neon)

## Project Structure

```
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Login page
│   │   │   ├── layout.tsx            # Root layout (Inter font)
│   │   │   ├── globals.css           # Design system (sage/slate palette)
│   │   │   ├── dashboard/page.tsx    # Student dashboard
│   │   │   └── quiz/[id]/page.tsx    # Anti-cheat quiz engine
│   │   ├── components/               # Reusable UI components
│   │   └── lib/api.ts               # API client
│   └── .env.local.example
├── exam_quiz_backend/       # Express backend
│   ├── src/server.ts        # Main server + all API routes
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script (5 users + sample quizzes)
│   ├── Dockerfile           # Hugging Face Spaces Docker config
│   └── .env                 # Environment variables
├── users_credentials.md     # Hardcoded user credentials
└── README.md                # This file
```

## User Credentials

| Username | PIN |
|---|---|
| aimal-khan | 03160 |
| qasim | 56134 |
| mahad | 78542 |
| muhammad-fahad | 46973 |
| awais | 74381 |

## Deployment

### Backend (Hugging Face Spaces)

1. Create a new Docker Space on [huggingface.co/spaces](https://huggingface.co/spaces)
2. Set environment variable `DATABASE_URL` in Space settings
3. Push the `exam_quiz_backend` directory to the Space
4. After build, run the seed script:
   ```bash
   docker exec -it <container> node dist/seed.js
   ```
   Or run `npx ts-node prisma/seed.ts` locally against the Neon database.

### Frontend (Vercel)

1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your Hugging Face Spaces backend URL (e.g., `https://your-space.hf.space`)
3. Deploy — the build will pass cleanly.

### Local Development

```bash
# Backend
cd exam_quiz_backend
cp .env.example .env  # Fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma db seed
npm run dev  # Runs on port 7860

# Frontend
cd frontend
cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:7860
npm install
npm run dev  # Runs on port 3000
```

## Features

- **Secure authentication** — username + 5-digit PIN, JWT-based
- **Anti-cheat engine** — Page Visibility API detects tab switches/minimize
- **One attempt only** — cannot retake quizzes
- **Server-side scoring** — score calculated on the backend, never trusted from client
- **Peaceful UI** — calming sage/slate color palette, Inter typography, enterprise feel
- **Responsive design** — works on desktop and mobile
- **Answer review** — view correct/incorrect answers after completion

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with username + PIN |
| GET | `/api/quizzes` | List available quizzes |
| GET | `/api/quiz/:id` | Get quiz info |
| GET | `/api/quiz/:id/questions` | Get quiz questions |
| POST | `/api/quiz/:id/start` | Start a quiz attempt |
| POST | `/api/quiz/:id/answer` | Submit an answer |
| POST | `/api/quiz/:id/finish` | Finalize quiz (calculate score) |
| GET | `/api/users/me` | Get dashboard data |
| GET | `/api/health` | Health check |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express 5, Prisma 7, PostgreSQL, JWT
- **Deployment**: Vercel (frontend), Hugging Face Spaces Docker (backend)
