import express from "express";
import * as authController from "./controllers/authController.ts";
import * as leadController from "./controllers/leadController.ts";
import { protect, authorize } from "./middleware/auth.ts";

const router = express.Router();

// Auth Routes
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register); // Optional but good for demo
router.get("/auth/me", protect, authController.getMe);

// Lead Routes
router.get("/leads", protect, leadController.getLeads);
router.post("/leads", protect, authorize(['admin']), leadController.createLead);
router.patch("/leads/:id", protect, authorize(['admin', 'sales']), leadController.updateLeadStatus);
router.delete("/leads/:id", protect, authorize(['admin']), leadController.deleteLead);
router.get("/leads/stats", protect, leadController.getStats);

export default router;
