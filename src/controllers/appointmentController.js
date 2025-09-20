const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");

exports.bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "student") 
      return res.status(403).json({ msg: "Only students can book slots" });

    const { availabilityId, time } = req.body;

    // Find availability
    const availability = await Availability.findById(availabilityId);
    if (!availability) return res.status(404).json({ msg: "Availability not found" });

    // Find the slot
    const slot = availability.slots.find(s => s.time === time && !s.isBooked);
    if (!slot) return res.status(404).json({ msg: "Slot not available" });

    // Mark slot as booked
    slot.isBooked = true;
    await availability.save();

    // Create appointment (use 'slot' to match schema)
    const appointment = new Appointment({
      student: req.user.id,
      professor: availability.professor,
      availability: availability._id,
      date: availability.date,
      slot: time
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

    if (req.user.role !== "professor" || appointment.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Availability.findByIdAndUpdate(
      appointment.availability,
      { $set: { "slots.$[elem].isBooked": false } },
      { arrayFilters: [{ "elem.time": appointment.slot }] } // match 'slot' field
    );

    await appointment.deleteOne();
    res.status(200).json({ msg: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.viewAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate("professor", "name email")
      .populate("availability");
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
