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
│   └── schema.prisma        # Prisma data models (forms, feedbacks, talks, projects)
├── public/
│   ├── assets/              # Static branding and icon assets
│   ├── uploads/             # Media uploads (posters, slides, materials)
│   ├── dashboard.html       # Single-Page Admin Dashboard UI
│   ├── form-renderer.html   # Public dynamic form submission interface
│   └── favicon.png          # App favicon
├── src/
│   ├── config/
│   │   └── db.js            # Prisma Client instance with @prisma/adapter-pg pooling
│   ├── controllers/
│   │   ├── feedbacks.controller.js # Feedback submission & retrieval
│   │   ├── forms.controller.js     # Form CRUD & standardized feedback fields
│   │   ├── fields.controller.js    # Dynamic form fields management
│   │   ├── responses.controller.js # Response submission, queries & exports
│   │   ├── talks.controller.js     # Talks CRUD & slide extraction
│   │   └── projects.controller.js  # Projects CRUD operations
│   ├── middlewares/
│   │   └── errorHandler.js  # Centralized API error handling
│   ├── routes/
│   │   ├── feedbacks.routes.js
│   │   ├── forms.routes.js
│   │   ├── talks.routes.js
│   │   └── projects.routes.js
│   ├── app.js               # Express application configuration & security middlewares
│   └── server.js            # HTTP Server bootstrap
├── package.json             # Dependencies & scripts
└── vercel.json              # Vercel serverless deployment configuration
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
