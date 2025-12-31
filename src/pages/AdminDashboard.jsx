import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("role") !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>

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
      </div>
    </div>
  );
}

export default AdminDashboard;
