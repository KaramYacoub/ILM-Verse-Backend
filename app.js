const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
//--------------------------------------
const app = express();
// All roots Middle Wares => each request before entering the event loop will go through those middle wares
// to translate the req body into json array
app.use(express.json());
// to log the request  information (HTTP Type, Status , time taken)
app.use(morgan("dev"));
//--------------------------------------
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://ilm-versee.vercel.app"],
    credentials: true,
  }),
);
//--------------------------------------
// Static Files MiddleWare for the events media files
app.use(
  "/media/events",
  (req, res, next) => {
    next();
  },
  express.static(path.join(__dirname, "data/Events")),
);

app.use(
  "/resources",
  (req, res, next) => {
    next();
  },
  express.static(path.join(__dirname, "data/resources")),
);
// authentication middleware import: checks if the user authinticated or not
const authenticateUser = require("./Middlewares/authMiddleware");
//authurization middleware imports: check if the user authurized to do sth or not
const {
  checkAdmin,
  checkTeacher,
  checkParent,
  checkStudent,
} = require("./Middlewares/authrizationMiddleware");

//---------------------------------------
//Routers Imports (HTTP)
const adminRouter = require("./routers/adminRouter");
const teacherRouter = require("./routers/teacherRouter");
const studentRouter = require("./routers/studentRouter");
const parentRouter = require("./routers/parentRouter");
const sharedRouter = require("./routers/sharedRouter");

// routing (HTTP RESTFULL)
app.use("/admin", authenticateUser, checkAdmin, adminRouter);
app.use("/teacher", authenticateUser, checkTeacher, teacherRouter);
app.use("/student", authenticateUser, checkStudent, studentRouter);
app.use("/parent", authenticateUser, checkParent, parentRouter);
app.use("/shared", sharedRouter);

//--------------------------------------
// Prevents Data Folder from entry from any user:
app.use("/Data", (req, res, next) => {
  res.status(403).send("Access Forbidden");
  next();
});

module.exports = app;
