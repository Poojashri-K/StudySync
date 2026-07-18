import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage } from "../components/Feedback.jsx";
import api from "../api/axios.js";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const PomodoroTimer = () => {
  const [mode, setMode] = useState("Focus"); // "Focus" | "Break"
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    // Load the user's total completed sessions from the backend
    const fetchProgress = async () => {
      try {
        const { data } = await api.get("/progress");
        setSessionsCompleted(data.pomodoroSessionsCompleted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load Pomodoro history.");
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);

  const handleSessionEnd = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);

    if (mode === "Focus") {
      // A focus session just finished - log it and switch to break
      try {
        const { data } = await api.post("/progress/pomodoro");
        setSessionsCompleted(data.pomodoroSessionsCompleted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to log Pomodoro session.");
      }
      setMode("Break");
      setSecondsLeft(BREAK_SECONDS);
    } else {
      // Break finished - switch back to focus
      setMode("Focus");
      setSecondsLeft(FOCUS_SECONDS);
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(mode === "Focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const totalSeconds = mode === "Focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  return (
    <Layout>
      <h1 className="page-title">Pomodoro Timer</h1>
      <p className="page-subtitle">Stay focused with timed study and break sessions.</p>

      <ErrorMessage message={error} />

      <section className="pomodoro-card">
        <span className={`pomodoro-mode-badge ${mode === "Focus" ? "focus" : "break"}`}>
          {mode === "Focus" ? "🎯 Focus Session" : "☕ Break Session"}
        </span>

        <div className="pomodoro-ring" style={{ "--progress": `${progressPercent}%` }}>
          <span className="pomodoro-time">{formatTime(secondsLeft)}</span>
        </div>

        <div className="pomodoro-controls">
          {!isRunning ? (
            <button className="btn-primary" onClick={handleStart}>▶ Start</button>
          ) : (
            <button className="btn-primary" onClick={handlePause}>⏸ Pause</button>
          )}
          <button className="btn-secondary" onClick={handleReset}>⟲ Reset</button>
        </div>

        <p className="pomodoro-sessions">🍅 Sessions completed: <strong>{sessionsCompleted}</strong></p>
      </section>
    </Layout>
  );
};

export default PomodoroTimer;
