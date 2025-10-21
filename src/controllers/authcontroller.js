const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { User, Group } = require("../models/usermodel");
const uploadToDrive = require("../uploades/googledrive");

const register = async (req, res) => {
  try { 
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let fileUrl = null;
    if (file) {
      fileUrl = await uploadToDrive({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      fileUrl,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const login = async (req, res) => {
  try {
    const { email, roll, password } = req.body;

    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (roll) {
      user = await User.findOne({ roll });
    } else {
      return res.status(400).json({ message: "Please provide email or roll" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email, // Added email to payload (optional)
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email, // ✅ Included email here
      studentId: user.role === 'student' ? user._id : null,
      teacherId: user.role === 'faculty' ? user._id : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createGroup = async (req, res) => {
  try {
    const {
      program,
      title,
      category,
      supervisor,
      groupMembers,
    } = req.body;

    let parsedMembers;
    if (typeof groupMembers === "string") {
      parsedMembers = JSON.parse(groupMembers);
    } else {
      parsedMembers = groupMembers;
    }

    const proposalFile = req.files["proposalFile"]?.[0];
    const proposalUrl = await uploadToDrive(proposalFile);

    const membersWithFeeProof = [];

    for (let i = 0; i < parsedMembers.length; i++) {
      const feeFile = req.files[`groupMembers[${i}][feeProof]`]?.[0];
      const feeUrl = await uploadToDrive(feeFile);

      membersWithFeeProof.push({
        ...parsedMembers[i],
        feeProofPath: feeUrl,
      });
    }

    const newGroup = new Group({
      
      fypGroupName: title,
      program,
      fypTitle: title,
      fypCategory: category,
      supervisor,
      fypGroupMembers: membersWithFeeProof,
      proposalUrl,  // you might want to save this link as well
    });

    await newGroup.save();
    res.status(201).json({ message: "Group created", group: newGroup });

  } catch (err) {
    console.error("Group creation failed:", err);
    res.status(500).json({ error: "Group creation failed" });
  }
};









const uploadGroupFile = async (req, res) => {
  const { email, type } = req.params;

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  // Validate upload type
  const validTypes = ["thesis", "similarity", "code"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid upload type." });
  }

  try {
    // Upload file buffer to Google Drive
    const driveUrl = await uploadToDrive(req.file);

    // Prepare the update object depending on the type
    const updateField = {
      thesis: { thesisUrl: driveUrl },
      similarity: { similarityReportUrl: driveUrl },
      code: { projectCodeUrl: driveUrl },
    }[type];

    // Update the group document matching the user's email inside fypGroupMembers array
    const updatedGroup = await Group.findOneAndUpdate(
      { "fypGroupMembers.email": email },
      { $set: updateField },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Return success with Google Drive URL
    res.status(200).json({ message: "File uploaded and group updated.", url: driveUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed." });
  }
};


async function sendGroupEmails(req, res) {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyErr) {
      console.error("❌ SMTP verification failed:", verifyErr);
      return res.status(500).json({
        success: false,
        message: "SMTP connection failed",
        error: verifyErr.message,
      });
    }

    const subject = `Marks Updated for Your FYP Group: ${group.fypGroupName}`;

    const evaluations = [
      { key: "proposal", label: "Proposal" },
      { key: "month1", label: "Month 1" },
      { key: "month2", label: "Month 2" },
      { key: "month3", label: "Month 3" },
      { key: "month4", label: "Month 4" },
      { key: "month5", label: "Month 5" },
      { key: "month6", label: "Month 6" },
      { key: "firstInternalViva", label: "Internal Viva 1" },
      { key: "secondInternalViva", label: "Internal Viva 2" },
      { key: "progressReport", label: "Progress Report" },
      { key: "teamCollaboration", label: "Team Collaboration" },
      { key: "similarityReport", label: "Similarity Report" },
      { key: "thesis", label: "Thesis" },
      { key: "externalViva", label: "External Viva" },
    ];

    for (const member of group.fypGroupMembers) {
      const rows = evaluations
        .map(e => {
          const evalData = member[e.key] || {};
          const hasMarks = evalData.marks !== undefined && evalData.marks !== null;
          const hasFeedback = evalData.feedback && evalData.feedback.trim() !== "";

          if (!hasMarks && !hasFeedback) return null;

          return `
            <tr>
              <td>${e.label}</td>
              <td>${hasMarks ? evalData.marks : "-"}</td>
              <td>${hasFeedback ? evalData.feedback : "N/A"}</td>
            </tr>`;
        })
        .filter(Boolean)
        .join("");

      // Add external viva details
      const vivaDetails = group.externalVivaDetails || {};
      const vivaInfo = `
        <h3>🎓 External Viva Details</h3>
        <ul>
          <li><strong>Date:</strong> ${vivaDetails.vivaDate ? vivaDetails.vivaDate.toDateString() : "Pending"}</li>
          <li><strong>Status:</strong> ${vivaDetails.vivaStatus || "Pending"}</li>
          <li><strong>Feedback:</strong> ${vivaDetails.vivaFeedback || "N/A"}</li>
        </ul>
      `;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Marks & Feedback Notification</h2>
          <p>Dear ${member.name},</p>
          <p>The evaluation details for your FYP group <strong>${group.fypGroupName}</strong> have been updated.</p>

          ${
            rows
              ? `<h3>📊 Your Evaluation Details</h3>
                <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th>Evaluation</th>
                      <th>Marks</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>`
              : `<p>No evaluation records are currently available for you.</p>`
          }

          ${vivaInfo}

          <p style="margin-top: 20px;">If you have any questions, please reach out to your supervisor.</p>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"FYP Coordinator" <${process.env.EMAIL_USER}>`,
          to: member.email,
          subject,
          html: htmlContent,
        });
        console.log(`📧 Email sent to ${member.email}`);
      } catch (err) {
        console.error(`❌ Failed to send to ${member.email}:`, err.message);
      }
    }

    res.status(200).json({ success: true, message: "Emails sent to all group members" });

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send emails",
      error: error.message,
    });
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch all assigned groups
// Fetch all assigned groups with milestone marks
const getAssignedGroups = async (req, res) => {
  try {
    const allGroups = await Group.find()
      .populate(
        "fypGroupMembers",
        `
        name email roll phone feeProofPath 
        proposal month1 month2 month3 month4 
        firstInternalViva progressReport teamCollaboration 
        month5 month6 thesis secondInternalViva similarityReport 
        externalViva
        `
      )
      .lean();

    res.json({ allGroups });
  } catch (err) {
    console.error("Error fetching teacher groups:", err);
    res.status(500).json({ message: "Server error" });
  }
};




const saveTeacherMarks = async (req, res) => {
  try {
    const { semester, groupId, marks, vivaDate, vivaStatus, vivaFeedback } = req.body;

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 🔹 Save per-student milestone marks
    Object.keys(marks).forEach((memberId) => {
      const member = group.fypGroupMembers.id(memberId);
      if (member) {
        const studentMarks = marks[memberId];
        Object.keys(studentMarks).forEach((milestone) => {
          member[milestone] = {
            marks: studentMarks[milestone].marks,
            feedback: studentMarks[milestone].feedback,
          };
        });
      }
    });

    // 🔹 Save external viva details (group-level)
    if (semester === "external") {
      group.externalVivaDetails = {
        vivaDate,
        vivaStatus,
        vivaFeedback,
      };
    }

    await group.save();

    res.json({ message: "Marks and Viva details saved successfully" });
  } catch (err) {
    console.error("❌ Error saving marks:", err);
    res.status(500).json({ message: "Server error" });
  }
};




const getGroupDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const group = await Group.findOne({
      "fypGroupMembers.email": email,
    }).lean();

    if (!group) {
      return res.status(404).json({ message: "Group not found for this email" });
    }

    // Find the single member
    const member = group.fypGroupMembers.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Remove members array from response to avoid confusion
    delete group.fypGroupMembers;

    return res.status(200).json({ group, member });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Update group by ID
const updateGroup = async (req, res) => {
  console.log("🔧 Hit updateGroup route with ID:", req.params.id);
  console.log("Payload:", req.body);
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json(group);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
};


// Delete group by ID
const deleteGroup = async (req, res) => {
  try {
    const result = await Group.findByIdAndDelete(req.params.id);

    if (!result) return res.status(404).json({ error: "Group not found" });

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete group" });
  }
};





module.exports = {register,login,createGroup,uploadGroupFile,

  getGroupDetailsByEmail,getAllGroups,deleteGroup,updateGroup,
 sendGroupEmails,updateUser,getAllUsers,saveTeacherMarks,getAssignedGroups,updatePassword};
