const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true,
        required: true 
    },
    items: [
        {
            bookId: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    // totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("cart", cartSchema);