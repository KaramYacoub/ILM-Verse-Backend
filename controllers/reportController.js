const Report = require("../models/NOSQL/Report");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { student, teacher, parent, course, admin } = models;

// add a report for a student in ✅
exports.addReport = async (req, res) => {
  const { course_id, student_id, title, description, date } = req.body;
  const role = req.role;
  const id = req.user.id;
  try {
    const formattedDate = new Date(date).toISOString().split("T")[0]; // Formats to YYYY-MM-DD

    const newReport = await new Report({
      instructor_id: id,
      instructor_type: role,
      course_id: course_id, // Optional field, can be left out if not needed
      student_id: student_id,
      title: title,
      description: description,
      date: formattedDate,
    }).save();

    res.status(201).json({
      status: "success",
      message: "Report Added Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getStudentReports = async (req, res) => {
  try {
    const { student_id } = req.params;
    const reports = await Report.find({
      student_id: student_id,
    });
    let teacherReports = [];
    let adminReports = [];
    for (let oneReport of reports) {
      if (oneReport.instructor_type == "teacher") {
        const teacherName = await teacher.findOne({
          where: {
            teacher_id: oneReport.instructor_id,
          },
          attributes: ["first_name", "last_name"],
        });
        const courseName = await course.findOne({
          where: {
            course_id: oneReport.course_id,
          },
          attributes: ["subject_name"],
        });
        const teacherReport = {
          teacher: `${teacherName.first_name} ${teacherName.last_name}`,
          course: `${courseName.subject_name}`,
          report_id: oneReport._id,
          title: oneReport.title,
          description: oneReport.description,
          date: oneReport.date,
        };
        teacherReports.push(teacherReport);
      } else if (oneReport.instructor_type == "admin") {
        const adminName = await admin.findOne({
          where: {
            gm_id: oneReport.instructor_id,
          },
          attributes: ["first_name", "last_name"],
        });

        const adminReport = {
          admin: `${adminName.first_name} ${adminName.last_name}`,
          report_id: oneReport._id,
          title: oneReport.title,
          description: oneReport.description,
          date: oneReport.date,
        };
        adminReports.push(adminReport);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        teacherReports: teacherReports,
        adminReports: adminReports,
        count: teacherReports.length + adminReports.length || "0",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.deleteReport = async (req, res) => {
  try {
    const { report_id } = req.body;
    const deletedReport = await Report.findByIdAndDelete(report_id);
    res.status(200).json({
      sattus: "success",
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
