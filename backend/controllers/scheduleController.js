const Schedule = require("../models/Schedule");

// @route   GET /api/schedules
// @desc    Get all study schedules for the logged-in user
const getSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ user: req.user._id }).sort({ date: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/schedules
// @desc    Create a new study schedule entry
const createSchedule = async (req, res, next) => {
  try {
    const { subject, topic, date, startTime, endTime } = req.body;

    if (!subject || !topic || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const schedule = await Schedule.create({
      user: req.user._id,
      subject,
      topic,
      date,
      startTime,
      endTime,
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/schedules/:id
// @desc    Update a schedule entry
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const { subject, topic, date, startTime, endTime } = req.body;

    if (subject !== undefined) schedule.subject = subject;
    if (topic !== undefined) schedule.topic = topic;
    if (date !== undefined) schedule.date = date;
    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;

    const updated = await schedule.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/schedules/:id
// @desc    Delete a schedule entry
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
