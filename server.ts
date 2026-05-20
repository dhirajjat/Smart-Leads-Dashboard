import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";

// API Routes relative to root
import apiRouter from "./server/routes.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use("/api", apiRouter);

  // Vite middleware for development (local preview) or fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.json({
          name: "Smart Leads Full-Stack Environment",
          status: "healthy",
          message: "API server running. Vercel client connecting."
        });
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Development Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
