const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const teacherController = require("../controllers/teacherController");
const courseController = require("../controllers/courseController");
const absenceController = require("../controllers/absenceController");
const assigmentController = require("../controllers/assigmentsController");
const reportController = require("../controllers/reportController");
const quizController = require("../controllers/quizController");
const marksController = require("../controllers/marksController");
const annoucmentController = require("../controllers/announcmentController");
const uploadContent = require("../controllers/upload/uploadContentMiddleWare");
const uploadAssigment = require("../controllers/upload/uploadAssigment-Description");
const checkFile = require("../Middlewares/checkFileMiddleware");
const downloadController = require("../controllers/download/downloadController");

// login
router.post("/teacherLogin", authController.TeacherLogin);

//Marks functionalites

// course Functionalites
router.get("/courses", teacherController.getCourseByTeacherID);
router.get("/course/:course_id", teacherController.getCourseByCourseID);
// get all students in course
router.get("/course/:course_id/students", courseController.getStudentsInCourse);
//get course units
router.get("/course/:course_id/units", courseController.getCourseUnits);
// add new unit
router.post("/course/:course_id/addunit", courseController.addUnit);
//get unit content
router.get("/course/media/:unit_id", courseController.getUnitContent);
// add unit content
router.post(
  "/course/:unit_id",
  uploadContent,
  checkFile,
  courseController.addUnitContent
);
// delete unit
router.delete("/course/:course_id/:unit_id", courseController.deleteUnit);
// delete content
router.delete("/course/media/:unit_id/:media_id", courseController.deleteMedia);

// Assigments functionalites
//Done
router.post(
  "/course/:course_id/addassigment",
  uploadAssigment,
  checkFile,
  assigmentController.addAssigment
);
//Done
router.get(
  "/course/:course_id/assigments",
  assigmentController.getAllAssigmentsForCourse
);
// delete assignment
router.delete(
  "/course/:course_id/assigments/delete-assignment/:assignment_id",
  assigmentController.deleteAssigment
);
//done except ( real student )
router.get(
  "/course/:course_id/assigments/:assignment_id",
  assigmentController.showAssigmentSubmission
);
router.patch(
  "/course/:course_id/assigments/update/:assignment_id",
  assigmentController.updateSubmissionStatus
);

// quizes
router.get("/course/:course_id/allQuizes", quizController.getAllQuizes);
router.get("/course/quiz/:quiz_id", quizController.getQuiz);
router.post("/course/:course_id/quiz", quizController.addQuiz);
router.delete("/course/delete/quiz/:quiz_id", quizController.deleteQuiz);
router.patch("/course/quiz/:quiz_id", quizController.editQuiz);
router.patch("/course/quiz/:quiz_id/view", quizController.publicQuizMarks);
router.get(
  "/course/:course_id/:quiz_id/submissions",
  quizController.showQuizSubmissions
);
router.get(
  "/course/:course_id/:quiz_id/:student_id/submit",
  quizController.showQuizMark
);
// Absence functionality
router.get("/students/:section_id", courseController.getStudentInSection);
router.get("/absence/:date", absenceController.getAbsence);
router.post("/absence", absenceController.updateAbsence);

// report functionality
router.post(
  "/course/:course_id/addnewreport",

  reportController.addReport
);

// download assignments
router.get("/download/assignments", downloadController.downloadAssignments);

// download submissions
router.get("/download/submissions", downloadController.downloadSubmissions);

router.post(
  "/course/:course_id/mark",

  marksController.addMark
);
router.get(
  "/course/:course_id/mark/:student_id/:mark_type",

  marksController.getMark
);

// Annoucments
router.get("/annoucments/:department_id", annoucmentController.getAnnoucments);
router.get("/department", annoucmentController.getTeacherDepartment);

module.exports = router;
