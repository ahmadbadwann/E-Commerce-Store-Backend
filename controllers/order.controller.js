import Order from "../models/order.model.js";

// POST /api/orders
export const createOrder = async (req, res) => {
	try {
		const { name, phone, address, cart, total } = req.body;

		if (!name || !phone || !address) {
			return res.status(400).json({ message: "Name, phone, and address are required" });
		}

		if (!Array.isArray(cart) || cart.length === 0) {
			return res.status(400).json({ message: "Cart is empty or invalid" });
		}

		// Auto-generate orderId: ORD-<timestamp>
		const orderId = `ORD-${Date.now()}`;

		const products = cart.map((item) => ({
			productId: item._id,
			name: item.name,
			image: item.image || "",
			price: item.price,
			quantity: item.quantity,
		}));

		const newOrder = new Order({
			orderId,
			customerName: name,
			phone,
			address,
			products,
			totalAmount: total,
			status: "New",
		});

		await newOrder.save();

		res.status(201).json(newOrder);
	} catch (error) {
		console.error("Error creating order:", error);
		res.status(500).json({ message: "Error creating order", error: error.message });
	}
};

// DELETE /api/orders/:id  (Admin)
export const deleteOrder = async (req, res) => {
	try {
		const order = await Order.findByIdAndDelete(req.params.id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		res.status(200).json({ message: "Order deleted successfully", orderId: order.orderId });
	} catch (error) {
		console.error("Error deleting order:", error);
		res.status(500).json({ message: "Error deleting order", error: error.message });
	}
};

// GET /api/orders  (Admin)
export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().sort({ createdAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: "Error fetching orders", error: error.message });
	}
};
