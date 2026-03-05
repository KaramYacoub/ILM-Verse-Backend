const mongoose = require("mongoose");

// Define the Event Schema
const AbsenceReportSchema = new mongoose.Schema({
  section_id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  students: [
    {
      student_id: {
        type: String,
        required: true,
      },
      isAbsence: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

// Create the Event model
const AbsenceReport = mongoose.model("AbsenceReport", AbsenceReportSchema);

module.exports = AbsenceReport;
