import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			unique: true,
			required: true,
		},
		customerName: {
			type: String,
			required: true,
			trim: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		products: [
			{
				productId: {
					type: String,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				image: {
					type: String,
					default: "",
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ["New", "Processing", "Shipped", "Delivered", "Cancelled"],
			default: "New",
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

// Drop the legacy stripeSessionId index left over from the old Stripe integration.
// That index had unique:true so multiple orders with null value cause E11000.
Order.collection
	.dropIndex("stripeSessionId_1")
	.catch(() => {
		// Index doesn't exist — nothing to do.
	});

export default Order;
