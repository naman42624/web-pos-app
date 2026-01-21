import { Router } from "express";

// NOTE: Supabase proxy is DISABLED
// This application uses MongoDB for data storage, not Supabase
// This file is kept for backwards compatibility but contains no routes

const router = Router();

// All requests to this router will be 404
router.use((_req, res) => {
  res.status(404).json({ error: "Supabase proxy is not available" });
});

export default router;
