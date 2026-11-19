<div align="center">

# ⚡ JobHax

**A modern, AI-ready job portal connecting candidates with top employers.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)

</div>

---

## ✨ Features

**🔓 Public**
- Browse & search published jobs with filters (location, type, salary)
- Job detail pages with employer profiles
- Landing page with featured jobs, stats, and testimonials

**🧑‍💼 Candidate**
- Dashboard with application pipeline & recommended jobs
- One-click apply, saved jobs, and application tracking
- Profile builder (experience, education, skills, resume)
- Messaging with employers & notification/privacy settings

**🏢 Employer**
- Post, edit, pause, and close job listings
- Applicant tracking system (ATS) — stage pipeline, starring, notes
- Interview scheduling, candidate details, and analytics charts
- Company profile, messaging, and team settings

**🔐 Auth & Infrastructure**
- Custom session-based auth — Argon2 hashing, SHA-256 tokens, HTTP-only cookies
- Role-based route guards for candidate & employer dashboards
- File uploads via UploadThing, analytics via Vercel

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Database | MySQL + Drizzle ORM (migrations) |
| Forms | React Hook Form + Zod |
| Auth | Custom sessions (Argon2 + SHA-256) |
| Uploads / Analytics | UploadThing / Vercel Analytics |

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone <repository-url>
cd JobHax
npm install

# 2. Configure environment
cp .env.example .env      # then fill in your values

# 3. Create the database schema
npm run db:push

# 4. Start developing
npm run dev               # → http://localhost:3000
```

### Environment Variables

```env
DATABASE_URL=mysql://user:password@host:3306/jobhax
UPLOADTHING_TOKEN=your-uploadthing-token
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Browse DB in Drizzle Studio |

---

## 📁 Project Structure

```
JobHax/
├── app/                  # Pages, layouts & API routes (App Router)
│   ├── candidate/        #   Candidate dashboard (protected)
│   ├── employer/         #   Employer dashboard (protected)
│   ├── jobs/             #   Public job browsing
│   └── api/uploadthing/  #   File upload endpoints
├── components/           # Shared UI + shadcn/ui primitives
├── features/             # Business logic (schemas, actions, queries)
│   ├── auth/             #   Authentication
│   ├── candidate-features/
│   ├── employer-features/
│   └── public-features/
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (cn, etc.)
└── src/                  # DB config, Drizzle schema & migrations
```

---

## ☁️ Deployment

The project is deployment-ready on **Vercel** (or any Node host):

1. Push the repository to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example` in **Project Settings → Environment Variables**.
3. Point `DATABASE_URL` at a reachable MySQL instance (e.g. PlanetScale, Railway, Neon-for-MySQL, or self-hosted) and run `npm run db:push` once.
4. Deploy — builds run `next build` with zero TypeScript errors.

```bash
# Or deploy manually
npm run build
npm run start
```

---

## 📄 License

Private project — not licensed for public distribution.
