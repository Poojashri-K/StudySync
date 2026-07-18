const express = require("express");
const router = express.Router();
const { getProgress, logPomodoroSession } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getProgress);
router.post("/pomodoro", logPomodoroSession);

module.exports = router;
