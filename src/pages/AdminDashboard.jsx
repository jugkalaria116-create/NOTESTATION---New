import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [totalNotes, setTotalNotes] = useState(0);
  const [userStats, setUserStats] = useState([]);
  const [popularNotes, setPopularNotes] = useState([]);

  // ===== AUTH CHECK =====
  useEffect(() => {
    if (sessionStorage.getItem("role") !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ===== FETCH ADMIN DATA =====
  useEffect(() => {
    fetch("http://localhost:5000/admin/total-notes")
      .then((res) => res.json())
      .then((data) => setTotalNotes(data.totalNotes));

    fetch("http://localhost:5000/admin/user-note-stats")
      .then((res) => res.json())
      .then((data) => setUserStats(data));

    fetch("http://localhost:5000/admin/note-download-stats")
      .then((res) => res.json())
      .then((data) => setPopularNotes(data));
  }, []);

  // const logout = () => {
  //   sessionStorage.clear();
  //   navigate("/login");
  // };

  return (
    <div className="admin-dashboard">
      {/* ===== HEADER ===== */}
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        {/* <button onClick={logout}>Logout</button> */}
      </header>

      {/* ===== TOP CARDS ===== */}
      <div className="admin-cards">
        <div className="admin-card" onClick={() => navigate("/manage-users")}>
          👤 Manage Users
        </div>

        <div className="admin-card" onClick={() => navigate("/manage-notes")}>
          📄 Manage Notes
        </div>

        <div className="admin-card" onClick={() => navigate("/view-messages")}>
          💬 View Messages
        </div>

        <div className="admin-card stats-card">
          <p>📚 Total Notes</p>
          <h2>{totalNotes}</h2>
        </div>
      </div>

      {/* ===== USER DOWNLOAD STATS ===== */}
      <section className="admin-section">
        <h2>⬇️ Total Downloads per User</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Total Notes</th>
              <th>Total Downloads</th>
            </tr>
          </thead>
          <tbody>
            {userStats.length === 0 ? (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            ) : (
              userStats.map((u, i) => (
                <tr key={i}>
                  <td>{u.Email}</td>
                  <td>{u.totalNotes}</td>
                  <td>{u.totalDownloads}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ===== MOST POPULAR NOTES ===== */}
      <section className="admin-section">
        <h2>🔥 Most Popular Notes</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Uploaded By</th>
              <th>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {popularNotes.length === 0 ? (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            ) : (
              popularNotes.map((n, i) => (
                <tr key={i}>
                  <td>{n.title}</td>
                  <td>{n.Email}</td>
                  <td>{n.downloads_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminDashboard;
