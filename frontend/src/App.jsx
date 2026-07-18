import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import SchedulePlanner from "./pages/SchedulePlanner.jsx";
import RevisionPlanner from "./pages/RevisionPlanner.jsx";
import PomodoroTimer from "./pages/PomodoroTimer.jsx";
import Progress from "./pages/Progress.jsx";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute><SchedulePlanner /></PrivateRoute>} />
      <Route path="/revision" element={<PrivateRoute><RevisionPlanner /></PrivateRoute>} />
      <Route path="/pomodoro" element={<PrivateRoute><PomodoroTimer /></PrivateRoute>} />
      <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
