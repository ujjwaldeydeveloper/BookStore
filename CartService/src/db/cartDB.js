const Mongoose = require("mongoose");

const localDB = "mongodb://localhost:27017/cartDB";
const connectDB = async function () {
    await Mongoose.connect(localDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB", err));
};

module.exports = connectDB;