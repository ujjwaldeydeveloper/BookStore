const express = require("express");
const router = express.Router();
const {
  addToCart,
  deleteCartItem,
  clearCart,
  checkout,
} = require("../controllers/cartController.js");

router.post("/add", addToCart);
router.post("/delete", deleteCartItem);
router.post("/clear", clearCart);
router.post("/checkout", checkout);

module.exports = router;