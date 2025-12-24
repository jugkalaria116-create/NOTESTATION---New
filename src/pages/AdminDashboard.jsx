import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./AdminDashboard.css";

function AdminDashboard() {
  // ✅ Hooks MUST be at top level
  const navigate = useNavigate();

  // ✅ Auth check AFTER hooks
  if (localStorage.getItem("role") !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <h1>Welcome, Admin</h1>
        <p>
          Monitor user activity, manage uploads, and control the platform with ease.
        </p>
      </header>

      <section className="dashboard-section container">
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h5 className="card-title">Manage Users</h5>
            <p className="card-text">
              View, edit, or remove users registered on NoteStation.
            </p>
            <button
              onClick={() => navigate("/manage-users")}
              className="btn btn-light"
            >
              Check User Details
            </button>
          </div>

          <div className="dashboard-card">
            <h5 className="card-title">Manage Notes</h5>
            <p className="card-text">
              Review, approve, or delete uploaded notes.
            </p>
            <button
              onClick={() => navigate("/manage-notes")}
              className="btn btn-light"
            >
              Check Notes
            </button>
          </div>

          <div className="dashboard-card">
            <h5 className="card-title">View Messages</h5>
            <p className="card-text">
              Check inquiries submitted through the contact form.
            </p>
            <button
              onClick={() => navigate("/view-messages")}
              className="btn btn-light"
            >
              Check Messages
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
