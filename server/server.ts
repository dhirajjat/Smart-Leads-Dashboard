import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url'; 


import apiRouter from "./routes.ts";
import "./db.ts"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());


app.use("/api", apiRouter);


app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Smart Leads backend server is running successfully!",
    deployment: "Render ready-to-deploy",
    database: "MongoDB Atlas flexible sync model"
  });
});


app.use(express.static(path.join(__dirname, '.')));


app.get('*', (req, res) => {
 
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ status: "error", message: "API endpoint not found" });
  }
  
 
  res.sendFile(path.join(__dirname, '.', 'index.html'));
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Full-Stack Server running on port ${PORT}`);
});