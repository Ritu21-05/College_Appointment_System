const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    slots: [
      {
        time: { type: String, required: true }, // e.g. "10:00 AM"
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
