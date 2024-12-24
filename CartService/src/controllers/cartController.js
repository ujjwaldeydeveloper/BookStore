const Cart = require("../model/cartModel.js");
const Order = require("../model/orderModel.js");
const axios = require('axios');
const amqp = require('amqplib/callback_api');
// Add books to the cart by quantity
exports.addToCart = async (req, res) => {
  const { username, bookId, quantity } = req.body;
  

  try {
    const bookResponse = await axios.get(`http://localhost:3002/api/books/${bookId}`,{headers: {Authorization: req.headers.authorization}});
    // const book = bookResponse.data;
    // console.log(bookResponse);
    // console.log(bookResponse.data[0].bookId);
    if(bookResponse.status !== 200){  
      return res.status(404).json({ message: "Book not found" });
    }
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

// View Cart
exports.viewCart = async (req, res) => {
  const { username } = req.params; // Extract userId from the URL
  console.log(username);
  
  try {
    const cart = await Cart.findOne({ username: username });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  const { username } = req.params;
  try {
    await Cart.findOneAndDelete({ username });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Checkout
exports.checkout = async (req, res) => {
  const { username} = req.params;
  try {
    const cart = await Cart.findOne({ username });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const order = new Order({
      username,
      items: cart.items,
    });

    await order.save();
    await Cart.findOneAndDelete({ username });


    //
    let bookStatus = {
      username: username,
      message:"Checkout Done",
    }
    amqp.connect('amqp://localhost', function (err, conn) {
      conn.createChannel(function (err, ch) {
          const queue = 'message_queue';
          const msg = JSON.stringify(bookStatus);
  
          ch.assertQueue(queue, { durable: false });
          ch.sendToQueue(queue, Buffer.from(msg));
          console.log(`Sent '${msg}' to ${queue}`);
      });
  
      setTimeout(function () { conn.close(); process.exit(0); }, 500);
    });
    //

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};