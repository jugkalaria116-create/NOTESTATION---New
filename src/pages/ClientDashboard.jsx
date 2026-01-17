import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

/* ===== CHART.JS ===== */
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function ClientDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [notes, setNotes] = useState(0);
  const [likes, setLikes] = useState(0);
  const [downloads, setDownloads] = useState(0);

  // 🔥 NEW STATES
  const [privateNotes, setPrivateNotes] = useState(0);
  const [publicNotes, setPublicNotes] = useState(0);

  /* ===== AUTH CHECK ===== */
  useEffect(() => {
    const n = sessionStorage.getItem("name");
    const e = sessionStorage.getItem("email");
    const r = sessionStorage.getItem("role");

    if (!n || !e || r !== "client") {
      navigate("/login", { replace: true });
    } else {
      setName(n);
      setEmail(e);
    }
  }, [navigate]);

  /* ===== FETCH STATS ===== */
  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:5000/user/notes/${email}`)
      .then(res => res.json())
      .then(d => setNotes(d.totalNotes || 0));

    fetch(`http://localhost:5000/user/likes/${email}`)
      .then(res => res.json())
      .then(d => setLikes(d.totalLikes || 0));

    fetch(`http://localhost:5000/user/downloads/${email}`)
      .then(res => res.json())
      .then(d => setDownloads(d.totalDownloads || 0));

    // 🔥 NEW API (Private / Public)
    fetch(`http://localhost:5000/user/notes/visibility/${email}`)
      .then(res => res.json())
      .then(d => {
        setPrivateNotes(d.private || 0);
        setPublicNotes(d.public || 0);
      });

  }, [email]);

  /* ===== PIE CHART ===== */
  const pieChart = {
    labels: ["Notes", "Likes", "Downloads"],
    datasets: [
      {
        data: [notes, likes, downloads],
        backgroundColor: ["#22c55e", "#f43f5e", "#38bdf8"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="client-page">
      {/* ===== SIDEBAR ===== */}
      <aside className="client-sidebar">
        <div className="profile">
          <div className="avatar">{name.charAt(0)}</div>
          <p className="profile-name">{name}</p>
        </div>

        <nav>
          <NavLink to="/notes">📚 Browse Notes</NavLink>
          <NavLink to="/my-notes">📁My Notes</NavLink>
          <NavLink to="/trash" className="trash-link">  🗑️Bin</NavLink>
          <NavLink to="/upload">📤 Upload</NavLink>
          <NavLink to="/contact">💬 Contact</NavLink>
          <NavLink to="/about">ℹ️ About</NavLink>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="client-main">
        <h1 className="welcome">
          Welcome Back, {name} <span>👋</span>
        </h1>
        <p className="email">{email}</p>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="quick-actions">
          <button
            className="quick-btn primary"
            onClick={() => navigate("/upload")}
          >
            📤 Upload Notes
          </button>

          <button
            className="quick-btn"
            onClick={() => navigate("/notes")}
          >
            📚 Browse Notes
          </button>

          <button
            className="quick-btn"
            onClick={() => navigate("/contact")}
          >
            💬 Contact Support
          </button>
        </div>

        {/* ===== STATS ===== */}
        <div className="stats-row">
          <div className="stat-card">
            📄 Your Notes <span>{notes}</span>
          </div>
          <div className="stat-card">
            ❤️ Likes <span>{likes}</span>
          </div>
          <div className="stat-card">
            ⬇ Downloads <span>{downloads}</span>
          </div>
        </div>

        {/* ===== ACTIVITY + VISIBILITY ===== */}
        <section className="charts-row">

          {/* PIE CHART */}
          <div className="chart-card">
            <h3>Activity Overview</h3>
            <Doughnut data={pieChart} />
          </div>

          {/* PRIVATE / PUBLIC CARDS */}
          <div className="visibility-cards">
            <div className="stat-card large">
              🔒 Private Notes
              <span>{privateNotes}</span>
            </div>

            <div className="stat-card large">
              🌍 Public Notes
              <span>{publicNotes}</span>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default ClientDashboard;
