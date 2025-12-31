import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

function ClientDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    const role = sessionStorage.getItem("role");

    if (!storedName || role !== "client") {
      navigate("/login", { replace: true });
    } else {
      setName(storedName);
    }
  }, [navigate]);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="client-dashboard">
      {/* Sidebar */}
      <aside className="client-sidebar">
        <h2 className="brand">NoteStation</h2>

        <div className="profile">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <p>{name}</p>
        </div>

        <nav>
          <NavLink to="/" end>🏠 Home</NavLink>
          <NavLink to="/notes">📚 Browse Notes</NavLink>
          <NavLink to="/upload">📤 Upload Notes</NavLink>
          <NavLink to="/about">ℹ️ About</NavLink>
          <NavLink to="/contact">📞 Contact</NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      {/* Main */}
      <main className="client-main">
        <h1>Welcome, {name} 👋</h1>
        <p>Explore notes, upload content, and learn smarter.</p>

        <div className="stats">
          <div className="stat-card">📄 Total Notes<br /><span>—</span></div>
          <div className="stat-card">❤️ Likes Given<br /><span>—</span></div>
          <div className="stat-card">⬇️ Downloads<br /><span>—</span></div>
        </div>
      </main>
    </div>
  );
}

export default ClientDashboard;
