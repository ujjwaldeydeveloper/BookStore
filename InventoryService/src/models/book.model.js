const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookId: { type: String, required: true, default: () => Math.floor(Math.random() * 1000000).toString() },
    quantity: { type: Number, required: true, default: 10 },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    publishedYear: Number
});

bookSchema.pre('save', function(next) {
    if (this.isNew && this.quantity === undefined) {
        this.quantity = 10;
    }
    next();
});

module.exports = mongoose.model('Book', bookSchema);
