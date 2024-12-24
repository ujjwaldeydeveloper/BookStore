const express = require("express");
const router = express.Router();
const {
  addToCart,
  deleteCartItem,
  clearCart,
  checkout,
  viewCart,
} = require("../controllers/cartController.js");

router.post("/add", addToCart);
router.post("/delete", deleteCartItem);
router.post("/clear/:username", clearCart);
router.post("/checkout/:username", checkout);
router.get("/view/:username", viewCart);

module.exports = router;