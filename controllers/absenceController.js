const AbsenceReport = require("../models/NOSQL/AbsenceReport");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { student, teacher } = models;

// recives array of students and date if the absenceReport exists the system will update it ,
// if not exist the system will create another one
exports.updateAbsence = async (req, res) => {
  try {
    const { students, date } = req.body;
    let section_id;
    if (req.role === "teacher") {
      const foundedTeacher = await teacher.findOne({
        where: {
          teacher_id: req.user.id,
        },
        attributes: ["section_id"],
      });
      section_id = foundedTeacher.section_id;
      if (!section_id) {
        return res.status(404).json({
          status: "failed",
          message: "This teacher don't asiggned to section",
        });
      }
    } else {
      section_id = req.body.section_id;
    }
    // Check if an AbsenceReport exists for the same section_id and date
    const existingReport = await AbsenceReport.findOne({ section_id, date });
    if (existingReport) {
      // If the report exists, update the students data
      existingReport.students = students;
      await existingReport.save();

      res.status(200).json({
        status: "success",
        message: "Absence Report Updated Successfully",
      });
    } else {
      // If no report exists, create a new one
      const newAbsenceReport = new AbsenceReport({
        section_id: section_id,
        date: date,
        students: students,
      });
      await newAbsenceReport.save();

      res.status(201).json({
        status: "success",
        message: "Absence Report Created Successfully",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getAbsence = async (req, res) => {
  try {
    const { date } = req.params;
    let section_id;
    if (req.role === "teacher") {
      const foundedTeacher = await teacher.findOne({
        where: {
          teacher_id: req.user.id,
        },
        attributes: ["section_id"],
      });
      section_id = foundedTeacher.section_id;
      if (!section_id) {
        return res.status(404).json({
          status: "failed",
          message: "This teacher don't asiggned to section",
        });
      }
    } else {
      section_id = req.params.section_id;
    }
    // Step 1: Fetch all students in the specific section
    const studentsInSection = await student.findAll({
      where: {
        section_id: section_id,
      },
      attributes: ["student_id", "first_name", "last_name"],
    });

    // Step 2: Check if an absence report exists for the same section_id and date
    const absenceReport = await AbsenceReport.findOne({ section_id, date });

    // Step 3: Format the response
    let responseData;

    if (absenceReport) {
      // If the absence report exists, map through absenceReport.students
      responseData = absenceReport.students
        .map((absentStudent) => {
          // Find the corresponding student in studentsInSection by student_id
          const studentInSection = studentsInSection.find(
            (student) => student.student_id === absentStudent.student_id
          );

          if (studentInSection) {
            return {
              student_id: studentInSection.student_id,
              fullname: `${studentInSection.first_name} ${studentInSection.last_name}`,
              isAbsence: absentStudent.isAbsence, // Keep the isAbsence from the report
            };
          }
        })
        .filter(Boolean); // Remove undefined values if no student is found
    } else {
      // If no absence report exists, return all students with isAbsence set to false
      responseData = studentsInSection.map((student) => ({
        student_id: student.student_id,
        fullname: `${student.first_name} ${student.last_name}`,
        isAbsence: false, // Default absence status is false
      }));
    }

    // Step 4: Send the response
    res.status(200).json({
      status: "success",
      data: responseData,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getStudentAbsences = async (req, res) => {
  try {
    const { student_id, section_id } = req.params;

    // Find the absence reports for the specific section
    const absenceReports = await AbsenceReport.find({ section_id });

    // Initialize variables to store the count and dates
    let absenceCount = 0;
    let absenceDates = [];

    // Loop through all reports and check if the student was absent
    absenceReports.forEach((report) => {
      report.students.forEach((student) => {
        if (student.student_id === student_id && student.isAbsence) {
          absenceCount++; // Increment the absence count
          absenceDates.push(report.date); // Add the date to the array
        }
      });
    });

    // Send the response with count and dates
    res.status(200).json({
      absenceCount,
      absenceDates,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
