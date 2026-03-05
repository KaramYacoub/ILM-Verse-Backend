const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { student, parent, admin, teacher } = models; // extract the models
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// login for the admin
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if the user enter the email and the password
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    // check if the email format is correct
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid email format",
      });
    }

    // Try to find an admin
    const admintUser = await admin.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    // check if admin exist
    if (admintUser) {
      // compare the enterd password with the one in the db
      const validPassword = await bcrypt.compare(password, admintUser.password);

      // if the password is wrong
      if (!validPassword) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid credentials",
        });
      }

      // sign jwt
      const token = jwt.sign(
        { id: admintUser.gm_id, role: "admin" },
        process.env.JWT_SECRET,
      );
      // generate cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 2, // 120 minutes
      });

      // send the student info
      res.status(200).json({
        status: "success",
        data: admintUser,
        message: "Logged in successfully",
      });
    } else {
      // If no user was found
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
};

// login for the teacher
exports.TeacherLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if the user enter the email and the password
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    // check if the email format is correct
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid email format",
      });
    }

    // Try to find an admin
    const teacherUser = await teacher.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    // check if admin exist
    if (teacherUser) {
      // compare the enterd password with the one in the db
      const validPassword = await bcrypt.compare(
        password,
        teacherUser.password,
      );

      // if the password is wrong
      if (!validPassword) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid credentials",
        });
      }

      // sign jwt
      const token = jwt.sign(
        { id: teacherUser.teacher_id, role: "teacher" },
        process.env.JWT_SECRET,
      );
      // generate cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 2, // 120 minutes
      });

      // send the parent info
      res.status(200).json({
        status: "success",
        data: teacherUser,
        message: "Logged in successfully",
      });
    } else {
      // If no user was found
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
};

// login for the student
exports.studentLogin = async (req, res) => {
  const { student_id, password } = req.body;

  try {
    // Make sure password is provided
    if (!student_id || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid credentials",
      });
    }

    // Try to find user in students or parents
    const studentUser = await student.findOne({
      where: { student_id: student_id.trim() },
    });

    // check if either the student or the parent exist
    if (studentUser) {
      // compare the enterd password with the one in the db
      const validPassword = await bcrypt.compare(
        password,
        studentUser.password,
      );

      // if the password is wrong
      if (!validPassword) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid credentials",
        });
      }

      // sign jwt
      const token = jwt.sign(
        { id: studentUser.student_id, role: "student" },
        process.env.JWT_SECRET,
      );
      // generate cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 2, // 120 minutes
      });

      // send the student info
      res.status(200).json({
        status: "success",
        data: studentUser,
        message: "Logged in successfully",
      });
    } else {
      // If no user was found
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
};

// login for the parent
exports.parentLogin = async (req, res) => {
  const { parent_id, password } = req.body;
  try {
    // Make sure password is provided
    if (!parent_id || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid credentials",
      });
    }

    // Try to find  parents
    const parentUser = await parent.findOne({
      where: { parent_id: parent_id.trim() },
    });
    if (parentUser) {
      // compare the enterd password with the one in the db
      const validPassword = await bcrypt.compare(password, parentUser.password);

      // if the password is wrong
      if (!validPassword) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid credentials",
        });
      }

      // sign jwt
      const token = jwt.sign(
        { id: parentUser.parent_id, role: "parent" },
        process.env.JWT_SECRET,
      );
      // generate cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 2, // 120 minutes
      });

      // send the parent info
      res.status(200).json({
        status: "success",
        data: parentUser,
        message: "Logged in successfully",
      });
    } else {
      // If no user was found
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
};

// check login
exports.checkLogin = (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        status: "failed",
        message: "Unuthenticated",
      });
    }

    return res.status(200).json({
      status: "success",
      data: req.user,
      role: req.role,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      error: error.message,
    });
  }
};

// User logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  try {
    return res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    res.send(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
