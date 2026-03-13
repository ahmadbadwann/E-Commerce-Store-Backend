import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		slug: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Auto-generate slug from name before save
categorySchema.pre("validate", function (next) {
	if (this.isModified("name") && !this.slug) {
		this.slug = this.name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^\w-]/g, "");
	}
	next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
