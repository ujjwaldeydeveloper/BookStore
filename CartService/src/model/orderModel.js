const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    items: [
      {
        bookId: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    // totalAmount: { type: Number, required: true }, // Calculate based on book prices
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Order", OrderSchema);