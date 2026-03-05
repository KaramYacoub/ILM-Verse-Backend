const path = require("path");
const fs = require("fs");

exports.downloadResource = (req, res) => {
  const { path: filePath, filename } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "No file path provided" });
  }

  const baseDir = path.join(__dirname, "..", "..", "Data", "resources");
  const fullPath = path.resolve(baseDir, filePath);

  // Security checks
  if (!fullPath.startsWith(path.resolve(baseDir))) {
    return res.status(400).json({ error: "Invalid file path" });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Set the download filename from DB if provided, otherwise use the stored filename
  const downloadName = filename || filePath;

  res.download(fullPath, downloadName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
};


exports.downloadAssignments = (req, res) => {
  const { path: filePath, filename } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "No file path provided" });
  }

  const baseDir = path.join(__dirname, "..", "..", "Data", "Assigments", "Assigments-Description");
  const fullPath = path.resolve(baseDir, filePath);

  console.log("baseDir: ", baseDir);
  console.log("fullPath: ", fullPath);

  // Security checks
  if (!fullPath.startsWith(path.resolve(baseDir))) {
    return res.status(400).json({ error: "Invalid file path" });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Set the download filename from DB if provided, otherwise use the stored filename
  const downloadName = filename || filePath;

  res.download(fullPath, downloadName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
};

exports.downloadSubmissions = (req, res) => {
  const { path: filePath, filename } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "No file path provided" });
  }

  const baseDir = path.join(__dirname, "..", "..", "Data", "Assigments", "Submissions");
  const fullPath = path.resolve(baseDir, filePath);

  console.log("baseDir: ", baseDir);
  console.log("fullPath: ", fullPath);

  // Security checks
  if (!fullPath.startsWith(path.resolve(baseDir))) {
    return res.status(400).json({ error: "Invalid file path" });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Set the download filename from DB if provided, otherwise use the stored filename
  const downloadName = filename || filePath;

  res.download(fullPath, downloadName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
};