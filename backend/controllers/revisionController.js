const mongoose = require("mongoose");
const Revision = require("../models/Revision");
const { generateSpacedRevisionDates } = require("../utils/spacedRepetitionEngine");
const { startOfDayUTC, isBeforeUTCDay, isSameUTCDay } = require("../utils/dateUtils");

// @route   GET /api/revisions
// @desc    Get all revision sessions for the logged-in user
const getRevisions = async (req, res, next) => {
  try {
    const revisions = await Revision.find({ user: req.user._id }).sort({ revisionDate: 1 });
    res.json(revisions);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/revisions
// @desc    Create a new revision session
const createRevision = async (req, res, next) => {
  try {
    const { subject, topic, revisionDate } = req.body;

    if (!subject || !topic || !revisionDate) {
      return res.status(400).json({ message: "Subject, topic and revision date are required" });
    }

    const revision = await Revision.create({
      user: req.user._id,
      subject,
      topic,
      revisionDate,
    });

    res.status(201).json(revision);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/revisions/:id
// @desc    Update a revision session (details or status)
const updateRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOne({ _id: req.params.id, user: req.user._id });

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    const { subject, topic, revisionDate, status } = req.body;

    if (subject !== undefined) revision.subject = subject;
    if (topic !== undefined) revision.topic = topic;
    if (revisionDate !== undefined) revision.revisionDate = revisionDate;
    if (status !== undefined) revision.status = status;

    const updated = await revision.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/revisions/:id
// @desc    Delete a revision session
const deleteRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    res.json({ message: "Revision deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/revisions/smart-plan
// @desc    Create a Smart Revision Plan: automatically generates 4
//          spaced-repetition revision sessions (1 / 3 / 7 / 14 day
//          expanding intervals) for a topic that was just learned/completed
const createSmartPlan = async (req, res, next) => {
  try {
    const { subject, topic, learningDate } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: "Subject and topic are required" });
    }

    const learnDate = startOfDayUTC(learningDate ? new Date(learningDate) : new Date());
    const revisionDates = generateSpacedRevisionDates(learnDate);
    const planId = new mongoose.Types.ObjectId();

    const docs = revisionDates.map((revisionDate, index) => ({
      user: req.user._id,
      subject,
      topic,
      revisionDate,
      status: "Pending",
      revisionNumber: index + 1,
      originalLearningDate: learnDate,
      planId,
    }));

    const created = await Revision.insertMany(docs);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/revisions/summary
// @desc    Get the logged-in user's revisions grouped into Upcoming,
//          Due Today, Overdue and Completed buckets
const getRevisionSummary = async (req, res, next) => {
  try {
    const today = startOfDayUTC(new Date());
    const revisions = await Revision.find({ user: req.user._id }).sort({ revisionDate: 1 });

    const summary = { dueToday: [], overdue: [], upcoming: [], completed: [] };

    revisions.forEach((r) => {
      if (r.status === "Completed") {
        summary.completed.push(r);
        return;
      }
      if (isBeforeUTCDay(r.revisionDate, today)) {
        summary.overdue.push(r);
      } else if (isSameUTCDay(r.revisionDate, today)) {
        summary.dueToday.push(r);
      } else {
        summary.upcoming.push(r);
      }
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevisions,
  createRevision,
  updateRevision,
  deleteRevision,
  createSmartPlan,
  getRevisionSummary,
};
