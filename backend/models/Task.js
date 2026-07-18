const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    // Optional hard deadline for the task. Used by Smart Adaptive
    // Rescheduling to figure out how much room there is to move a missed
    // task. If not set, the rescheduling engine falls back to a default
    // grace window after `date`.
    deadline: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // When true, this task's missed-task rescheduling suggestion has been
    // dismissed by the user and should not be surfaced again until the
    // task's date changes.
    rescheduleDismissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
