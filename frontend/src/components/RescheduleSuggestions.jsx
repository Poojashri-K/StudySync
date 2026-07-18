import { useState } from "react";
import { EmptyState } from "./Feedback.jsx";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const priorityColors = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

const SuggestionRow = ({ suggestion, onAccept, onDismiss, busy }) => {
  const [pickingDate, setPickingDate] = useState(false);
  const [customDate, setCustomDate] = useState("");

  return (
    <div className="suggestion-card">
      <div className="suggestion-top">
        <span className={`priority-badge ${priorityColors[suggestion.priority]}`}>
          {suggestion.priority}
        </span>
        {suggestion.deadlineMissed && <span className="overdue-badge">Deadline passed</span>}
      </div>

      <h4 className="task-title">{suggestion.title}</h4>
      <p className="task-subject">{suggestion.subject}</p>
      <p className="suggestion-message">{suggestion.message}</p>

      {!pickingDate ? (
        <div className="suggestion-actions">
          <button
            className="btn-primary"
            disabled={busy}
            onClick={() => onAccept(suggestion.taskId)}
          >
            Reschedule to {formatDate(suggestion.suggestedDate)}
          </button>
          <button className="btn-secondary" disabled={busy} onClick={() => setPickingDate(true)}>
            Choose another date
          </button>
          <button className="icon-btn" disabled={busy} onClick={() => onDismiss(suggestion.taskId)} aria-label="Dismiss suggestion">
            ✕ Dismiss
          </button>
        </div>
      ) : (
        <div className="suggestion-actions suggestion-date-picker">
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
          <button
            className="btn-primary"
            disabled={busy || !customDate}
            onClick={() => onAccept(suggestion.taskId, customDate)}
          >
            Confirm date
          </button>
          <button className="btn-secondary" disabled={busy} onClick={() => setPickingDate(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const RescheduleSuggestions = ({ suggestions, onAccept, onDismiss, busyTaskId }) => {
  if (suggestions.length === 0) {
    return <EmptyState icon="🙌" text="Great! You have no missed tasks that need rescheduling." />;
  }

  return (
    <div className="suggestion-list">
      {suggestions.map((s) => (
        <SuggestionRow
          key={s.taskId}
          suggestion={s}
          onAccept={onAccept}
          onDismiss={onDismiss}
          busy={busyTaskId === s.taskId}
        />
      ))}
    </div>
  );
};

export default RescheduleSuggestions;
