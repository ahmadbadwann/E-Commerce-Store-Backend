import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
	getAllCategories,
	getAllCategoriesAdmin,
	createCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Public — used by HomePage & CreateProductForm
router.get("/", getAllCategories);

// Admin — includes inactive categories
router.get("/all", protectRoute, adminRoute, getAllCategoriesAdmin);

// Admin CRUD
router.post("/", protectRoute, adminRoute, createCategory);
router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

export default router;
