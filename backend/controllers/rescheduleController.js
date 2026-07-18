const Task = require("../models/Task");
const { getOverdueTasksWithSuggestions } = require("../utils/reschedulingEngine");

// @route   GET /api/reschedule/suggestions
// @desc    Get smart rescheduling suggestions for the logged-in user's
//          missed (overdue, pending, not-dismissed) tasks
const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await getOverdueTasksWithSuggestions(req.user._id);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/reschedule/:id/accept
// @desc    Accept a rescheduling suggestion for a task. If a `date` is
//          provided in the body, the user is manually choosing their own
//          date instead of the recommended one; otherwise the currently
//          recommended date is used.
const acceptSuggestion = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    let newDate = req.body?.date;

    if (!newDate) {
      const suggestions = await getOverdueTasksWithSuggestions(req.user._id);
      const match = suggestions.find((s) => String(s.taskId) === String(task._id));
      if (!match) {
        return res.status(400).json({ message: "No active rescheduling suggestion for this task" });
      }
      newDate = match.suggestedDate;
    }

    task.date = newDate;
    task.rescheduleDismissed = false;
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/reschedule/:id/dismiss
// @desc    Dismiss a rescheduling suggestion without changing the task's
//          date. It will reappear if the task's date is later edited and
//          it becomes overdue again.
const dismissSuggestion = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.rescheduleDismissed = true;
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuggestions, acceptSuggestion, dismissSuggestion };
