import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { Loader, ErrorMessage, EmptyState } from "../components/Feedback.jsx";
import api from "../api/axios.js";

const emptyForm = { subject: "", topic: "", date: "", startTime: "", endTime: "" };

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const SchedulePlanner = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/schedules");
      setSchedules(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setForm({ subject: s.subject, topic: s.topic, date: s.date.slice(0, 10), startTime: s.startTime, endTime: s.endTime });
    setEditingId(s._id);
    setFormError("");
    setShowForm(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.subject || !form.topic || !form.date || !form.startTime || !form.endTime) {
      setFormError("All fields are required.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setFormError("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/schedules/${editingId}`, form);
        setSchedules((prev) => prev.map((s) => (s._id === editingId ? data : s)));
      } else {
        const { data } = await api.post("/schedules", form);
        setSchedules((prev) => [...prev, data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.topic}" session?`)) return;
    try {
      await api.delete(`/schedules/${s._id}`);
      setSchedules((prev) => prev.filter((x) => x._id !== s._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete schedule.");
    }
  };

  const upcoming = [...schedules]
    .filter((s) => new Date(s.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = schedules.filter((s) => new Date(s.date) < new Date(new Date().toDateString()));

  const renderList = (list) => (
    <div className="card-grid">
      {list.map((s) => (
        <div className="task-card" key={s._id}>
          <h4 className="task-title">{s.topic}</h4>
          <p className="task-subject">{s.subject}</p>
          <p className="task-date">📅 {formatDate(s.date)}</p>
          <p className="task-date">🕒 {s.startTime} – {s.endTime}</p>
          <div className="task-buttons" style={{ marginTop: "0.75rem" }}>
            <button className="icon-btn" onClick={() => openEditForm(s)} aria-label="Edit schedule">✏️</button>
            <button className="icon-btn" onClick={() => handleDelete(s)} aria-label="Delete schedule">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Schedule Planner</h1>
          <p className="page-subtitle">Plan your daily and weekly study sessions.</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>+ Add Session</button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading schedule..." />
      ) : (
        <>
          <section className="card">
            <h2 className="card-title">Upcoming Sessions</h2>
            {upcoming.length === 0 ? (
              <EmptyState icon="🗓️" text="No upcoming study sessions planned." />
            ) : (
              renderList(upcoming)
            )}
          </section>

          {past.length > 0 && (
            <section className="card">
              <h2 className="card-title">Past Sessions</h2>
              {renderList(past)}
            </section>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-title">{editingId ? "Edit Session" : "Add Study Session"}</h2>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <label>
                Subject
                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics" />
              </label>
              <label>
                Topic
                <input type="text" name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Thermodynamics" />
              </label>
              <label>
                Date
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </label>
              <div className="form-row">
                <label>
                  Start Time
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
                </label>
                <label>
                  End Time
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
                </label>
              </div>

              <ErrorMessage message={formError} />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SchedulePlanner;
