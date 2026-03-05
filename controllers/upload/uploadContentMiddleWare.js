const multer = require("multer");
const path = require("path");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Data/resources"); // 'Data/Events' is the folder where the file will be saved
  },
  filename: function (req, file, cb) {
    // Generate a unique name using a timestamp + file extension
    const fileExtension = path.extname(file.originalname); // Extracts the file extension
    const uniqueName =
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 15) +
      fileExtension; // Create a unique file name with the extension and random strings

    cb(null, uniqueName); // Save the file with the generated name
  },
});

// Initialize multer with the correct storage configuration
const upload = multer({ storage: storage });

// Middleware for handling file upload (single file, named 'courseContentUpload')
const courseContentUpload = upload.single("media");

module.exports = courseContentUpload;
