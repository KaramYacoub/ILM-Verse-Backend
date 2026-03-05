const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const courseController = require("../controllers/courseController");
const absenceController = require("../controllers/absenceController");
const reportController = require("../controllers/reportController");
const annoucmentController = require("../controllers/announcmentController");
const marksController = require("../controllers/marksController");
const authController = require("../controllers/authController");
const uploadFiles = require("../controllers/upload/uploadEvent"); // Import the upload middleware for events
const uploadContent = require("../controllers/upload/uploadContentMiddleWare"); //Import the upload middleware for courses
const checkFile = require("../Middlewares/checkFileMiddleware");
const checkFiles = require("../Middlewares/checkFilesMiddleware");

//---------------------------------
// to get the admin data we should send the Admin ID from front-end as param
// router.get("/:id",   adminController.getAdmin);
//---------------------------------
// The 5 Addition Functionality Routes
router.post("/addition/admin", adminController.addAdmin);
router.post("/addition/teacher", adminController.addTeacher);
router.post("/addition/parent", adminController.addParent);
router.post("/addition/student", adminController.addStudent);

// get grades then sections then teachers in the department of the section , then add course
router.get(
  "/addition/course/grades",

  adminController.getGrades
);
router.get(
  "/addition/course/grades/:grade_id",

  adminController.getSections
);
router.get(
  "/addition/course/grades/:grade_id/:section_id",

  adminController.getTeachersBySection
);
router.post("/addition/course", adminController.addCourse);

//Event 2 Post Conditions , first one for
router.post(
  "/events",

  uploadFiles,
  checkFiles,
  adminController.addEvent
);
router.delete(
  "/events/:event_id",

  adminController.deleteEvent
);

// Get all students,parents,teachers,admins

router.get("/getStudents", adminController.getAllStudents);
router.get("/getParents", adminController.getAllParents);
router.get("/getTeachers", adminController.getAllTeachers);
router.get("/getAdmins", adminController.getAllAdmins);
// The 4 Delete Functionalities Routes
router.delete(
  "/delete/student/:id",

  adminController.deleteStudent
);
router.delete(
  "/delete/parent/:id",

  adminController.deleteParent
);
router.delete(
  "/delete/teacher/:id",

  adminController.deleteTeacher
);
router.delete(
  "/delete/admin/:id",

  adminController.deleteAdmin
);
// update password functionality , (remember to check the body from postman)
router.patch(
  "/update/password",

  adminController.changePassword
);

//course functionalites: getAllCourses ,involve , changeteacher then details
//Involve all students in specific section inside A course by course Id
router.get("/course", courseController.getAllCourses);
router.post(
  "/course/involve",

  courseController.involveStudents
);
router.get(
  "/course/getteachersbycourse/:course_id",

  courseController.getTeachersByCourse
);
router.patch(
  "/course/changeteacher",

  courseController.updateTeacher
);
router.get(
  "/course/getstudents/:course_id",

  courseController.getStudentsInCourse
);
router.post("/course/addunit", courseController.addUnit);
router.get(
  "/course/:course_id",

  courseController.getCourseUnits
);
router.get(
  "/course/media/:unit_id",

  courseController.getUnitContent
);
router.post(
  "/course/:unit_id",

  uploadContent,
  checkFile,
  courseController.addUnitContent
);
router.get(
  "/course/:course_id/:unit_id/:media_id",

  courseController.getLecture
);
router.delete(
  "/course/:course_id/:unit_id",

  courseController.deleteUnit
);
router.delete(
  "/course/media/:unit_id/:media_id",

  courseController.deleteMedia
);
router.delete(
  "/course/:course_id",

  courseController.deleteCourse
);
//Marks functionalites
router.post(
  "/course/:course_id/mark",

  marksController.addMark
);
router.patch(
  "/course/:course_id/mark",

  marksController.editMark
);
router.get(
  "/course/:course_id/mark/:student_id/:mark_type",

  marksController.getMark
);
// admin settings (change password , change name)
router.patch(
  "/settings/password",

  adminController.changeAdminPassword
);
router.patch(
  "/settings/changename",

  adminController.changeAdminName
);

// Absence functionalites
router.get(
  "/absence/:section_id/:date",

  absenceController.getAbsence
);
router.post("/absence", absenceController.updateAbsence);

router.get(
  "/absence/check/:student_id/:section_id",
  absenceController.getStudentAbsences
);

router.get(
  "/students/:section_id",

  courseController.getStudentInSection
);

router.get("/depts", adminController.getAllDepartments);
router.get(
  "/:dept_id/grades",

  adminController.getGradesInDepartment
);

//Reports
router.post("/course/:student_id/addreport", reportController.addReport);

router.get("/reports/:student_id", reportController.getStudentReports);
router.delete("/reports/delete", reportController.deleteReport);
//Annoucments

router.post(
  "/annoucments/sendannoucment",
  annoucmentController.sendAnnouncment
);
router.get("/annoucments/:department_id", annoucmentController.getAnnoucments);
router.delete(
  "/annoucments/:annoucment_id",
  annoucmentController.deleteAnnoucment
);

module.exports = router;
