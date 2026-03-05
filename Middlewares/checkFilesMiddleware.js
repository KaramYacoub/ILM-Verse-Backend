const checkFilesMiddleware = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No files uploaded",
    });
  }
  next(); // Proceed to the next handler if files exist
};
module.exports = checkFilesMiddleware;
