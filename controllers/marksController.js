const path = require("path");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const {
  course,
  teacher,

  course_student,
  student,
  mark_type,
  student_marks,
} = models;

// marks
exports.addMark = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { student_id, mark_type, mark_value } = req.body;
    // Mark validation based on mark_type

    if (
      (mark_type === "MT-001" ||
        mark_type === "MT-002" ||
        mark_type === "MT-003") &&
      (mark_value < 0 || mark_value > 20)
    ) {
      return res.status(400).json({
        error: "Mark value should be between 0 and 20",
      });
    } else if (mark_type === "MT-004" && (mark_value < 0 || mark_value > 40)) {
      return res.status(400).json({
        error: "Mark value should be between 0 and 40",
      });
    }

    const existingMark = await student_marks.findOne({
      where: {
        student_id: student_id,
        type_id: mark_type,
        course_id: course_id,
      },
    });
    // If the mark exists, return an error message
    if (existingMark) {
      return res.status(400).json({
        error: "Mark already exists for this student, course, and mark type.",
      });
    }
    // Create new mark record if no existing mark found
    const newMark = await student_marks.create({
      course_id: course_id,
      student_id: student_id,
      type_id: mark_type,
      mark_value: mark_value,
    });

    res.status(201).json({
      status: "success",
      message: "Mark Added Successfully",
      data: newMark,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.editMark = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { student_id, mark_type, mark_value } = req.body;
    // Mark validation based on mark_type
    if (
      (mark_type === "MT-001" ||
        mark_type === "MT-002" ||
        mark_type === "MT-003") &&
      (mark_value < 0 || mark_value > 20)
    ) {
      return res.status(400).json({
        error: "Mark value should be between 0 and 20",
      });
    } else if (mark_type === "MT-004" && (mark_value < 0 || mark_value > 40)) {
      return res.status(400).json({
        error: "Mark value should be between 0 and 40",
      });
    }

    // First check if the mark exists
    const existingMark = await student_marks.findOne({
      where: {
        course_id: course_id,
        student_id: student_id,
        type_id: mark_type,
      },
    });

    if (!existingMark) {
      return res.status(404).json({
        error: "Mark not found",
      });
    }

    // Update the mark
    await student_marks.update(
      { mark_value: mark_value },
      {
        where: {
          course_id: course_id,
          student_id: student_id,
          type_id: mark_type,
        },
      }
    );

    // Get the updated mark
    const updatedMark = await student_marks.findOne({
      where: {
        course_id: course_id,
        student_id: student_id,
        type_id: mark_type,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Mark updated successfully",
      data: updatedMark,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.getMark = async (req, res) => {
  try {
    const { course_id, student_id, mark_type } = req.params;

    // Fetch the mark from the database
    const mark = await student_marks.findOne({
      where: {
        course_id: course_id,
        student_id: student_id,
        type_id: mark_type, // Ensure that the field is 'type_id' in the database model
      },
    });

    // Check if the mark was found and send the appropriate response
    if (mark) {
      return res.status(200).json({
        status: "success",
        data: mark.mark_value, // Return the mark value if found
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: "No mark found", // Message indicating no mark found
      });
    }
  } catch (error) {
    // Handle and log errors
    console.error("Error fetching mark:", error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
exports.getStudentMarks = async (req, res) => {
  try {
    const student_id =
      req.role === "parent" ? req.params.student_id : req.user.id;

    // Get all courses the student is enrolled in, including teacher info
    const studentCourses = await course_student.findAll({
      where: { student_id },
      include: [
        {
          model: course,
          as: "course",
          attributes: ["course_id", "subject_name"],
          include: [
            {
              model: teacher,
              as: "teacher",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
      ],
    });

    // Extract course IDs
    const courseIds = studentCourses.map((sc) => sc.course.course_id);

    // Mark types you want to check
    const markTypes = ["First", "Second", "Third", "Final"];
    const typeIds = markTypes.map((type) => getMarkTypeId(type));

    // Fetch all marks for this student in these courses and mark types at once
    const allMarks = await student_marks.findAll({
      where: {
        student_id,
        course_id: courseIds,
        type_id: typeIds,
      },
      include: [
        {
          model: mark_type,
          as: "type",
          attributes: ["type_name"],
        },
      ],
    });
    // Organize marks by course_id and type_name for quick lookup
    const marksMap = {};
    for (const mark of allMarks) {
      if (!marksMap[mark.course_id]) {
        marksMap[mark.course_id] = {};
      }
      marksMap[mark.course_id][mark.type.type_name] = mark.mark_value;
    }

    // Build the final response array
    const coursesGrades = studentCourses.map((oneCourse) => {
      const courseId = oneCourse.course.course_id;
      const subjectName = oneCourse.course.subject_name || "Unknown";
      const teacherName = `${oneCourse.course.teacher.first_name} ${oneCourse.course.teacher.last_name}`;

      // Map marks for each type, default to "Not Marked" if no mark found
      const marks = markTypes.map((type) => ({
        type,
        mark_value: marksMap[courseId]?.[type] ?? "Not Marked",
      }));

      return {
        course_id: courseId,
        subject_name: subjectName,
        teacher: teacherName,
        marks,
      };
    });

    res.status(200).json({
      status: "success",
      data: coursesGrades,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get the mark type ID based on the type name
const getMarkTypeId = (typeName) => {
  switch (typeName) {
    case "First":
      return "MT-001"; // Assuming 'MT-001' is the ID for 'First'
    case "Second":
      return "MT-002"; // Assuming 'MT-002' is the ID for 'Second'
    case "Third":
      return "MT-003"; // Assuming 'MT-003' is the ID for 'Third'
    case "Final":
      return "MT-004"; // Assuming 'MT-004' is the ID for 'Final'
    default:
      return null;
  }
};
