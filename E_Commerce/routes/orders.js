// routes/orders.js
const express = require("express");
const router = express.Router();
const { Order, OrderItem, CartItem, Product } = require("../models/index");
const auth = require("../middleware/auth");

// Place order (simple flow)
router.post("/place", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [Product],
    });
    if (!cartItems.length)
      return res.status(400).json({ message: "Cart empty" });

    // calculate total
    let total = 0;
    cartItems.forEach((ci) => (total += ci.quantity * ci.Product.price));

    // create order
    const order = await Order.create({
      userId: req.user.id,
      total,
      status: "paid",
      address: req.body.address || "",
    });

    // create order items
    const createdItems = await Promise.all(
      cartItems.map((ci) => {
        return OrderItem.create({
          orderId: order.id,
          productId: ci.productId,
          quantity: ci.quantity,
          price: ci.Product.price,
        });
      })
    );

    // clear user's cart
    await CartItem.destroy({ where: { userId: req.user.id } });

    res.json({ order, items: createdItems });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [OrderItem],
  });
  res.json(orders);
});

module.exports = router;
