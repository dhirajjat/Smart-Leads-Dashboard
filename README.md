
# 🎯 Smart Leads Dashboard

An elegant, highly-responsive, and production-ready **Full-Stack Lead Management App** built with **React (Vite), TypeScript, Tailwind CSS, Express, and MongoDB Atlas**. 

The application is engineered with a **Flexible DB Layer (FlexibleDB)** that automatically syncs local file-based database records (`data.json`) with MongoDB Atlas when online, falling back gracefully to offline file preservation if MongoDB credentials are missing, or if an IP whitelist block occurs.

---

## 🎨 Visual & Functional Highlights

- **Lead Capturing & Monitoring**: Seamlessly view, edit, search, filter, and delete product leads with real-time analytics.
- **Dynamic Charts**: Powered by `recharts` for status breakdowns, lead source distribution, and weekly growth tracking.
- **Smart Authorization**: Secure JWT-based Authentication engine support, with token-validation middleware and password encryption (`bcryptjs`).
- **Modern UI/UX**: Designed using clean **Inter** & **Space Grotesk** typography, fluid **Tailwind CSS**, and interactive transitions powered by `motion` (Framer Motion).
- **Flexible Database (Dual-Sided Mode)**: Supports *Mongoose (MongoDB Atlas)*, falling back to a structured server-side *Local File-Based DB (`data.json`)* if MongoDB is inaccessible.

---

## 📂 Project Architecture

The directory is split logically into a standard full-stack environment. Here is the structure:

```bash
├── package.json               # Defines core dependencies, scripts & configuration
├── vite.config.ts             # React build configuration (with Dev-server routing proxy)
├── vercel.json                # Custom rewrites for standalone SPA frontend deployments
├── server.ts                  # ROOT SERVER: Hosts combined backend + Vite HMR Dev Middleware
├── server/                    # STANDALONE BACKEND MODULE
│   ├── server.ts              # API server main file (ideal for Render/Heroku deployments)
│   ├── db.ts                  # Hybrid FlexibleDB initialization engine (Handles Mongo + json database fallback)
│   ├── routes.ts              # Core API router paths (/api/leads, /api/auth)
│   ├── controllers/           # Route handler controllers (Lead parsing, JWT auth, token emission)
│   └── middleware/            # Auth status check guards and payload validations
└── src/                       # FRONTEND APPLICATION (React & Vite SPA)
    ├── main.tsx               # Frontend client execution point 
    ├── App.tsx                # Principal visual route manager
    ├── AuthContext.tsx        # Authentication Context maintaining user variables
    ├── index.css              # Global styling (Includes Tailwind entry directives)
    ├── types.ts               # Shared TypeScript structures (Leads, Statuses, User Schema)
    ├── pages/                 # Full view layouts (Dashboard, Authentication forms)
    ├── hooks/                 # Reusable utility hooks
    └── components/            # Visual building blocks (Stat cards, modal dialogues, tables, charts)
```

---

## ⚙️ Environment Configuration (`.env.example`)

To configure environment variables, create file named `.env` in the root folder:

```properties
# MongoDB Atlas Database URI Connection String
# (Optional: If omitted, the server operates with server-side JSON storage 'data.json' automatically)
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-leads"

# JWT Token Secret for Auth sign-ins
JWT_SECRET="smart-leads-dashboard-super-secure-token-secret"

# Frontend settings (Exposed to client in Vite)
# Keep empty if building in Combined server mode; Set this to your custom API host if deploying Frontend to Vercel/Netlify separately
VITE_API_BASE_URL=""
```

---

## 🚀 Execution & Command Reference

### Option 1: Combined Full-Stack Dev Mode (Local Default)
This starts a development server on **Port 3000** where Express serves backend API endpoints at `/api/*` and mounts the **Vite Dev Server Middleware** to serve the hot-rebuilding React client concurrently.

```bash
# 1. Install Workspace packages
npm install

# 2. Run both Backend & Frontend at once (Runs 'tsx server.ts')
npm run dev
```
Explore the combined solution at `http://localhost:3000`.

---

### Option 2: Standalone Backend Server Mode (For Render Deployments)
If you wish to deploy the Express API backend separately to a service like **Render** while running or hosting the React client separately (e.g. on Vercel), use the backend standalone command lines:

```bash
# Start standalone API server in development mode (with hot reloading via tsx)
npm run start:backend:dev

# Build standalone server to CommonJS (outputs cleanly to dist/server.cjs)
npm run build:backend

# Launch the production standalone backend server
npm run start:backend
```
The active standalone API endpoint is ready at `http://localhost:3000`.

---

### Option 3: Separate Frontend SPA Build (For Vercel / CDN)
For standalone client builds targeting Static Web Hosts or CDNs:

```bash
# Generates high-performance static client build files inside dist/
npm run build:frontend
```
If hosting separately, modify your `.env` to point the frontend client's base requests to your remote backend endpoint link:
```env
VITE_API_BASE_URL="https://your-backend-api.onrender.com"
```
*Note: A custom `vercel.json` file is already supplied in the root directory to handle SPA route redirection rewrites smoothly on static Vercel builds.*

---

### Option 4: Combined Production Build & Start
Use this configuration for general lightweight native full-stack container environments:

```bash
# Compiles both Frontend static bundles and Backend output files to CJS bundle
npm run build

# Runs production Express server which handles API routing and serves frontend assets Static
npm run start
```

---

## 🛡️ Database Fallback Mechanics (Strict Reliability Code)

The backend incorporates premium, fault-proof architecture for database connections inside `server/db.ts`:

1. On startup, the server inspects the presence of `MONGO_URI`.
2. If **present**, the Mongoose client tries to connect to the MongoDB Atlas cluster.
3. If an **IP Whitelisting connection blockage** is detected, or if authorization credentials fail:
   - The connection error is intercepted cleanly.
   - The fallback logic engages without breaking compiling or stopping execution thread.
   - The application pivots dynamically to maintain database CRUD operations locally inside `/data.json`.
4. If `MONGO_URI` is **absent**, the local data storage persists records safely in memory and file backup automatically.

---

## 🛠️ Deployment Instructions

### 1. Backend Server Deployment (e.g., Render)
1. Link your GitHub Repo to **Render** and create a new **Web Service**.
2. Set Environment parameters:
   - `NODE_ENV=production`
   - `MONGO_URI` = `mongodb+srv://...` (Make sure your cluster whitelists all IPs: `0.0.0.0/0`)
   - `JWT_SECRET` = Your strong secret string
3. Set the build and start commands as follows:
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm run start:backend`

### 2. Frontend SPA Deployment (e.g., Vercel)
1. Connect your repo in Vercel.
2. Select **Vite** as framework preset.
3. Configure Environment Secret:
   - `VITE_API_BASE_URL` = Your Render Web Service URL (e.g. `https://smart-leads-api.onrender.com`)
4. Vercel automatically reads `vercel.json` to handle route path resolution, preventing fallback 404 errors.
