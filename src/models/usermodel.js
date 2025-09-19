const mongoose=require("mongoose"); 
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
    default: "student",  
    
  },

  fileUrl: {
    type: String,
    default: null, 
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const feedbackSchema = new mongoose.Schema({
  marks: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
});

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fathername: { type: String, required: true, trim: true },
  roll: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  feeProofPath: { type: String, required: true, trim: true },

  // ✅ Semester 7
  proposal: feedbackSchema,
  month1: feedbackSchema,
  month2: feedbackSchema,
  month3: feedbackSchema,
  month4: feedbackSchema,
  firstInternalViva: feedbackSchema,
  progressReport: feedbackSchema,
  teamCollaboration: feedbackSchema,

  // ✅ Semester 8
  similarityReport: feedbackSchema,
  thesis: feedbackSchema,
  secondInternalViva: feedbackSchema,
  month5: feedbackSchema, // previously semester 8 month1
  month6: feedbackSchema, // previously semester 8 month2

  // ✅ External Viva
  externalViva: feedbackSchema,
});

const groupSchema = new mongoose.Schema(
  {
    fypGroupName: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    fypTitle: { type: String, required: true, trim: true },
    fypCategory: { type: String, required: true, trim: true },
    supervisor: { type: String, required: true, trim: true },
    externalExaminer: { type: String, default: "pending", trim: true },

    fypGroupMembers: [memberSchema],

  externalVivaDetails: {
    vivaDate: { type: Date }, 
    vivaStatus: {
      type: String,
      enum: ["pass", "fail", "reschedule","pending"],
      default: "pending",
    },
    vivaFeedback: { type: String },
  },
    // URLs
    proposalUrl: { type: String, default: "" },
    thesisUrl: { type: String, default: "" },
    similarityReportUrl: { type: String, default: "" },
    projectCodeUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Group=mongoose.model("Group", groupSchema);

const User = mongoose.model("User", userSchema);

module.exports = { User, Group};