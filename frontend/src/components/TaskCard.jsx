const priorityColors = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isOverdue =
    task.status === "Pending" && new Date(task.date) < new Date(new Date().toDateString());

  return (
    <div className={`task-card ${task.status === "Completed" ? "completed" : ""}`}>
      <div className="task-card-top">
        <span className={`priority-badge ${priorityColors[task.priority]}`}>{task.priority}</span>
        {isOverdue && <span className="overdue-badge">Overdue</span>}
      </div>

      <h4 className="task-title">{task.title}</h4>
      <p className="task-subject">{task.subject}</p>
      <p className="task-date">📅 {formatDate(task.date)}</p>

      <div className="task-card-actions">
        <label className="task-checkbox">
          <input
            type="checkbox"
            checked={task.status === "Completed"}
            onChange={() => onToggleStatus(task)}
          />
          {task.status === "Completed" ? "Completed" : "Mark done"}
        </label>
        <div className="task-buttons">
          <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task">
            ✏️
          </button>
          <button className="icon-btn" onClick={() => onDelete(task)} aria-label="Delete task">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
