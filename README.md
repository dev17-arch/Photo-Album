# Luminary — Personal Photo Archive

A full-stack Next.js photo album app with search, tagging, occasion/people filtering, and AI-powered portrait analysis via xAI Grok Vision.

---

## Tech Stack

| Layer | Service | Free Tier |
|---|---|---|
| Framework | Next.js 14 (App Router) | — |
| Hosting | Vercel | ✅ Unlimited personal projects |
| Auth | Clerk | ✅ 10,000 MAU |
| Photo Storage | Cloudinary | ✅ 25 GB |
| Database | Supabase | ✅ 500 MB |
| AI | xAI Grok Vision | Pay-per-use (~$0.01–0.05/call) |

---

## Setup Guide

### Step 1 — Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### Step 2 — Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3 — Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → sign up → Dashboard
2. Copy your **Cloud name**, **API Key**, **API Secret**

### Step 4 — Clerk (auth)

1. Go to [clerk.com](https://clerk.com) → Create application
2. Choose sign-in methods (Email, Google, etc.)
3. Go to **API Keys** → copy Publishable Key + Secret Key

### Step 5 — xAI (Grok)

1. Go to [console.x.ai](https://console.x.ai) → API Keys → Create key
2. Copy the key → `XAI_API_KEY`

### Step 6 — Environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`.

### Step 7 — Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Environment Variables**, add all the keys from your `.env.local`
4. Click **Deploy** — your site is live in ~60 seconds

> ⚠️ Never commit `.env.local` to GitHub. It's already in `.gitignore`.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main photo grid
│   ├── favorites/page.tsx    # Favorites view
│   ├── ai/
│   │   ├── layout.tsx        # AI page layout
│   │   └── page.tsx          # AI Studio (Grok Vision)
│   ├── sign-in/              # Clerk auth pages
│   ├── sign-up/
│   └── api/
│       ├── photos/route.ts   # GET, PATCH, DELETE photos
│       ├── upload/route.ts   # POST — upload to Cloudinary + Supabase
│       └── ai/route.ts       # POST — call xAI Grok Vision
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Topbar.tsx            # Search bar + upload button
│   ├── PhotoGrid.tsx         # Masonry photo grid
│   ├── DetailPanel.tsx       # Photo detail side panel
│   └── UploadModal.tsx       # Upload photo modal
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── cloudinary.ts         # Cloudinary upload/delete
│   └── utils.ts              # Helpers (cn, tagColor, formatDate)
├── types/
│   └── index.ts              # TypeScript types
└── middleware.ts             # Clerk auth protection
```

---

## AI Video Workflow

1. Open **AI Studio** in the sidebar
2. Select multiple photos of the same person
3. Click **Analyze with Grok Vision**
4. Copy the generated description
5. Paste into one of these video generation tools:
   - [Runway ML Gen-3](https://runwayml.com)
   - [Kling AI](https://klingai.com)
   - [Pika Labs](https://pika.art)
