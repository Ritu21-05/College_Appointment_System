const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");

// Student books a slot
exports.bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ msg: "Only students can book slots" });

    const { availabilityId, time } = req.body;

    // Mark slot as booked
    const availability = await Availability.findOneAndUpdate(
      { _id: availabilityId, "slots.time": time, "slots.isBooked": false },
      { $set: { "slots.$.isBooked": true } },
      { new: true }
    );

    if (!availability) return res.status(400).json({ msg: "Slot not available" });

    // Create appointment
    const appointment = new Appointment({
      student: req.user.id,
      professor: availability.professor,
      availability: availability._id,
      date: availability.date,
      timeSlot: time
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Professor cancels a student appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

    if (req.user.role !== "professor" || appointment.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Free slot in availability
    await Availability.findByIdAndUpdate(
      appointment.availability,
      { $set: { "slots.$[elem].isBooked": false } },
      { arrayFilters: [{ "elem.time": appointment.timeSlot }] }
    );

    await appointment.deleteOne();
    res.json({ msg: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Student views their appointments
exports.viewAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate("professor", "name email")
      .populate("availability");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
