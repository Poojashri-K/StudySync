import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { Loader, ErrorMessage, EmptyState } from "../components/Feedback.jsx";
import api from "../api/axios.js";

const emptyForm = { subject: "", title: "", date: "", priority: "Medium", deadline: "" };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => filter === "All" || t.status === filter);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setForm({
      subject: task.subject,
      title: task.title,
      date: task.date.slice(0, 10),
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0, 10) : "",
    });
    setEditingId(task._id);
    setFormError("");
    setShowForm(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.subject || !form.title || !form.date) {
      setFormError("Subject, title and date are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/tasks/${editingId}`, form);
        setTasks((prev) => prev.map((t) => (t._id === editingId ? data : t)));
      } else {
        const { data } = await api.post("/tasks", form);
        setTasks((prev) => [...prev, data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === "Completed" ? "Pending" : "Completed";
      const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task status.");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task.");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Tasks</h1>
          <p className="page-subtitle">Keep track of everything you need to study.</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          + Add Task
        </button>
      </div>

      <div className="filter-tabs">
        {["All", "Pending", "Completed"].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState icon="📝" text="No tasks found. Add your first task to get started!" />
      ) : (
        <div className="card-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-title">{editingId ? "Edit Task" : "Add New Task"}</h2>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <label>
                Subject
                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Mathematics" />
              </label>
              <label>
                Task Title
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Solve Chapter 4 problems" />
              </label>
              <label>
                Date
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </label>
              <label>
                Deadline <span className="label-hint">(optional)</span>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
              </label>
              <label>
                Priority
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <ErrorMessage message={formError} />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Tasks;
