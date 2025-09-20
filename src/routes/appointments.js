const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");

// Book appointment
router.post("/book", auth, appointmentController.bookAppointment);

// Cancel appointment
router.delete("/:appointmentId", auth, appointmentController.cancelAppointment);

// View student appointments
router.get("/student", auth, appointmentController.viewAppointments);

module.exports = router;
