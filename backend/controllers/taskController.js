const Task = require("../models/Task");
const User = require("../models/User");

// Helper: are two dates on the same calendar day?
const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// Helper: is date `a` exactly one calendar day before date `b`?
const isYesterday = (a, b) => {
  const oneDayLater = new Date(a);
  oneDayLater.setDate(oneDayLater.getDate() + 1);
  return isSameDay(oneDayLater, b);
};

// Updates the logged-in user's study streak when they complete a task
const updateStreakOnCompletion = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();

  if (!user.lastStudyDate) {
    user.currentStreak = 1;
  } else if (isSameDay(user.lastStudyDate, today)) {
    // Already logged a completed task today - streak unchanged
  } else if (isYesterday(user.lastStudyDate, today)) {
    user.currentStreak += 1;
  } else {
    user.currentStreak = 1;
  }

  user.lastStudyDate = today;
  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  await user.save();
};

// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user (optional ?status= filter)
const getTasks = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status && ["Pending", "Completed"].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const tasks = await Task.find(filter).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
const createTask = async (req, res, next) => {
  try {
    const { subject, title, date, priority, deadline } = req.body;

    if (!subject || !title || !date) {
      return res.status(400).json({ message: "Subject, title and date are required" });
    }

    const task = await Task.create({
      user: req.user._id,
      subject,
      title,
      date,
      priority: priority || "Medium",
      deadline: deadline || null,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task (details or status)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { subject, title, date, priority, status, deadline } = req.body;

    if (subject !== undefined) task.subject = subject;
    if (title !== undefined) task.title = title;
    if (date !== undefined) {
      // A manual date change means any previous rescheduling suggestion is
      // stale, so let a new one be generated (and un-dismiss) if the task
      // becomes overdue again in the future.
      task.date = date;
      task.rescheduleDismissed = false;
    }
    if (deadline !== undefined) task.deadline = deadline || null;
    if (priority !== undefined) task.priority = priority;

    if (status !== undefined && status !== task.status) {
      task.status = status;
      if (status === "Completed") {
        task.completedAt = new Date();
        await updateStreakOnCompletion(req.user._id);
      } else {
        task.completedAt = null;
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
