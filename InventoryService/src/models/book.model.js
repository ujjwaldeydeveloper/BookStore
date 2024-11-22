const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookId: { type: String, required: true },
    quantity: { type: Number, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    publishedYear: Number
});

module.exports = mongoose.model('Book', bookSchema);
