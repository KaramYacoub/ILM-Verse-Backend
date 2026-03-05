const express = require("express");

exports.checkAdmin = (req, res, next) => {
  if (req.role === "admin") {
    next();
  } else {
    return res.status(401).json({
      status: "failure",
      message: "you are not authorized as an admin",
    });
  }
};
exports.checkTeacher = (req, res, next) => {
  if (req.role === "teacher") {
    next();
  } else {
    return res.status(401).json({
      status: "failure",
      message: "you are not authorized as an teacher",
    });
  }
};
exports.checkParent = (req, res, next) => {
  if (req.role === "parent") {
    next();
  } else {
    return res.status(401).json({
      status: "failure",
      message: "you are not authorized as an parent",
    });
  }
};
exports.checkStudent = (req, res, next) => {
  if (req.role === "student") {
    next();
  } else {
    return res.status(401).json({
      status: "failure",
      message: "you are not authorized as an student",
    });
  }
};
