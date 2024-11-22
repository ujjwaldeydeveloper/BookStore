const Cart = require("../model/cartModel.js");
const axios = require('axios');
// Add books to the cart by quantity
exports.addToCart = async (req, res) => {
  const { username, bookId, quantity } = req.body;
  

  try {
    const bookResponse = await axios.get(`http://localhost:3002/books/${bookId}`);
    const book = bookResponse.data;

    let cart = await Cart.findOne({ username });
    if (!cart) {
      cart = new Cart({ username, items: [{bookId, quantity}] });
    }

    const existingItem = cart.items.find((item) => item.bookId === bookId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    const savedCart  = await cart.save();
    res.status(200).json({ message: "Book added to cart", savedCart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete cart items by quantity
exports.deleteCartItem = async (req, res) => {
  const { username, bookId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ username });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex((item) => item.bookId === bookId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

    const item = cart.items[itemIndex];
    if (item.quantity > quantity) {
      item.quantity -= quantity;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  const { username } = req.body;
  try {
    await Cart.findOneAndDelete({ username });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Checkout
exports.checkout = async (req, res) => {
  const { username, totalAmount } = req.body;
  try {
    const cart = await Cart.findOne({ username });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const order = new Order({
      username,
      items: cart.items,
      totalAmount,
    });

    await order.save();
    await Cart.findOneAndDelete({ username });

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};