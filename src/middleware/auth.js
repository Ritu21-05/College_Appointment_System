const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ msg: "No token, authorization denied" });

    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ msg: "Token is not valid" });
    res.status(500).json({ msg: "Server Error" });
  }
};
