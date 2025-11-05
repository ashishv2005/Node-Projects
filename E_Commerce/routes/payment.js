// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleware/auth");
const { CartItem, Product } = require("../models/index");

router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [Product],
    });
    if (!cartItems.length)
      return res.status(400).json({ message: "Cart empty" });

    let amount = 0;
    cartItems.forEach(
      (ci) => (amount += Math.round(ci.quantity * ci.Product.price * 100))
    ); // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { userId: req.user.id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: "Payment error", error: err.message });
  }
});

module.exports = router;
