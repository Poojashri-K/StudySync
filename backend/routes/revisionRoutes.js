const express = require("express");
const router = express.Router();
const {
  getRevisions,
  createRevision,
  updateRevision,
  deleteRevision,
  createSmartPlan,
  getRevisionSummary,
} = require("../controllers/revisionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/summary", getRevisionSummary);
router.post("/smart-plan", createSmartPlan);
router.route("/").get(getRevisions).post(createRevision);
router.route("/:id").put(updateRevision).delete(deleteRevision);

module.exports = router;
