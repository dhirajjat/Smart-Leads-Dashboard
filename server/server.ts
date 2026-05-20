import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import API routes and database initialization relative to this folder
import apiRouter from "./routes.ts";
import "./db.ts"; // Ensure DB connection triggers on startup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up CORS
// For maximum security and clean separate frontend, we allow requests from all origins (or you can map specific Vercel URL)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// API routes mounted at /api
app.use("/api", apiRouter);

// Root route for standalone API healthcheck
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "Smart Leads backend server is running successfully!",
    deployment: "Render ready-to-deploy",
    database: "MongoDB Atlas flexible sync model"
  });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Standalone API Server running on port ${PORT}`);
});
