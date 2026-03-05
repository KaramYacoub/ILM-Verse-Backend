const mongoose = require("mongoose");

// Define the Event Schema
const reportSchema = new mongoose.Schema({
  instructor_id: {
    type: String,
    required: true,
  },
  instructor_type: {
    type: String,
    required: true,
  },
  course_id: {
    type: String,
    required: false,
  },
  student_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
