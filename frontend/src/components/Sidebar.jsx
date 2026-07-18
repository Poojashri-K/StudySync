import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/schedule", label: "Study Planner", icon: "🗓️" },
  { to: "/revision", label: "Revision Planner", icon: "🔁" },
  { to: "/pomodoro", label: "Pomodoro Timer", icon: "⏱️" },
  { to: "/progress", label: "Progress", icon: "📊" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <span className="brand">📚 StudySync</span>
        <button
          className="hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">📚 StudySync</div>

        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase() || "S"}</div>
          <div>
            <p className="user-name">{user?.name}</p>
            <p className="user-streak">🔥 {user?.currentStreak ?? 0} day streak</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default Sidebar;
