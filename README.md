# Presentation Personal Branding & Digital Portfolio

An interactive, full-stack personal portfolio and feedback management dashboard built for **Muhammad Haerul**, designed with Google-inspired aesthetics and powered by **Node.js, Express, Prisma ORM 7, PostgreSQL (Supabase)**.

---

## 🚀 Key Features

- **📊 Comprehensive Overview Dashboard**:
  - Hero statistics displaying attendee reach, average ratings, and visitor counters.
  - Symmetrical 4×2 Google-themed metric cards (Projects, Talks, Forms, Feedbacks, Certifications, Awards, Publications, Articles).
  - Recent activity feeds with direct management links.

- **⭐ Interactive Feedback Forms & Custom Survey Builder**:
  - **Standardized Feedback Forms**: Automatically mapped to the PostgreSQL `feedbacks` table for speaking sessions and presentations.
  - **General Form Builder**: Dynamic form builder supporting text, textarea, rating (1–10), radio, select, and checkbox questions.
  - **Live Responses Drawer**: Analyze responses by question with interactive bar charts or view individual submission responses with CSV export.

- **🎤 Talks & Presentations Manager**:
  - Track speaking engagements, venue, event dates, attendee counts, and uploaded event posters.
  - Automated interactive slide extraction from PowerPoint (PPTX) and PDF materials.

- **💻 Digital Projects Showcase**:
  - Manage showcase projects with tech stacks, live links, video demos, and thumbnails.

---

## 🏗️ Architecture & Project Structure

```
├── prisma/
│   └── schema.prisma        # Prisma data models with performance indexes
├── public/
│   ├── assets/              # Static branding and optimized WebP assets
│   ├── uploads/             # Media uploads (posters, event galleries, materials)
│   ├── dashboard.html       # Single-Page Admin Dashboard UI with instant cache
│   ├── form-renderer.html   # Public dynamic form submission interface
│   ├── form-feedbacks.html  # Dedicated public feedback submission interface
│   └── favicon.webp         # Lightweight WebP favicon
├── scripts/
│   ├── convert-to-webp.js   # Automated batch WebP converter & DB synchronizer
│   ├── check_db.js          # Database connection validator
│   └── clean_tables.js      # Database maintenance script
├── src/
│   ├── config/
│   │   └── db.js            # Prisma Client with connection pool tuning & keepAlive
│   ├── controllers/
│   │   ├── feedbacks.controller.js # Feedback submission & retrieval with cache
│   │   ├── forms.controller.js     # Form CRUD & parallel queries
│   │   ├── fields.controller.js    # Dynamic form fields management
│   │   ├── responses.controller.js # Response submission, queries & exports
│   │   ├── talks.controller.js     # Talks CRUD, event gallery & slide management
│   │   └── projects.controller.js  # Projects CRUD & date-desc sorting
│   ├── middlewares/
│   │   ├── security.js      # Multi-tier rate limiters & input sanitization
│   │   └── errorHandler.js  # Information-disclosure protected error handler
│   ├── routes/
│   │   ├── feedbacks.routes.js
│   │   ├── forms.routes.js
│   │   ├── talks.routes.js  # Supports single & multi-file uploads with auto-WebP
│   │   └── projects.routes.js
│   ├── utils/
│   │   └── cache.js         # Zero-latency in-memory cache with TTL & pattern busting
│   ├── app.js               # Express application with compression & security headers
│   └── server.js            # HTTP Server bootstrap
├── package.json             # Dependencies & maintenance scripts
└── vercel.json              # Vercel deployment configuration
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PostgreSQL Database** (e.g. Supabase, Neon, or local PostgreSQL)

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
```

### 3. Installation & Setup
```bash
# Install dependencies
npm install

# Push database schema (Prisma)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Running Locally
```bash
# Start development server with auto-reload
npm run dev

# Or start in production mode
npm start
```
Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 🚢 Deployment (Vercel)

This application is configured for deployment on **Vercel** with `@vercel/node`.
1. Connect your GitHub repository to Vercel.
2. Add `DATABASE_URL` and `DIRECT_URL` in the **Environment Variables** settings.
3. Deploy! Vercel will automatically run `npm run postinstall` to generate Prisma Client.

---

## 📄 License
ISC License © 2026 Muhammad Haerul
