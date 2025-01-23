import { Router } from "express";
import userRoutes from "./users.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: U management routes
 */
router.use("/users", userRoutes);

export default router;
