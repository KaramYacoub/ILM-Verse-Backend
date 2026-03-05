const path = require("path");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { course, student } = models;
const Assigment = require("../models//NOSQL/Assigment.js");

exports.addAssigment = async (req, res) => {
  try {
    const { course_id } = req?.params;
    const { title, description } = req?.body;
    const end_at = req.body.dueDate || req.body.end_at;
    const file = req?.file;
    const filePath = file?.destination + "/" + file?.filename;
    const fileType = file?.mimetype;
    const published_at = new Date().toISOString().split("T")[0]; // Extract 'YYYY-MM-DD' from the ISO string
    const newAssigment = await new Assigment({
      course_id: course_id,
      title: title,
      description: description,
      path: filePath,
      type: fileType,
      published_at: published_at,
      end_at: end_at,
    }).save();
    res.status(200).json({
      status: "success",
      data: newAssigment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteAssigment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const deletedAssigment = await Assigment.findById(assignment_id);
    if (!deletedAssigment) {
      return res.status(404).json({
        status: "failure",
        message: "Assigment not found",
      });
    }
    const filePath = deletedAssigment.path;

    try {
      // Asynchronously delete the media file
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file`);
    }
    await Assigment.findByIdAndDelete(assignment_id);

    res.status(204).json({
      status: "success",
      message: "Assigment Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAllAssigmentsForCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const assigments = await Assigment.find({ course_id: course_id }).select(
      "-studentsSubmission"
    ); // Excluding studentsSubmission

    if (assigments && assigments.length > 0) {
      res.status(200).json({
        status: "success",
        data: assigments,
      });
    } else {
      res.status(404).json({
        status: "failure",
        message: "No assignments found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAllAssigmentsForCourseForStudent = async (req, res) => {
  try {
    const { course_id } = req.params;
    let student_id;
    if (req.role === "parent") {
      student_id = req.params.student_id;
    } else {
      student_id = req.user.id;
    }
    // Fetch assignments for the specified course
    const assigments = await Assigment.find({
      course_id: course_id,
    });

    if (assigments && assigments.length > 0) {
      // Initialize an array to store the final response
      let finalAssigmentsResponse = [];

      for (let assigment of assigments) {
        // Create a copy of the assignment object without the studentsSubmission field
        let assignmentWithoutSubmission = assigment.toObject();
        delete assignmentWithoutSubmission.studentsSubmission;

        // Debugging: log the assignment and the studentsSubmission array

        // Check if there is a submission for the given student_id
        const studentSubmission = assigment.studentsSubmission.find(
          (submission) => submission.student_id === student_id
        );

        // Debugging: log the result of the submission search
        // Add the submission or "Not exist" to the assignment object
        if (studentSubmission) {
          assignmentWithoutSubmission.submission = studentSubmission;
        } else {
          assignmentWithoutSubmission.submission = "Not exist";
        }

        // Push the modified assignment to the final response array
        finalAssigmentsResponse.push(assignmentWithoutSubmission);
      }

      res.status(200).json({
        status: "success",
        data: finalAssigmentsResponse,
      });
    } else {
      res.status(200).json({
        status: "success",
        data: [], // Return empty array instead of 404
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.submitAssigment = async (req, res) => {
  try {
    const { assignment_id, course_id } = req.params;
    const student_id = req.user.id;

    const targetedAssigment = await Assigment.findById(assignment_id);
    const nowDate = new Date().toISOString().split("T")[0]; // Get current date as YYYY-MM-DD

    if (targetedAssigment) {
      const endDate = new Date(targetedAssigment.end_at)
        .toISOString()
        .split("T")[0]; // Extract date part of end_at as YYYY-MM-DD

      // Compare the current date with the end date of the assignment
      if (nowDate > endDate) {
        // If the current date is after the deadline
        fs.unlink(`${req.file.destination}/${req.file.filename}`, (err) => {
          if (err) {
            console.log("Error deleting file:", err);
          } else {
            console.log("File deleted due to late submission.");
          }
        });

        return res.status(400).json({
          status: "failure",
          message: "You cannot submit because the deadline has passed.",
        });
      }

      // If the submission is before the deadline, proceed with saving the submission
      targetedAssigment.studentsSubmission.push({
        student_id: student_id,
        submission_date: nowDate,
        path: `${req.file.destination}/${req.file.filename}`,
        type: req.file.mimetype,
      });

      await targetedAssigment.save();

      return res.status(201).json({
        status: "success",
        message: "Submission successful.",
      });
    } else {
      return res.status(404).json({
        status: "failure",
        message: "The assignment was not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.showAssigmentSubmission = async (req, res) => {
  try {
    const { assignment_id } = req.params; // Getting the assignment_id from params
    // Find the assignment by its assignment_id (no need to exclude studentsSubmission)
    const assignment = await Assigment.findById(assignment_id);
    if (assignment) {
      // Check if the assignment has submissions
      let studentsData = [];
      if (assignment.studentsSubmission) {
        for (let OneStudent of assignment.studentsSubmission) {
          const studentName = await student.findOne({
            where: {
              student_id: OneStudent.student_id,
            },
            attributes: ["student_id", "first_name", "last_name"],
          });
          if (studentName) {
            OneStudent = {
              student_id: OneStudent.student_id,
              name: `${studentName.first_name} ${studentName.last_name}`,
              submission_date: OneStudent.submission_date,
              path: OneStudent.path,
              type: OneStudent.type,
              isChecked: OneStudent.isChecked,
            };
            studentsData.push(OneStudent);
          } else {
            OneStudent.name = "Unknown";
          }
        }
        res.status(200).json({
          status: "success",
          data: {
            assigmentdata: {
              assignment_id: assignment._id,
              course_id: assignment.course_id,
              published_at: assignment.published_at,
              end_at: assignment.end_at,
              title: assignment.title,
              description: assignment.description,
              path: assignment.path,
              type: assignment.type,
            },
            studentsSubmission: studentsData,
          },
        });
      } else {
        res.status(400).json({
          status: "failure",
          message: "No submissions found for this assignment",
        });
      }
    } else {
      res.status(404).json({
        status: "failure",
        message: "Assignment not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { assignment_id } = req.params; // Getting the assignment_id from params
    const { studentsSubmissions } = req.body;
    const assigment = await Assigment.findById(assignment_id);
    if (assigment) {
      assigment.studentsSubmission = studentsSubmissions;
      await assigment.save();
      res.status(200).json({
        status: "success",
        data: assigment,
      });
    } else {
      return res.status(404).json({
        status: "failure",
        message: "Assignment not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
