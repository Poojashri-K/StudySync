const express = require("express");
const router = express.Router();
const {
  getSuggestions,
  acceptSuggestion,
  dismissSuggestion,
} = require("../controllers/rescheduleController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/suggestions", getSuggestions);
router.post("/:id/accept", acceptSuggestion);
router.post("/:id/dismiss", dismissSuggestion);

module.exports = router;
