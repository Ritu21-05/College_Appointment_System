const Availability = require("../models/Availability");

// Professor adds slots
exports.createAvailability = async (req, res) => {
  try {
    if (req.user.role !== "professor") return res.status(403).json({ msg: "Only professors can add availability" });
    
    const { date, slots } = req.body;
    const availability = new Availability({ professor: req.user.id, date, slots });
    await availability.save();
    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// View professor's availability
exports.getProfessorAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ professor: req.params.professorId })
      .populate("professor", "name email");
    res.json(availability);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
