const path = require("path");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const bcrypt = require("bcryptjs"); // For hashing
const fs = require("fs");
const {
  department,
  student,
  parent,
  section,
  teacher,
  admin,
  course,
  course_student,
  grade,
  student_marks,
  event,
  announcment,
} = models; // extract all the needed models
const eventMedia = require("../models/NOSQL/Event");

// Add Admin ✅
exports.addAdmin = async (req, res) => {
  try {
    const { password, first_name, last_name, email } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        status: "failed",
        error: "All fields are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        status: "failed",
        error: "Admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 3);
    console.log(hashedPassword);
    console.log(hashedPassword);
    const newAdmin = await admin.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      data: {
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        email: newAdmin.email,
      },
      message: `${newAdmin.first_name} ${newAdmin.last_name} added successfully`,
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({
      status: "failed",
      error: "Internal server error",
    });
  }
};

// Add Teacher ✅
exports.addTeacher = async (req, res) => {
  const { password, first_name, last_name, email, section_id, dept_id } =
    req.body;

  // Validation
  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !section_id ||
    !dept_id
  ) {
    return res.status(400).json({
      status: "failed",
      error: "All fields are required",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 3);

  // Check if admin already exists
  const existingTeacher = await admin.findOne({ where: { email } });
  if (existingTeacher) {
    return res.status(400).json({
      status: "failed",
      error: "Teacher with this email already exists",
    });
  }

  try {
    const newTeacher = await teacher.create({
      first_name,
      last_name,
      email,
      section_id,
      dept_id,
      password: hashedPassword,
    });
    res.status(201).json({
      status: "success",
      data: {
        first_name: newTeacher.first_name,
        last_name: newTeacher.last_name,
        email: newTeacher.email,
        section_id: newTeacher.section_id,
        dept_id: newTeacher.dept_id,
      },
      message: `${newTeacher.first_name} ${newTeacher.last_name} added`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add Parent ✅
exports.addParent = async (req, res) => {
  const { password, first_name, last_name, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 3);

  try {
    const newParent = await parent.create({
      first_name,
      last_name,
      phone,
      password: hashedPassword,
    });
    res.status(201).json({
      status: "success",
      data: {
        first_name: newParent.first_name,
        last_name: newParent.last_name,
        phone: newParent.phone,
      },
      message: `${newParent.first_name} ${newParent.last_name} added`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all Grades ✅ (just for the student addition)
exports.getGrades = async (req, res) => {
  try {
    allGrades = await grade.findAll();
    res.status(200).json({
      status: "success",
      data: allGrades,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Sections ✅ (just for the student addition)
exports.getSections = async (req, res) => {
  try {
    const { grade_id } = req.params;
    const Sections = await section.findAll({
      where: {
        grade_id: req.params.grade_id,
      },
    });
    res.status(200).json({
      status: "success",
      data: Sections,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add Student ✅
exports.addStudent = async (req, res) => {
  const { password, first_name, last_name, parent_id, section_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 3);

  // Here Will be the SQL insertion for student
  try {
    const newStudent = await student.create({
      first_name,
      last_name,
      parent_id,
      section_id,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      data: {
        first_name: newStudent.first_name,
        last_name: newStudent.last_name,
        parent_id: newStudent.parent_id,
        section_id: newStudent.section_id,
      },
      message: `${newStudent.first_name} ${newStudent.last_name} added`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get Teacher by section(for course addition)
exports.getTeachersBySection = async (req, res) => {
  try {
    const { grade_id } = req.params;
    const { dept_id } = await grade.findOne({
      where: {
        grade_id: grade_id,
      },
    });
    const TeachersFromDepartment = await teacher.findAll({
      where: {
        dept_id: dept_id,
      },
    });
    res.status(200).json({
      status: "success",
      data: TeachersFromDepartment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Add Course ✅
exports.addCourse = async (req, res) => {
  const { subject_name, section_id, teacher_id } = req.body;
  try {
    const newCourse = course.create({
      subject_name: subject_name,
      section_id: section_id,
      teacher_id: teacher_id,
    });

    res.status(201).json({
      status: "success",
      data: {
        subject_name: subject_name,
        section_id: section_id,
        teacher_id: teacher_id,
      },
      message: `${subject_name} added succssesfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Event ✅
exports.addEvent = async (req, res) => {
  try {
    //Getting all the Data required for SQL insert(Event)
    const { description, title, location, date } = req.body;
    const event_date = new Date(date).toISOString().split("T")[0];

    // Map the media into Array named file paths to send it for noSQL
    const fileDetails = req.files.map((file) => {
      const filePath = path.join("./Data/Events", file.filename);
      const fileType = file.mimetype;
      return { path: filePath, type: fileType };
    });

    //SQL Insertion
    const newEvent = await event.create({
      eventdate: event_date,

      location: location,
    });
    //Getting event ID to insert it into NOSQL record
    const event_id = newEvent.eventid;

    const noSqlEvent = await new eventMedia({
      event_id: event_id,
      title: title,
      description: description,
      media: fileDetails,
    }).save();
    res.status(201).json({
      status: "success",
      message: "Event with Media Added Succesfully",
      announcment: `${req.body.id}`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Event ✅
exports.deleteEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const sqlEvent = await event.findByPk(event_id);
    const noSqlEvent = await eventMedia.find({ event_id: event_id });
    if (!sqlEvent || !noSqlEvent) {
      res.status(400).json({
        status: "failed",
        error: "Event not found",
      });
    } else {
      // Get the media array from the  NoSQL event record
      const media = noSqlEvent[0]["media"];
      // Delete files from filesystem
      for (const mediaIndex of media) {
        fs.unlink(mediaIndex.path, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted:", mediaIndex.path);
          }
        });
      }
      // Delete the NoSQL eventMedia record(s) based on event_id
      await eventMedia.deleteMany({ event_id: event_id });
      // Delete the SQL event
      await sqlEvent.destroy();

      res.status(200).json({
        status: "success",
        message: "Event deleted successfully",
      });
    }

    // });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all students ✅
exports.getAllStudents = async (req, res) => {
  try {
    const allStudents = await student.findAll({
      attributes: [
        "student_id",
        "first_name",
        "last_name",
        "section_id",
        "parent_id",
      ],
      include: [
        {
          model: section,
          as: "section",
          attributes: ["section_id", "section_name"],
          include: [
            {
              model: grade,
              as: "grade",
              attributes: ["grade_name"],
              include: [
                {
                  model: department,
                  as: "dept",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    // Format the response Array
    const formattedStudents = allStudents.map((student) => {
      const section = student.section;
      const grade = section.grade;
      const dept = grade.dept;

      return {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        section_name: section.section_name,
        section_id: section.section_id,
        grade_name: grade.grade_name,
        dept_name: dept.name,
        parent_id: student.parent_id,
      };
    });

    res.status(200).json({
      status: "success",
      data: formattedStudents,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all parents ✅
exports.getAllParents = async (req, res) => {
  try {
    const allParents = await parent.findAll({
      attributes: ["parent_id", "first_name", "last_name", "phone"],
    });
    res.status(200).json({
      status: "success",
      data: allParents,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Teachers ✅
exports.getAllTeachers = async (req, res) => {
  try {
    const allTeachers = await teacher.findAll({
      attributes: [
        "teacher_id",
        "first_name",
        "last_name",
        "email",
        "dept_id",
        "section_id",
      ],
      include: [
        {
          model: section,
          as: "section", // Use the alias specified in the association
          attributes: ["section_id", "section_name"],
          include: [
            {
              model: grade,
              as: "grade", // Use the alias specified in the association
              attributes: ["grade_name"],
              include: [
                {
                  model: department,
                  as: "dept", // Use the alias specified in the association
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        {
          model: department,
          as: "dept", // Use the alias specified in the association
          attributes: ["name"],
        },
      ],
    });

    // Format the response Array
    const formattedTeachers = allTeachers.map((teacher) => {
      return {
        teacher_id: teacher.teacher_id,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email,
        section_name: teacher.section
          ? teacher.section.section_name
          : "Not Assigned",
        grade_name: teacher.section
          ? teacher.section.grade.grade_name
          : "Not Assigned",
        dept_name: teacher.section
          ? teacher.section.grade.dept.name
          : "Not Assigned",
      };
    });

    res.status(200).json({
      status: "success",
      data: formattedTeachers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Admins ✅
exports.getAllAdmins = async (req, res) => {
  try {
    const allAdmins = await admin.findAll({
      attributes: ["gm_id", "first_name", "last_name", "email"],
    });
    res.status(200).json({
      status: "success",
      data: allAdmins,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Student ✅
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params; // Changed from req.params.id to req.params
    const searchedStudent = await student.findOne({
      where: {
        student_id: id,
      },
    });
    if (!searchedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    await student.destroy({
      where: {
        student_id: id,
      },
    });
    res.status(204).json({
      status: "success",
      message: "Student Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Parent ✅
exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parentToDelete = await parent.findOne({ where: { parent_id: id } });
    if (!parentToDelete) {
      return res.status(404).json({ error: "Parent not found" });
    }
    await parentToDelete.destroy();
    res.status(204).json({
      status: "success",
      message: "Parent and their students deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Teacher ✅
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params; // Changed from req.params.id to req.params
    const searchedTeacher = await teacher.findOne({
      where: {
        teacher_id: id,
      },
    });
    if (!searchedTeacher) {
      return res.status(404).json({ error: "Student not found" });
    }
    // Find all courses associated with the teacher
    const courses = await course.findAll({
      where: {
        teacher_id: id,
      },
      attributes: ["course_id"], // Only fetch the course_id
    });
    // Extract the course_ids into an array
    const courseIds = courses.map((course) => course.course_id);
    for (tid of courseIds) {
      await course.update(
        {
          teacher_id: null,
        },
        {
          where: {
            course_id: tid,
          },
        }
      );
    }
    await teacher.destroy({
      where: {
        teacher_id: id,
      },
    });
    res.status(204).json({
      status: "success",
      message: "teacher Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Admin ✅
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params; // Changed from req.params.id to req.params
    const searchedAdmin = await admin.findOne({
      where: {
        gm_id: id,
      },
    });
    if (!searchedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    await announcment.destroy({
      where: { adminid: id },
    });
    await admin.destroy({
      where: {
        gm_id: id,
      },
    });
    res.status(204).json({
      status: "success",
      message: "Admin Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Change Password Based on userType ✅
exports.changePassword = async (req, res) => {
  try {
    // identifier may be email for teacher , and ID for students and parents
    const { userType, identifier, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 3);
    if (userType.toLowerCase() === "student") {
      await student.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            student_id: identifier,
          },
        }
      );
    } else if (userType.toLowerCase() === "parent") {
      await parent.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            parent_id: identifier,
          },
        }
      );
    } else if (userType.toLowerCase() === "teacher") {
      await teacher.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            teacher_id: identifier,
          },
        }
      );
    } else {
      res.status(400).json({ error: "Invalid User Type" });
    }
    res.status(200).json({
      status: "success",
      message: "Password Changed Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const hashedOldPassword = await bcrypt.hash(oldPassword, 3);

    const exisitingAdmin = await admin.findOne({
      where: {
        gm_id: req.user.id,
      },
    });
    if (await bcrypt.compare(oldPassword, exisitingAdmin.dataValues.password)) {
      await admin.update(
        {
          password: await bcrypt.hash(newPassword, 3),
        },
        {
          where: {
            gm_id: req.user.id,
          },
        }
      );
      res.status(201).json({
        status: "success",
        message: "Password Changed Successfully",
      });
    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeAdminName = async (req, res) => {
  try {
    const { oldPassword, first_name, last_name } = req.body;
    const hashedOldPassword = await bcrypt.hash(oldPassword, 3);

    const exisitingAdmin = await admin.findOne({
      where: {
        gm_id: req.user.id,
      },
    });
    if (await bcrypt.compare(oldPassword, exisitingAdmin.dataValues.password)) {
      await admin.update(
        {
          first_name,
          last_name,
        },
        {
          where: {
            gm_id: req.user.id,
          },
        }
      );
      res.status(201).json({
        status: "success",
        message: "Password Changed Successfully",
      });
    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all the departments
exports.getAllDepartments = async (req, res) => {
  try {
    const allDepts = await department.findAll();
    res.status(200).json({
      status: "success",
      data: allDepts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGradesInDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;
    const allDepts = await grade.findAll({
      where: {
        dept_id,
      },
    });
    res.status(200).json({
      status: "success",
      data: allDepts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
