const express = require("express");
const app = express();
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/availability", require("./routes/availability"));
app.use("/api/appointments", require("./routes/appointments"));

module.exports = app;
