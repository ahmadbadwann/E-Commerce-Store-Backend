import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
	getCoupon,
	validateCoupon,
	getAllCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// User routes
router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);

// Admin routes
router.get("/all", protectRoute, adminRoute, getAllCoupons);
router.post("/admin", protectRoute, adminRoute, createCoupon);
router.put("/admin/:id", protectRoute, adminRoute, updateCoupon);
router.delete("/admin/:id", protectRoute, adminRoute, deleteCoupon);

export default router;
