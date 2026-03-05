const mongoose = require("mongoose");

// Define the Course Unit Schema
const CourseUnitSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
  },
  unit_name: {
    type: String,
    required: true,
  },
  unit_description: {
    type: String,
    required: true,
  },
  // Media field as an array of objects
  media: [
    {
      title: {
        type: String,
        required: [true, "Title is required"], // Required for each media
      },
      path: {
        type: String,
        required: [true, "Path is required"], // Required for each media
      },
      date: {
        type: Date,
        required: [true, "Date is required"], // Required for each media
      },
      type: {
        type: String,
        required: [true, "Type is required"], // Required for each media
      },
    },
  ],
});

const CourseUnit = mongoose.model("CourseUnit", CourseUnitSchema);

module.exports = CourseUnit;
