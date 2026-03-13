import Coupon from "../models/coupon.model.js";

// GET /api/coupons  — returns the user's personal coupon if they have one
export const getCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findOne({
			userId: req.user._id,
			isActive: true,
			expirationDate: { $gt: new Date() },
		});
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/coupons/validate  — validates any coupon code (global or personal)
export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;

		if (!code || !code.trim()) {
			return res.status(400).json({ message: "Please enter a coupon code" });
		}

		// Look for a coupon that is either:
		//   • personal and belongs to this user, OR
		//   • global (userId is null)
		const coupon = await Coupon.findOne({
			code: code.trim().toUpperCase(),
			isActive: true,
			$or: [{ userId: req.user._id }, { userId: null }],
		});

		if (!coupon) {
			return res.status(404).json({ message: "Invalid coupon code" });
		}

		// Check expiry
		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;
			await coupon.save();
			return res.status(400).json({ message: "This coupon has expired" });
		}

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// ── Admin endpoints ──────────────────────────────────────────────────────────

// GET /api/coupons/all  — admin: list all coupons
export const getAllCoupons = async (req, res) => {
	try {
		const coupons = await Coupon.find().sort({ createdAt: -1 }).populate("userId", "name email");
		res.json(coupons);
	} catch (error) {
		console.log("Error in getAllCoupons controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/coupons/admin  — admin: create a coupon (global or personal)
export const createCoupon = async (req, res) => {
	try {
		const { code, discountPercentage, expirationDate, userId } = req.body;

		if (!code || !discountPercentage || !expirationDate) {
			return res.status(400).json({ message: "code, discountPercentage, and expirationDate are required" });
		}

		const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
		if (existing) {
			return res.status(400).json({ message: "A coupon with this code already exists" });
		}

		const coupon = new Coupon({
			code: code.trim().toUpperCase(),
			discountPercentage,
			expirationDate: new Date(expirationDate),
			userId: userId || null, // null = global
		});

		await coupon.save();
		res.status(201).json(coupon);
	} catch (error) {
		console.log("Error in createCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT /api/coupons/admin/:id  — admin: update a coupon
export const updateCoupon = async (req, res) => {
	try {
		const { discountPercentage, expirationDate, isActive } = req.body;

		const coupon = await Coupon.findById(req.params.id);
		if (!coupon) return res.status(404).json({ message: "Coupon not found" });

		if (discountPercentage !== undefined) coupon.discountPercentage = discountPercentage;
		if (expirationDate) coupon.expirationDate = new Date(expirationDate);
		if (typeof isActive === "boolean") coupon.isActive = isActive;

		await coupon.save();
		res.json(coupon);
	} catch (error) {
		console.log("Error in updateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/coupons/admin/:id  — admin: delete a coupon
export const deleteCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findByIdAndDelete(req.params.id);
		if (!coupon) return res.status(404).json({ message: "Coupon not found" });
		res.json({ message: "Coupon deleted", code: coupon.code });
	} catch (error) {
		console.log("Error in deleteCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
