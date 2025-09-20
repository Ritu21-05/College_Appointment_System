const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true }, // e.g., "10:00"
  status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
