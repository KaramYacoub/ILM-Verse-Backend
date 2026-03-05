const checkFile = (req, res, next) => {
  console.log(req.file); // Check if the file is being uploaded correctly
  if (!req.file) {
    return res.status(400).json({
      status: "failure",
      message: "No file uploaded",
    });
  }
  next(); // Proceed to the submitAssigment handler
};

module.exports = checkFile;
