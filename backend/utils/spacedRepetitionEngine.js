// Smart Revision Scheduler engine.
//
// Given the date a topic was learned/completed, generates the four
// spaced-repetition revision dates using the classic expanding-interval
// schedule:
//   Revision 1 -> 1 day after learning
//   Revision 2 -> 3 days after Revision 1
//   Revision 3 -> 7 days after Revision 2
//   Revision 4 -> 14 days after Revision 3
//
// Each gap is applied on top of the previous revision date (not the
// original learning date), which is what makes the intervals "expand"
// correctly across month/year boundaries - addDays() already handles that
// via the native Date UTC arithmetic in dateUtils.js.

const { startOfDayUTC, addDays } = require("./dateUtils");

const REVISION_INTERVALS_DAYS = [1, 3, 7, 14];

// Returns an array of 4 Date objects (UTC midnight) for the spaced
// revisions that follow `learningDate`.
const generateSpacedRevisionDates = (learningDate) => {
  let cursor = startOfDayUTC(learningDate);
  return REVISION_INTERVALS_DAYS.map((gapDays) => {
    cursor = addDays(cursor, gapDays);
    return cursor;
  });
};

module.exports = { generateSpacedRevisionDates, REVISION_INTERVALS_DAYS };
