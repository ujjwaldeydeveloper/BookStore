const express = require("express");
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");

// middleware
const app = express()
app.use(express.json())
app.use(cookieParser());

connectDB();
const PORT = 5000
const server = app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`))

// registerUser end point (user authentication)
app.use("/api/", require("./Auth/Route"));

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})
