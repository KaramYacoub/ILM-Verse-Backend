const mongoose = require("mongoose");

// Define the Assigment Schema
const AssigmentSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
  },
  published_at: {
    type: String,
    required: true,
  },
  end_at: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    require: true,
  },
  path: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  studentsSubmission: [
    {
      student_id: {
        type: String,
        required: true,
      },
      submission_date: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      isChecked: {
        type: Boolean,
        default: false,
      },
      mark: {
        type: Number,
        required: false,
      },
    },
  ],
});

// Create the AbsenceReport model
const Assigment = mongoose.model("Assigment", AssigmentSchema);

module.exports = Assigment;
