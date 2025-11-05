// routes/products.js
const express = require("express");
const router = express.Router();
const { Product } = require("../models/index");
const auth = require("../middleware/auth");

// Get all products
router.get("/", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// Get product by id
router.get("/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

// Create product (admin)
router.post("/", auth, async (req, res) => {
  // optional: check req.user.isAdmin
  if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
  const p = await Product.create(req.body);
  res.json(p);
});

// Update delete similar...
router.put("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  await product.update(req.body);
  res.json(product);
});

router.delete("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  await product.destroy();
  res.json({ message: "Deleted" });
});

module.exports = router;
