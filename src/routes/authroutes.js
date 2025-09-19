const express = require("express");
const router = express.Router();

const { uploadSingleCV, googleDriveUpload,uploadFileMulter } = require("../midlleware/upload");  // fixed path
const { register, login, createGroup,getAllGroups,updateGroup,deleteGroup,
  getGroupDetailsByEmail,getAllUsers,updateUser,getAssignedGroups,uploadGroupFile,saveTeacherMarks,
sendGroupEmails} = require("../controllers/authcontroller");

const verifyToken = require("../midlleware/authmidllleware");

router.get('/teacher-assigned-groups', getAssignedGroups);

// Save teacher marks
router.post('/save-teacher-marks',  saveTeacherMarks);

router.post("/register", uploadSingleCV, register);


router.get("/getusers", verifyToken, getAllUsers);
router.put("/updateuser/:id", verifyToken, updateUser);
router.post("/login", login);
router.get("/group/:email", getGroupDetailsByEmail);
router.post("/creategroup",googleDriveUpload,createGroup);
router.post("/upload/:type/:email", uploadFileMulter,uploadGroupFile);
router.get("/getgroups",  getAllGroups);
// Update group by ID
router.put("/update/:id", updateGroup);
// Delete group by ID
router.delete("/delete/:id", deleteGroup);
router.post("/send-group-emails/:groupId", sendGroupEmails);
module.exports = router;

