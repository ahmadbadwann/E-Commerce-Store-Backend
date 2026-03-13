import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";

// GET /api/categories  — public
export const getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/categories/all  — admin (includes inactive)
export const getAllCategoriesAdmin = async (req, res) => {
	try {
		const categories = await Category.find().sort({ createdAt: -1 });
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/categories  — admin
export const createCategory = async (req, res) => {
	try {
		const { name, slug, imageUrl } = req.body;

		if (!name || !imageUrl) {
			return res.status(400).json({ message: "Name and image are required" });
		}

		// Generate slug from name if not provided
		const finalSlug =
			slug ||
			name
				.toLowerCase()
				.trim()
				.replace(/\s+/g, "-")
				.replace(/[^\w-]/g, "");

		// Check uniqueness
		const existing = await Category.findOne({
			$or: [{ name: name.trim() }, { slug: finalSlug }],
		});
		if (existing) {
			return res.status(400).json({ message: "A category with this name or slug already exists" });
		}

		let uploadedImageUrl = imageUrl;

		// Upload to Cloudinary if it's a base64 image
		if (imageUrl.startsWith("data:")) {
			const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
				folder: "categories",
			});
			uploadedImageUrl = uploadResponse.secure_url;
		}

		const category = new Category({
			name: name.trim(),
			slug: finalSlug,
			imageUrl: uploadedImageUrl,
		});

		await category.save();
		res.status(201).json(category);
	} catch (error) {
		console.error("Error creating category:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT /api/categories/:id  — admin
export const updateCategory = async (req, res) => {
	try {
		const { name, slug, imageUrl, isActive } = req.body;

		const category = await Category.findById(req.params.id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		// Check name/slug uniqueness (exclude current doc)
		if (name || slug) {
			const finalSlug =
				slug ||
				(name
					? name
							.toLowerCase()
							.trim()
							.replace(/\s+/g, "-")
							.replace(/[^\w-]/g, "")
					: category.slug);

			const conflict = await Category.findOne({
				_id: { $ne: req.params.id },
				$or: [
					{ name: (name || category.name).trim() },
					{ slug: finalSlug },
				],
			});
			if (conflict) {
				return res.status(400).json({ message: "Another category already uses this name or slug" });
			}

			if (name) category.name = name.trim();
			category.slug = finalSlug;
		}

		// Upload new image if base64
		if (imageUrl) {
			if (imageUrl.startsWith("data:")) {
				const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
					folder: "categories",
				});
				category.imageUrl = uploadResponse.secure_url;
			} else {
				category.imageUrl = imageUrl;
			}
		}

		if (typeof isActive === "boolean") category.isActive = isActive;

		await category.save();
		res.status(200).json(category);
	} catch (error) {
		console.error("Error updating category:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/categories/:id  — admin
export const deleteCategory = async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}
		res.status(200).json({ message: "Category deleted", name: category.name });
	} catch (error) {
		console.error("Error deleting category:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
