import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

/* ================= CHART.JS ================= */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [stats, setStats] = useState({
    users: 0,
    notes: 0,
    downloads: 0,
    messages: 0
  });

  const [notesChart, setNotesChart] = useState([]);
  const [downloadsChart, setDownloadsChart] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= AUTH ================= */
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* ================= STATS ================= */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/dashboard");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStats(data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  /* ================= CHART DATA ================= */
  useEffect(() => {
    fetch("http://localhost:5000/admin/chart/notes-per-user")
      .then(res => res.json())
      .then(setNotesChart);

    fetch("http://localhost:5000/admin/chart/downloads-per-day")
      .then(res => res.json())
      .then(setDownloadsChart);
  }, []);

  if (loading) return <div className="admin-main"><h2>Loading...</h2></div>;
  if (error) return <div className="admin-main"><h2>{error}</h2></div>;

  /* ================= CHART OPTIONS ================= */
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" }
      }
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { display: false }
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "#1e293b" }
      }
    }
  };

  /* ================= BAR ================= */
  const barData = {
    labels: notesChart.map(i => i.user),
    datasets: [
      {
        label: "Notes Uploaded",
        data: notesChart.map(i => i.totalNotes),
        backgroundColor: "#facc15",
        borderRadius: 8,
        barThickness: 45
      }
    ]
  };

  /* ================= LINE ================= */
  const lineData = {
    labels: downloadsChart.map(i =>
      new Date(i.day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
      })
    ),
    datasets: [
      {
        label: "Downloads",
        data: downloadsChart.map(i => i.totalDownloads),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.25)",
        fill: true,
        tension: 0.4,
        pointRadius: 5
      }
    ]
  };

  /* ================= PIE ================= */
  const pieData = {
    labels: ["Users", "Notes", "Downloads"],
    datasets: [
      {
        data: [stats.users, stats.notes, stats.downloads],
        backgroundColor: ["#3b82f6", "#facc15", "#22c55e"]
      }
    ]
  };

  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <nav className="admin-nav">
          <button onClick={() => navigate("/admin")}>Dashboard</button>
          <button onClick={() => navigate("/manage-users")}>Manage Users</button>
          <button onClick={() => navigate("/manage-notes")}>Manage Notes</button>
          <button onClick={() => navigate("/view-messages")}>Messages</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card"><h3>Users</h3><p>{stats.users}</p></div>
          <div className="stat-card"><h3>Notes</h3><p>{stats.notes}</p></div>
          <div className="stat-card"><h3>Downloads</h3><p>{stats.downloads}</p></div>
          <div className="stat-card"><h3>Messages</h3><p>{stats.messages}</p></div>
        </div>

        {/* CHARTS */}
        <section className="admin-section">
          <h2>Analytics</h2>

          <div className="chart-grid">
            <div className="chart-card" style={{ height: "320px" }}>
              <h3>Notes per User</h3>
              <Bar data={barData} options={commonOptions} />
            </div>

            <div className="chart-card" style={{ height: "320px" }}>
              <h3>Downloads per Day</h3>
              <Line data={lineData} options={commonOptions} />
            </div>

            <div className="chart-card" style={{ height: "320px" }}>
              <h3>System Overview</h3>
              <Doughnut data={pieData} />
            </div>
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="admin-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <button className="activity-item" onClick={() => navigate("/manage-notes")}>
              📄 New note uploaded
            </button>
            <button className="activity-item" onClick={() => navigate("/manage-users")}>
              👤 New user registered
            </button>
            <button className="activity-item" onClick={() => navigate("/manage-notes")}>
              ⬇️ Note downloaded
            </button>
            <button className="activity-item" onClick={() => navigate("/view-messages")}>
              💬 New contact message
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
