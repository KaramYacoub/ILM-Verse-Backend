const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateUser = require("../Middlewares/authMiddleware");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const {
  course_student,
  student,
  course,
  section,
  grade,
  department,
  student_marks,
  mark_type,
  teacher,
} = models;

exports.getCoursesForStudent = async (req, res) => {
  try {
    let student_id;
    if (req.role === "parent") {
      student_id = req.params.student_id;
    } else {
      student_id = req.user.id;
    }

    const coursesForStudent = await course_student.findAll({
      where: {
        student_id: student_id,
      },
      attributes: ["course_id"],
      include: [
        {
          model: course,
          as: "course",
          attributes: ["subject_name"],
          include: {
            model: section,
            as: "section",
            attributes: ["section_name"],
            include: {
              model: grade,
              as: "grade",
              attributes: ["grade_name"],
            },
          },
        },
      ],
    });
    if (!coursesForStudent) {
      return res.stats(404).json({
        status: "failure",
        message: "No courses found for this student",
      });
    }
    res.status(200).json({
      status: "success",
      data: coursesForStudent,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
