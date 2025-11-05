// routes/cart.js
const express = require("express");
const router = express.Router();
const { CartItem, Product } = require("../models/index");
const auth = require("../middleware/auth");

// Get user's cart
router.get("/", auth, async (req, res) => {
  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [Product],
  });
  res.json(items);
});

// Add to cart
router.post("/add", auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const [item, created] = await CartItem.findOrCreate({
    where: { userId: req.user.id, productId },
    defaults: { quantity },
  });

  if (!created) {
    item.quantity = item.quantity + quantity;
    await item.save();
  }

  res.json(item);
});

// Update quantity
router.put("/update/:id", auth, async (req, res) => {
  const item = await CartItem.findByPk(req.params.id);
  if (!item || item.userId !== req.user.id)
    return res.status(404).json({ message: "Not found" });
  item.quantity = req.body.quantity;
  await item.save();
  res.json(item);
});

// Remove
router.delete("/remove/:id", auth, async (req, res) => {
  const item = await CartItem.findByPk(req.params.id);
  if (!item || item.userId !== req.user.id)
    return res.status(404).json({ message: "Not found" });
  await item.destroy();
  res.json({ message: "Removed" });
});

module.exports = router;
