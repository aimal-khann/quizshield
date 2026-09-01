# QuizShield

A secure, anti-cheat quiz platform built with Next.js (frontend) and Express + Prisma (backend).

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
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Design system
│   │   │   ├── dashboard/page.tsx    # Student dashboard
│   │   │   ├── admin/page.tsx        # Admin panel
│   │   │   └── quiz/[id]/page.tsx    # Anti-cheat quiz engine
│   │   ├── components/               # Reusable UI components
│   │   └── lib/api.ts               # API client
│   └── .env.example
├── exam_quiz_backend/       # Express backend
│   ├── src/server.ts        # Main server + all API routes
│   ├── src/security.ts      # Rate limiting, auth, input validation
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   ├── Dockerfile           # Hugging Face Spaces Docker config
│   └── .env.example
└── README.md                # This file
```

## Deployment

### Backend (Hugging Face Spaces)

1. Create a new Docker Space on [huggingface.co/spaces](https://huggingface.co/spaces)
2. Set environment variables in Space settings (see `.env.example`)
3. Push the `exam_quiz_backend` directory to the Space
4. After build, run the seed script:
   ```bash
   docker exec -it <container> node dist/seed.js
   ```

### Frontend (Vercel)

1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your Hugging Face Spaces backend URL
3. Deploy

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
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:7860
npm install
npm run dev  # Runs on port 3000
```

## Features

- **Secure authentication** — username + 5-digit PIN, JWT-based
- **Anti-cheat engine** — Page Visibility API detects tab switches/minimize
- **One attempt only** — cannot retake quizzes
- **Server-side scoring** — score calculated on the backend, never trusted from client
- **Admin panel** — manage quizzes, add/edit/delete questions, bulk import, reset attempts
- **Responsive design** — works on desktop and mobile
- **Answer review** — view correct/incorrect answers after completion

## Security

- Helmet.js HTTP headers (HSTS, CSP, X-Frame-Options)
- Rate limiting (API, login, quiz, admin)
- Account lockout after 5 failed attempts
- Input validation and sanitization
- Timing-safe PIN comparison
- CORS locked to known origins
- Suspicious pattern detection

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express 5, Prisma 7, PostgreSQL, JWT
- **Deployment**: Vercel (frontend), Hugging Face Spaces Docker (backend)
