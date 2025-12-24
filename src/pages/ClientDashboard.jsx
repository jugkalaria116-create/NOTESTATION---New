import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

function ClientDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // 🔐 SESSION STORAGE (instead of localStorage)
    let storedName = sessionStorage.getItem("name");

    // 🚫 sanitize bad values
    if (!storedName || storedName === "undefined" || storedName === "null") {
      navigate("/logins", { replace: true });
    } else {
      setName(storedName);
    }

    setCheckingAuth(false);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear(); // ✅ clear session
    navigate("/logins", { replace: true });
  };

  // ⛔ Stop rendering until auth is checked
  if (checkingAuth) return null;

  return (
    <div className="client-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <p className="email">{name || "User"}</p>
        </div>

        <nav className="menu">
          <NavLink to="/" className="menu-item">🏠 Home</NavLink>
          <NavLink to="/upload" className="menu-item">📤 Upload Notes</NavLink>
          <NavLink to="/notes" className="menu-item">📚 Browse Notes</NavLink>
          <NavLink to="/contact" className="menu-item">📞 Contact Us</NavLink>
          <NavLink to="/about" className="menu-item">ℹ️ About</NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <div className="top-bar">
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            disabled
          />
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="empty-state">
          <p>No notes uploaded yet.</p>
        </div>

        <footer className="dashboard-footer">
          © 2025 NoteStation. All rights reserved
        </footer>
      </main>
    </div>
  );
}

export default ClientDashboard;
