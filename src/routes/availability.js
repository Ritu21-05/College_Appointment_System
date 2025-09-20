const express = require("express");
const router = express.Router();
const { createAvailability, getProfessorAvailability } = require("../controllers/availabilityController");
const auth = require("../middleware/auth");

router.post("/", auth, createAvailability);
router.get("/:professorId", auth, getProfessorAvailability);

module.exports = router;
