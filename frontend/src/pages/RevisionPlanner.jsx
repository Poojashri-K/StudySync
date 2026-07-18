import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { Loader, ErrorMessage, EmptyState } from "../components/Feedback.jsx";
import api from "../api/axios.js";

const emptyForm = { subject: "", topic: "", revisionDate: "" };
const emptySmartPlanForm = { subject: "", topic: "", learningDate: new Date().toISOString().slice(0, 10) };

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

// Categorizes a single revision as overdue / due today / upcoming, purely
// from its date (calendar-day comparison, no time-of-day involved so
// today's revisions are never mistaken for overdue).
const getDueBucket = (revisionDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rDate = new Date(revisionDate);
  rDate.setHours(0, 0, 0, 0);
  if (rDate.getTime() < today.getTime()) return "overdue";
  if (rDate.getTime() === today.getTime()) return "dueToday";
  return "upcoming";
};

const RevisionPlanner = () => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showSmartPlanForm, setShowSmartPlanForm] = useState(false);
  const [smartPlanForm, setSmartPlanForm] = useState(emptySmartPlanForm);
  const [smartPlanError, setSmartPlanError] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);

  const fetchRevisions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/revisions");
      setRevisions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load revisions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (r) => {
    setForm({ subject: r.subject, topic: r.topic, revisionDate: r.revisionDate.slice(0, 10) });
    setEditingId(r._id);
    setFormError("");
    setShowForm(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.subject || !form.topic || !form.revisionDate) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/revisions/${editingId}`, form);
        setRevisions((prev) => prev.map((r) => (r._id === editingId ? data : r)));
      } else {
        const { data } = await api.post("/revisions", form);
        setRevisions((prev) => [...prev, data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save revision.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (r) => {
    try {
      const newStatus = r.status === "Completed" ? "Pending" : "Completed";
      const { data } = await api.put(`/revisions/${r._id}`, { status: newStatus });
      setRevisions((prev) => prev.map((x) => (x._id === r._id ? data : x)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update revision.");
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete revision for "${r.topic}"?`)) return;
    try {
      await api.delete(`/revisions/${r._id}`);
      setRevisions((prev) => prev.filter((x) => x._id !== r._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete revision.");
    }
  };

  const openSmartPlanForm = () => {
    setSmartPlanForm(emptySmartPlanForm);
    setSmartPlanError("");
    setShowSmartPlanForm(true);
  };

  const handleSmartPlanChange = (e) =>
    setSmartPlanForm({ ...smartPlanForm, [e.target.name]: e.target.value });

  const handleSmartPlanSubmit = async (e) => {
    e.preventDefault();
    setSmartPlanError("");

    if (!smartPlanForm.subject || !smartPlanForm.topic) {
      setSmartPlanError("Subject and topic are required.");
      return;
    }

    setCreatingPlan(true);
    try {
      const { data } = await api.post("/revisions/smart-plan", smartPlanForm);
      setRevisions((prev) => [...prev, ...data]);
      setShowSmartPlanForm(false);
    } catch (err) {
      setSmartPlanError(err.response?.data?.message || "Failed to create smart revision plan.");
    } finally {
      setCreatingPlan(false);
    }
  };

  const pending = revisions.filter((r) => r.status === "Pending");
  const overdue = pending
    .filter((r) => getDueBucket(r.revisionDate) === "overdue")
    .sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate));
  const dueToday = pending
    .filter((r) => getDueBucket(r.revisionDate) === "dueToday")
    .sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate));
  const upcoming = pending
    .filter((r) => getDueBucket(r.revisionDate) === "upcoming")
    .sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate));
  const completed = revisions.filter((r) => r.status === "Completed");

  const renderList = (list, markOverdue = false) => (
    <div className="card-grid">
      {list.map((r) => (
        <div className={`task-card ${r.status === "Completed" ? "completed" : ""}`} key={r._id}>
          <div className="task-card-top">
            {r.revisionNumber && <span className="priority-badge priority-medium">Revision {r.revisionNumber}/4</span>}
            {markOverdue && <span className="overdue-badge">Overdue</span>}
          </div>
          <h4 className="task-title">{r.topic}</h4>
          <p className="task-subject">{r.subject}</p>
          <p className="task-date">📅 {formatDate(r.revisionDate)}</p>
          <div className="task-card-actions">
            <label className="task-checkbox">
              <input type="checkbox" checked={r.status === "Completed"} onChange={() => handleToggleStatus(r)} />
              {r.status === "Completed" ? "Completed" : "Mark done"}
            </label>
            <div className="task-buttons">
              <button className="icon-btn" onClick={() => openEditForm(r)} aria-label="Edit revision">✏️</button>
              <button className="icon-btn" onClick={() => handleDelete(r)} aria-label="Delete revision">🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revision Planner</h1>
          <p className="page-subtitle">Schedule and track your revision sessions.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={openSmartPlanForm}>🧠 Create Smart Revision Plan</button>
          <button className="btn-primary" onClick={openCreateForm}>+ Add Revision</button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading revisions..." />
      ) : (
        <>
          {overdue.length > 0 && (
            <section className="card overdue-card">
              <h2 className="card-title">⚠️ Overdue Revisions</h2>
              {renderList(overdue, true)}
            </section>
          )}

          <section className="card">
            <h2 className="card-title">Due Today</h2>
            {dueToday.length === 0 ? (
              <EmptyState icon="🔁" text="No revisions due today." />
            ) : (
              renderList(dueToday)
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Upcoming Revisions</h2>
            {upcoming.length === 0 ? (
              <EmptyState icon="🔁" text="No upcoming revisions scheduled." />
            ) : (
              renderList(upcoming)
            )}
          </section>

          {completed.length > 0 && (
            <section className="card">
              <h2 className="card-title">Completed Revisions</h2>
              {renderList(completed)}
            </section>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-title">{editingId ? "Edit Revision" : "Add Revision"}</h2>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <label>
                Subject
                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Chemistry" />
              </label>
              <label>
                Topic
                <input type="text" name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Periodic Table" />
              </label>
              <label>
                Revision Date
                <input type="date" name="revisionDate" value={form.revisionDate} onChange={handleChange} />
              </label>

              <ErrorMessage message={formError} />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSmartPlanForm && (
        <div className="modal-overlay" onClick={() => setShowSmartPlanForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="card-title">🧠 Create Smart Revision Plan</h2>
            <p className="page-subtitle">
              We'll automatically schedule 4 revisions using spaced repetition (1, 3, 7 and 14
              days apart).
            </p>
            <form onSubmit={handleSmartPlanSubmit} className="modal-form" noValidate>
              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={smartPlanForm.subject}
                  onChange={handleSmartPlanChange}
                  placeholder="e.g. DBMS"
                />
              </label>
              <label>
                Topic
                <input
                  type="text"
                  name="topic"
                  value={smartPlanForm.topic}
                  onChange={handleSmartPlanChange}
                  placeholder="e.g. Normalization"
                />
              </label>
              <label>
                Date Learned / Completed
                <input
                  type="date"
                  name="learningDate"
                  value={smartPlanForm.learningDate}
                  onChange={handleSmartPlanChange}
                />
              </label>

              <ErrorMessage message={smartPlanError} />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSmartPlanForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creatingPlan}>
                  {creatingPlan ? "Creating..." : "Generate Revision Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RevisionPlanner;
