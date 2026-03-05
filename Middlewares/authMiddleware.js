const jwt = require("jsonwebtoken");
const SQL = require("../models/Connections/SQL-Driver");
const initModels = require("../models/index");
const models = initModels(SQL);
const { student, parent, admin, teacher } = models;

// Middleware to verify JWT and attach user info to the request
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthenticated.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user = null;

    // Determine user type and fetch user from DB
    if (role === "student") {
      user = await student.findByPk(id);
    } else if (role === "parent") {
      user = await parent.findByPk(id);
    } else if (role === "admin") {
      user = await admin.findByPk(id);
    } else if (role === "teacher") {
      user = await teacher.findByPk(id);
    }

    // If no user found
    if (!user) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthorized access. User not found.",
      });
    }

    // Attach user to request
    req.user = user;
    req.user.id = id;
    req.role = role;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateUser;
