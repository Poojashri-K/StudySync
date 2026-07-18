// Smart Adaptive Rescheduling engine.
//
// Pure, rule-based JavaScript (no paid AI API) that looks at a user's
// overdue (missed) tasks and recommends a new date for each one, based on:
//   - the task's priority (High/Medium/Low)
//   - the task's deadline (or a sensible default window if none is set)
//   - how many days remain before that deadline
//   - the existing workload (number of tasks already sitting) on each
//     candidate day, so we don't pile too many tasks onto a single day
//
// This module is intentionally decoupled from Express (no req/res) so it can
// be reused from controllers and easily unit tested.

const Task = require("../models/Task");
const { startOfDayUTC, addDays, isBeforeUTCDay, daysBetween, toISODateString } = require("./dateUtils");

const PRIORITY_WEIGHT = { High: 0, Medium: 1, Low: 2 };

// If a task has no explicit deadline, give it this many days of breathing
// room past its originally scheduled date to find a new slot.
const DEFAULT_DEADLINE_WINDOW_DAYS = 7;

// Resolves the effective deadline for a task: its own deadline if set,
// otherwise its scheduled date plus a default grace window.
const getEffectiveDeadline = (task) => {
  if (task.deadline) return startOfDayUTC(task.deadline);
  return addDays(startOfDayUTC(task.date), DEFAULT_DEADLINE_WINDOW_DAYS);
};

// Builds a { "YYYY-MM-DD": count } map of how many pending, non-overdue
// tasks are already sitting on each upcoming day. This is the "existing
// workload" the algorithm tries to balance around.
const buildWorkloadMap = (pendingTasks, today) => {
  const workload = {};
  pendingTasks.forEach((t) => {
    if (!isBeforeUTCDay(t.date, today)) {
      const key = toISODateString(t.date);
      workload[key] = (workload[key] || 0) + 1;
    }
  });
  return workload;
};

// Picks the best candidate day for a single task out of its available
// window, given the current workload map. Mutates `workload` to account for
// the pick, so subsequent tasks in the same batch see an updated picture.
const chooseDateForTask = (task, today, workload) => {
  const deadline = getEffectiveDeadline(task);

  // A task can be rescheduled as early as today (the day the suggestion is
  // being shown), since the student may still act on it right away. If the
  // deadline has already passed too, today is also the only day left.
  const windowStart = today;

  const windowLengthDays = Math.max(0, daysBetween(windowStart, deadline));
  const candidates = [];
  for (let i = 0; i <= windowLengthDays; i++) {
    const date = addDays(windowStart, i);
    const key = toISODateString(date);
    candidates.push({ date, key, load: workload[key] || 0 });
  }

  // Safety net: if the window is somehow empty, fall back to windowStart.
  if (candidates.length === 0) {
    candidates.push({ date: windowStart, key: toISODateString(windowStart), load: workload[toISODateString(windowStart)] || 0 });
  }

  if (task.priority === "Low") {
    // Prefer lightly-loaded days, but among equally light days push the
    // task as late as the deadline allows.
    candidates.sort((a, b) => a.load - b.load || b.date - a.date);
  } else {
    // High and Medium priority: prefer lightly-loaded days, and among
    // equally light days pick the earliest one available.
    candidates.sort((a, b) => a.load - b.load || a.date - b.date);
  }

  const chosen = candidates[0];
  workload[chosen.key] = (workload[chosen.key] || 0) + 1;

  return { chosenDate: chosen.date, deadline };
};

// Main entry point: returns rescheduling suggestions for every overdue,
// non-dismissed task belonging to `userId`.
const getOverdueTasksWithSuggestions = async (userId) => {
  const today = startOfDayUTC(new Date());

  const allPending = await Task.find({ user: userId, status: "Pending" }).sort({ date: 1 });

  const overdue = allPending.filter((t) => isBeforeUTCDay(t.date, today) && !t.rescheduleDismissed);
  if (overdue.length === 0) return [];

  const workload = buildWorkloadMap(allPending, today);

  // Process High priority first, then Medium, then Low, so high-priority
  // tasks get first pick of the lightest/earliest slots.
  const ordered = [...overdue].sort((a, b) => {
    const pa = PRIORITY_WEIGHT[a.priority] ?? 1;
    const pb = PRIORITY_WEIGHT[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    return getEffectiveDeadline(a) - getEffectiveDeadline(b);
  });

  return ordered.map((task) => {
    const { chosenDate, deadline } = chooseDateForTask(task, today, workload);
    const deadlineMissed = isBeforeUTCDay(deadline, today);
    const suggestedDateStr = toISODateString(chosenDate);

    return {
      taskId: task._id,
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      scheduledDate: task.date,
      deadline: task.deadline || null,
      effectiveDeadline: deadline,
      suggestedDate: chosenDate,
      deadlineMissed,
      message: deadlineMissed
        ? `"${task.title}" was not completed and its deadline has already passed. We recommend rescheduling it to ${suggestedDateStr} as soon as possible.`
        : `"${task.title}" was not completed. Based on your deadline and current schedule, we recommend rescheduling it to ${suggestedDateStr}.`,
    };
  });
};

module.exports = { getOverdueTasksWithSuggestions, getEffectiveDeadline, DEFAULT_DEADLINE_WINDOW_DAYS };
