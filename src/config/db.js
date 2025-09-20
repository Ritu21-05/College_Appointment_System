require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri =
    process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ MongoDB Connected...");
};

module.exports = connectDB;
