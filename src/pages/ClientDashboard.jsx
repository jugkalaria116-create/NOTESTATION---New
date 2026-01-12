import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

/* ===== CHART.JS ===== */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,        // ✅ ADDED
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2"; // ✅ ADDED Doughnut

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,        // ✅ ADDED
  Tooltip,
  Legend
);

function ClientDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [notes, setNotes] = useState(0);
  const [likes, setLikes] = useState(0);
  const [downloads, setDownloads] = useState(0);

  const [likesTrend, setLikesTrend] = useState([]);
  const [downloadTrend, setDownloadTrend] = useState([]);

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

  /* ===== DASHBOARD STATS ===== */
  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:5000/user/notes/${email}`)
      .then(res => res.json())
      .then(d => setNotes(d.totalNotes));

    fetch(`http://localhost:5000/user/likes/${email}`)
      .then(res => res.json())
      .then(d => setLikes(d.totalLikes));

    fetch(`http://localhost:5000/user/downloads/${email}`)
      .then(res => res.json())
      .then(d => setDownloads(d.totalDownloads));

    /* demo trend (replace with real APIs later) */
    setLikesTrend([1, 2, 3, 5, 7]);
    setDownloadTrend([0, 1, 2, 4, 6]);
  }, [email]);

  /* ===== LINE CHART DATA ===== */
  const likesChart = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Likes",
        data: likesTrend,
        borderColor: "#f43f5e",
        tension: 0.4,
      },
    ],
  };

  const downloadsChart = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Downloads",
        data: downloadTrend,
        borderColor: "#38bdf8",
        tension: 0.4,
      },
    ],
  };

  /* ===== PIE CHART DATA (✅ NEW) ===== */
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
          <button className="quick-btn primary" onClick={() => navigate("/upload")}>
            ⬆ Upload Notes
          </button>

          <button className="quick-btn" onClick={() => navigate("/notes")}>
            📚 Browse Notes
          </button>

          <button className="quick-btn" onClick={() => navigate("/contact")}>
            💬 Contact Support
          </button>
        </div>

        {/* ===== STATS ===== */}
        <div className="stats-row">
          <div className="stat-card">📄 Your Notes <span>{notes}</span></div>
          <div className="stat-card">❤️ Likes <span>{likes}</span></div>
          <div className="stat-card">⬇ Downloads <span>{downloads}</span></div>
        </div>

        {/* ===== CHARTS ===== */}
        <section className="charts">
          <div className="chart-card">
            <h3>Likes Trend</h3>
            <Line data={likesChart} />
          </div>

          <div className="chart-card">
            <h3>Downloads Trend</h3>
            <Line data={downloadsChart} />
          </div>

          
          {/* ✅ PIE CHART ADDED */}
          <div className="chart-card">
            <h3>Activity Overview</h3>
            <Doughnut data={pieChart} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default ClientDashboard;
