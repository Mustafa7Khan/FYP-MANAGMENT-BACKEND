const multer = require("multer");

// Use memory storage so file.buffer is available for uploadToDrive()
const storage = multer.memoryStorage();
const upload = multer({ storage });

// For user registration: single CV upload (input name="file")
const uploadSingleCV = upload.single("file");
const uploadFileMulter = upload.single("file");
// For group creation: multiple files including proposalFile and feeProofs for members
const googleDriveUpload = upload.fields([
  { name: "proposalFile", maxCount: 1 },
  { name: "groupMembers[0][feeProof]", maxCount: 1 },
  { name: "groupMembers[1][feeProof]", maxCount: 1 },
  { name: "groupMembers[2][feeProof]", maxCount: 1 },
  { name: "groupMembers[3][feeProof]", maxCount: 1 },
  { name: "thesisPdf", maxCount: 1 },
  { name: "similarityReportPdf", maxCount: 1 },
  { name: "projectCodePdf", maxCount: 1 },
]);


module.exports = {
  uploadSingleCV,
  googleDriveUpload,
  uploadFileMulter,
};
