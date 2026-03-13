import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, deleteUser } from "../controllers/auth.controller.js";
// Import existing auth handlers
import { signup, login, logout, refreshToken, getProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

// Admin user management
router.get("/users", protectRoute, adminRoute, getAllUsers);
router.delete("/users/:id", protectRoute, adminRoute, deleteUser);

export default router;
