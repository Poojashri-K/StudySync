import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { Loader, ErrorMessage } from "../components/Feedback.jsx";
import api from "../api/axios.js";

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/progress");
        setProgress(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load progress.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const revisionPercentage =
    progress && progress.totalRevisions > 0
      ? Math.round((progress.completedRevisions / progress.totalRevisions) * 100)
      : 0;

  return (
    <Layout>
      <h1 className="page-title">Your Progress</h1>
      <p className="page-subtitle">A snapshot of your study performance.</p>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading progress..." />
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-icon">📋</span>
              <p className="stat-value">{progress.totalTasks}</p>
              <p className="stat-label">Total Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <p className="stat-value">{progress.completedTasks}</p>
              <p className="stat-label">Completed Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <p className="stat-value">{progress.pendingTasks}</p>
              <p className="stat-label">Pending Tasks</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🍅</span>
              <p className="stat-value">{progress.pomodoroSessionsCompleted}</p>
              <p className="stat-label">Pomodoro Sessions</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔥</span>
              <p className="stat-value">{progress.currentStreak}</p>
              <p className="stat-label">Current Streak</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏆</span>
              <p className="stat-value">{progress.longestStreak}</p>
              <p className="stat-label">Longest Streak</p>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Task Completion</h2>
            <ProgressBar percentage={progress.completionPercentage} />
          </section>

          <section className="card">
            <h2 className="card-title">Revision Completion</h2>
            <ProgressBar percentage={revisionPercentage} />
          </section>
        </>
      )}
    </Layout>
  );
};

export default Progress;
