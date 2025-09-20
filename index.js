// index.js
const express = require("express");
const app = require("./src/app");
const connectDB = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Only connect and listen if NOT running tests
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("✅ MongoDB Connected...");
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch((err) => console.error(err));
}

module.exports = app; // export app for Supertest
