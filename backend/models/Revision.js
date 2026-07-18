const mongoose = require("mongoose");

const revisionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    revisionDate: {
      type: Date,
      required: [true, "Revision date is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    // --- Smart Revision Scheduler (spaced repetition) fields ---
    // These are optional so existing, manually-created revisions (which
    // predate this feature) keep working exactly as before.
    revisionNumber: {
      type: Number,
      default: null, // 1-4 for spaced-repetition revisions, null for manual ones
    },
    originalLearningDate: {
      type: Date,
      default: null,
    },
    // Groups the 4 revisions generated together for the same learned topic.
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Revision", revisionSchema);
