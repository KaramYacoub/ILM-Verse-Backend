const express = require("express");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { Sequelize } = require("sequelize");
const {
  admin,
  student,
  section,
  grade,
  department,
  teacher,
  parent,
  announcment,
} = models;
exports.sendAnnouncment = async (req, res) => {
  try {
    const { department_id, content } = req.body;
    const admin_id = req.user.id;
    let newAnnouncment;
    if (department_id.toLowerCase() === "general") {
      newAnnouncment = await announcment.create({
        content: content,
        adminid: admin_id,
      });
    } else {
      newAnnouncment = await announcment.create({
        content: content,
        adminid: admin_id,
        department_id: department_id,
      });
    }

    res.status(201).json({
      status: "success",
      message: "annoucment added successfully",
      newAnnouncment,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAnnoucments = async (req, res) => {
  try {
    const { department_id } = req.params;
    let annoucments;
    if (department_id.toLowerCase() === "general") {
      annoucments = await announcment.findAll({
        where: {
          department_id: null,
        },
        include: {
          model: admin,
          as: "admin",
          attributes: [
            [
              Sequelize.fn(
                "concat",
                Sequelize.col("admin.first_name"),
                " ",
                Sequelize.col("admin.last_name")
              ),
              "full_name",
            ],
          ],
        },
      });
    } else {
      annoucments = await announcment.findAll({
        where: {
          department_id: department_id,
        },
        include: {
          model: admin,
          as: "admin",
          attributes: [
            [
              Sequelize.fn(
                "concat",
                Sequelize.col("admin.first_name"),
                " ",
                Sequelize.col("admin.last_name")
              ),
              "full_name",
            ],
          ],
        },
      });
    }
    res.status(200).json({
      status: "success",
      data: annoucments,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getStudentDepartment = async (req, res) => {
  try {
    // this function just used for student
    const studentDepartment = await student.findOne({
      where: {
        student_id: req.user.id,
      },
      attributes: [],
      include: {
        model: section,
        as: "section",
        attributes: ["section_id"],
        include: {
          model: grade,
          as: "grade",
          attributes: ["grade_id"],
          include: {
            model: department,
            as: "dept",
            attributes: ["department_id", "name"],
          },
        },
      },
    });
    const department_data = {
      department_id: studentDepartment.section.grade.dept.department_id,
      name: studentDepartment.section.grade.dept.name,
    };
    res.status(200).json({
      status: "success",
      data: department_data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getParentDepartments = async (req, res) => {
  try {
    // this function just used for parent
    const parent_id = req.user.id;
    const parentStudents = await student.findAll({
      where: {
        parent_id: parent_id,
      },
      attributes: ["student_id"],
    });
    let parentDepartments = [];
    for (oneStudent of parentStudents) {
      const studentDepartment = await student.findOne({
        where: {
          student_id: oneStudent.student_id,
        },
        attributes: [],
        include: {
          model: section,
          as: "section",
          attributes: ["section_id"],
          include: {
            model: grade,
            as: "grade",
            attributes: ["grade_id"],
            include: {
              model: department,
              as: "dept",
              attributes: ["department_id", "name"],
            },
          },
        },
      });

      const oneDepartment = {
        department_id: studentDepartment.section.grade.dept.department_id,
        name: studentDepartment.section.grade.dept.name,
      };
      const exists = parentDepartments.some(
        (dept) => dept.name === oneDepartment.name
      );

      if (exists) {
        continue;
      } else {
        parentDepartments.push(oneDepartment);
      }
    }
    // const studentDepartment = await student.findOne({
    //   where: {
    //     student_id: req.user.id,
    //   },
    //   include: {
    //     model: section,
    //     as: "section",
    //     attributes: [],
    //     include: {
    //       model: grade,
    //       as: "grade",
    //       attributes: [],
    //       include: {
    //         model: department,
    //         as: "dept",
    //         attributes: ["department_id", "department_name"],
    //       },
    //     },
    //   },
    // });
    res.status(200).json({
      status: "sucess",
      data: parentDepartments,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getTeacherDepartment = async (req, res) => {
  try {
    // this function will just be used for teacher
    const teacher_id = req.user.id;
    const teacherData = await teacher.findOne({
      where: {
        teacher_id: teacher_id,
      },
      attributes: ["section_id"],
      include: {
        model: section,
        as: "section",
        attributes: ["grade_id"],
        include: {
          model: grade,
          as: "grade",
          attributes: ["grade_id"],
          include: {
            model: department,
            as: "dept",
            attributes: ["department_id", "name"],
          },
        },
      },
    });

    // If teacher doesn't have a section or section data is incomplete
    if (!teacherData || !teacherData.section || !teacherData.section.grade || !teacherData.section.grade.dept) {
      return res.status(200).json({
        status: "success",
        data: null,
        message: "Teacher is not assigned to any department"
      });
    }

    const teacherDepartment = {
      department_id: teacherData.section.grade.dept.department_id,
      name: teacherData.section.grade.dept.name,
    };

    res.status(200).json({
      status: "success",
      data: teacherDepartment
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
exports.deleteAnnoucment = async (req, res) => {
  try {
    const { annoucment_id } = req.params;
    const findAnnoucment = announcment.findOne({
      where: {
        announcmentid: annoucment_id,
      },
    });
    if (!findAnnoucment) {
      return res.status(400).json({
        status: "failure",
        message: "annoucment not found",
      });
    } else {
      await announcment.destroy({
        where: { announcmentid: annoucment_id },
      });
      return res.status(200).json({
        status: "sucess",
        message: "annoucment deleted succesfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
