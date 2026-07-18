import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import RescheduleSuggestions from "../components/RescheduleSuggestions.jsx";
import { Loader, ErrorMessage, EmptyState } from "../components/Feedback.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [revisionSummary, setRevisionSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestionsError, setSuggestionsError] = useState("");
  const [busyTaskId, setBusyTaskId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tasksRes, progressRes, suggestionsRes, revisionSummaryRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/progress"),
        api.get("/reschedule/suggestions"),
        api.get("/revisions/summary"),
      ]);
      setTasks(tasksRes.data);
      setProgress(progressRes.data);
      setSuggestions(suggestionsRes.data);
      setRevisionSummary(revisionSummaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptSuggestion = async (taskId, customDate) => {
    setSuggestionsError("");
    setBusyTaskId(taskId);
    try {
      await api.post(`/reschedule/${taskId}/accept`, customDate ? { date: customDate } : {});
      const [tasksRes, progressRes, suggestionsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/progress"),
        api.get("/reschedule/suggestions"),
      ]);
      setTasks(tasksRes.data);
      setProgress(progressRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (err) {
      setSuggestionsError(err.response?.data?.message || "Failed to reschedule task.");
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDismissSuggestion = async (taskId) => {
    setSuggestionsError("");
    setBusyTaskId(taskId);
    try {
      await api.post(`/reschedule/${taskId}/dismiss`);
      setSuggestions((prev) => prev.filter((s) => s.taskId !== taskId));
    } catch (err) {
      setSuggestionsError(err.response?.data?.message || "Failed to dismiss suggestion.");
    } finally {
      setBusyTaskId(null);
    }
  };

  const today = new Date().toDateString();
  const todaysTasks = tasks.filter((t) => new Date(t.date).toDateString() === today);

  const quickLinks = [
    { to: "/tasks", label: "Tasks", icon: "✅" },
    { to: "/schedule", label: "Study Planner", icon: "🗓️" },
    { to: "/revision", label: "Revision Planner", icon: "🔁" },
    { to: "/pomodoro", label: "Pomodoro Timer", icon: "⏱️" },
    { to: "/progress", label: "Progress", icon: "📊" },
  ];

  return (
    <Layout>
      <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
      <p className="page-subtitle">Here's your study snapshot for today.</p>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading your dashboard..." />
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-icon">🔥</span>
              <p className="stat-value">{progress?.currentStreak ?? 0}</p>
              <p className="stat-label">Day Streak</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <p className="stat-value">{progress?.completedTasks ?? 0}</p>
              <p className="stat-label">Completed Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <p className="stat-value">{progress?.pendingTasks ?? 0}</p>
              <p className="stat-label">Pending Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🍅</span>
              <p className="stat-value">{progress?.pomodoroSessionsCompleted ?? 0}</p>
              <p className="stat-label">Pomodoro Sessions</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📌</span>
              <p className="stat-value">{progress?.overdueTasks?.length ?? 0}</p>
              <p className="stat-label">Overdue Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔁</span>
              <p className="stat-value">{revisionSummary?.dueToday?.length ?? 0}</p>
              <p className="stat-label">Revisions Due Today</p>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Overall Progress</h2>
            <ProgressBar percentage={progress?.completionPercentage ?? 0} />
          </section>

          {progress?.overdueTasks?.length > 0 && (
            <section className="card overdue-card">
              <h2 className="card-title">⚠️ Overdue Reminders</h2>
              <ul className="reminder-list">
                {progress.overdueTasks.slice(0, 5).map((t) => (
                  <li key={t._id}>
                    <strong>{t.title}</strong> — {t.subject} (
                    {new Date(t.date).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card">
            <h2 className="card-title">Today's Tasks</h2>
            {todaysTasks.length === 0 ? (
              <EmptyState icon="🗓️" text="No tasks scheduled for today." />
            ) : (
              <ul className="reminder-list">
                {todaysTasks.map((t) => (
                  <li key={t._id}>
                    <strong>{t.title}</strong> — {t.subject}{" "}
                    <span className={`status-pill ${t.status.toLowerCase()}`}>{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">🧠 Smart Rescheduling Suggestions</h2>
            <ErrorMessage message={suggestionsError} />
            <RescheduleSuggestions
              suggestions={suggestions}
              onAccept={handleAcceptSuggestion}
              onDismiss={handleDismissSuggestion}
              busyTaskId={busyTaskId}
            />
          </section>

          <section className="card">
            <h2 className="card-title">🔁 Revisions Due Today</h2>
            {(revisionSummary?.dueToday?.length ?? 0) === 0 ? (
              <EmptyState icon="🔁" text="No revisions due today." />
            ) : (
              <ul className="reminder-list">
                {revisionSummary.dueToday.map((r) => (
                  <li key={r._id}>
                    <strong>{r.topic}</strong> — {r.subject}
                    {r.revisionNumber && <span className="status-pill pending">Revision {r.revisionNumber}</span>}
                  </li>
                ))}
              </ul>
            )}
            {(revisionSummary?.upcoming?.length ?? 0) > 0 && (
              <p className="section-footnote">
                Plus {revisionSummary.upcoming.length} more upcoming — see the{" "}
                <Link to="/revision">Revision Planner</Link>.
              </p>
            )}
          </section>

          <section className="quick-links">
            {quickLinks.map((link) => (
              <Link to={link.to} key={link.to} className="quick-link-card">
                <span className="icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </section>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
