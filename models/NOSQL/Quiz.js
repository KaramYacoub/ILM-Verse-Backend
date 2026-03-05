const mongoose = require("mongoose");

// Define the Quiz Schema
const QuizSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  start_date: {
    type: String,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  total_points: {
    type: Number,
    required: true,
  },
  able_to_view: {
    type: Boolean,
    default: false,
  },
  questions: [
    {
      question_text: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
      options: [
        {
          option_text: {
            type: String,
            required: true,
          },
          isCorrectAnswer: {
            type: Boolean,
            required: true,
          },
        },
      ],
    },
  ],
  Submissions: [
    {
      student_id: {
        type: String,
        required: true,
      },
      questions_submission: [
        {
          question_text: {
            type: String,
            required: true,
          },
          choosed_answer: {
            type: String,
            required: true,
          },
          correct_answer: { type: String, required: false },
        },
      ],
      submited_at: {
        type: String,
        default: new Date().toISOString().split("T")[0],
      },
      mark: {
        type: Number,
        required: false,
      },
    },
  ],
});

// Create the Quiz model
const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
