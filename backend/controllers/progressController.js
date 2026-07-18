const Task = require("../models/Task");
const Revision = require("../models/Revision");
const User = require("../models/User");
const { startOfDayUTC } = require("../utils/dateUtils");

// @route   GET /api/progress
// @desc    Get aggregated progress statistics for the logged-in user
const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: "Completed" });
    const pendingTasks = totalTasks - completedTasks;

    const totalRevisions = await Revision.countDocuments({ user: userId });
    const completedRevisions = await Revision.countDocuments({ user: userId, status: "Completed" });

    const user = await User.findById(userId);

    const completionPercentage =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Overdue tasks: pending tasks whose scheduled calendar day has fully
    // passed. Comparing against start-of-today (rather than the exact
    // current timestamp) ensures a task scheduled for today is never
    // incorrectly flagged as overdue while today is still in progress.
    const overdueTasks = await Task.find({
      user: userId,
      status: "Pending",
      date: { $lt: startOfDayUTC(new Date()) },
    }).sort({ date: 1 });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      totalRevisions,
      completedRevisions,
      completionPercentage,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      pomodoroSessionsCompleted: user.pomodoroSessionsCompleted,
      overdueTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/progress/pomodoro
// @desc    Increment the user's completed Pomodoro session count
const logPomodoroSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.pomodoroSessionsCompleted += 1;
    await user.save();
    res.json({ pomodoroSessionsCompleted: user.pomodoroSessionsCompleted });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, logPomodoroSession };
