import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { createOrder, getAllOrders, deleteOrder } from "../controllers/order.controller.js";

const router = express.Router();

// Customer places an order
router.post("/", protectRoute, createOrder);

// Admin fetches all orders
router.get("/", protectRoute, adminRoute, getAllOrders);

// Admin deletes an order
router.delete("/:id", protectRoute, adminRoute, deleteOrder);

export default router;
