var DataTypes = require("sequelize").DataTypes;
var _admin = require("./SQL/admin");
var _announcment = require("./SQL/announcment");
var _course = require("./SQL/course");
var _course_student = require("./SQL/course_student");
var _department = require("./SQL/department");
var _event = require("./SQL/event");
var _grade = require("./SQL/grade");
var _mark_type = require("./SQL/mark_type");
var _parent = require("./SQL/parent");
var _post = require("./SQL/post");
var _section = require("./SQL/section");
var _student = require("./SQL/student");
var _student_marks = require("./SQL/student_marks");
var _teacher = require("./SQL/teacher");
var _otp = require("./SQL/otp");

// ORM init function
function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes);
  var announcment = _announcment(sequelize, DataTypes);
  var course = _course(sequelize, DataTypes);
  var course_student = _course_student(sequelize, DataTypes);
  var department = _department(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var grade = _grade(sequelize, DataTypes);
  var mark_type = _mark_type(sequelize, DataTypes);
  var parent = _parent(sequelize, DataTypes);
  var post = _post(sequelize, DataTypes);
  var section = _section(sequelize, DataTypes);
  var student = _student(sequelize, DataTypes);
  var student_marks = _student_marks(sequelize, DataTypes);
  var teacher = _teacher(sequelize, DataTypes);
  var otp = _otp(sequelize, DataTypes);

  // Many-to-Many Course <-> Student via course_student with cascade delete
  course.belongsToMany(student, {
    as: "student_id_students",
    through: course_student,
    foreignKey: "course_id",
    otherKey: "student_id",
    onDelete: "CASCADE",
  });
  student.belongsToMany(course, {
    as: "course_id_courses",
    through: course_student,
    foreignKey: "student_id",
    otherKey: "course_id",
    onDelete: "CASCADE",
  });

  // Announcment associations
  announcment.belongsTo(admin, {
    as: "admin",
    foreignKey: "adminid",
    onDelete: "CASCADE",
  });
  announcment.belongsTo(department, {
    as: "department",
    foreignKey: "department_id",
  });
  department.hasMany(announcment, {
    as: "announcment",
    foreignKey: "announcmentid",
  });
  admin.hasMany(announcment, { as: "announcments", foreignKey: "adminid" });

  // Course_Student belongsTo course and student with cascade delete
  course_student.belongsTo(course, {
    as: "course",
    foreignKey: "course_id",
    onDelete: "CASCADE",
  });
  course.hasMany(course_student, {
    as: "course_students",
    foreignKey: "course_id",
    onDelete: "CASCADE",
  });
  course_student.belongsTo(student, {
    as: "student",
    foreignKey: "student_id",
    onDelete: "CASCADE",
  });
  student.hasMany(course_student, {
    as: "course_students",
    foreignKey: "student_id",
    onDelete: "CASCADE",
  });

  // Student Marks belongsTo student and course directly (cascade delete)
  student_marks.belongsTo(student, {
    as: "student",
    foreignKey: "student_id",
    onDelete: "CASCADE",
  });
  student.hasMany(student_marks, {
    as: "student_marks",
    foreignKey: "student_id",
    onDelete: "CASCADE",
  });

  student_marks.belongsTo(course, {
    as: "course",
    foreignKey: "course_id",
    onDelete: "CASCADE",
  });
  course.hasMany(student_marks, {
    as: "student_marks",
    foreignKey: "course_id",
    onDelete: "CASCADE",
  });

  // Student Marks belongsTo mark_type
  student_marks.belongsTo(mark_type, {
    as: "type",
    foreignKey: "type_id",
    onDelete: "CASCADE",
  });
  mark_type.hasMany(student_marks, {
    as: "student_marks",
    foreignKey: "type_id",
    onDelete: "CASCADE",
  });

  // Department associations
  grade.belongsTo(department, { as: "dept", foreignKey: "dept_id" });
  department.hasMany(grade, { as: "grades", foreignKey: "dept_id" });
  teacher.belongsTo(department, { as: "dept", foreignKey: "dept_id" });
  department.hasMany(teacher, { as: "teachers", foreignKey: "dept_id" });

  // Section associations
  section.belongsTo(grade, { as: "grade", foreignKey: "grade_id" });
  grade.hasMany(section, { as: "sections", foreignKey: "grade_id" });
  course.belongsTo(section, {
    as: "section",
    foreignKey: "section_id",
    onDelete: "CASCADE",
  });
  section.hasMany(course, { as: "courses", foreignKey: "section_id" });
  student.belongsTo(section, { as: "section", foreignKey: "section_id" });
  section.hasMany(student, { as: "students", foreignKey: "section_id" });
  teacher.belongsTo(section, { as: "section", foreignKey: "section_id" });
  section.hasMany(teacher, { as: "teachers", foreignKey: "section_id" });

  // Parent - Student cascade delete
  student.belongsTo(parent, {
    as: "parent",
    foreignKey: "parent_id",
    onDelete: "CASCADE",
  });
  parent.hasMany(student, {
    as: "students",
    foreignKey: "parent_id",
    onDelete: "CASCADE",
  });

  // Teacher - Course cascade delete
  course.belongsTo(teacher, {
    as: "teacher",
    foreignKey: "teacher_id",
    onDelete: "CASCADE",
  });
  teacher.hasMany(course, {
    as: "courses",
    foreignKey: "teacher_id",
    onDelete: "CASCADE",
  });

  // Event associations (if needed)
  // otp associations (if needed)

  return {
    admin,
    announcment,
    course,
    course_student,
    department,
    event,
    grade,
    mark_type,
    parent,
    post,
    section,
    student,
    student_marks,
    teacher,
    otp,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
