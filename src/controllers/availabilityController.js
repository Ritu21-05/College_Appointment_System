const Availability = require("../models/Availability");

// Create availability
exports.createAvailability = async (req, res) => {
  try {
    if (req.user.role !== "professor")
      return res.status(403).json({ msg: "Only professors can add availability" });

    const { date, slots } = req.body;

    // Ensure slots have isBooked field
    const formattedSlots = slots.map(s => ({ ...s, isBooked: false }));

    const availability = new Availability({
      professor: req.user.id,
      date,
      slots: formattedSlots,
    });

    await availability.save();
    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// View availability by professor
exports.viewAvailability = async (req, res) => {
  try {
    const availabilities = await Availability.find({ professor: req.params.professorId });
    if (!availabilities.length) return res.status(200).json([]); 

    res.status(200).json(availabilities);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
