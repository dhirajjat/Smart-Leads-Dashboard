import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
const rootDir = path.resolve();

import apiRouter from "./routes.ts";
import "./db.ts"; // Ensure DB connection triggers on startup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 1. SAARI API ROUTES (/api)
app.use("/api", apiRouter);

// 2. HEALTHCHECK ENDPOINT
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Smart Leads backend server is running successfully!",
    deployment: "Render ready-to-deploy",
    database: "MongoDB Atlas flexible sync model"
  });
});



app.use(express.static(path.join(rootDir, "dist")));


app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ status: "error", message: "API endpoint not found" });
  }
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Full-Stack Server running on port ${PORT}`);
});