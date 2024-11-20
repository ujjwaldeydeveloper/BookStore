const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  logincount: {
    type: Number,
    default: 0,
    required: true,
  }
});

const User = Mongoose.model("user", UserSchema);
module.exports = User;