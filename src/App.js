import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import Home from "./pages/Home";
import Logins from "./pages/Logins";
import Registers from "./pages/Registers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageNotes from "./pages/ManageNotes";
import ViewMessages from "./pages/ViewMessages";
import ForgotPassword from "./pages/ForgotPassword"; // ✅ ADDED

/* Auth */
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Logins />} />

        {/* 🔥 FIXED: /register instead of /registers */}
        <Route path="/registers" element={<Registers />} />

        {/* 🔥 ADDED: Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ---------- CLIENT ---------- */}
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute role="client">
              <Notes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute role="client">
              <Upload />
            </ProtectedRoute>
          }
        />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-users"
          element={
            <ProtectedRoute role="admin">
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-notes"
          element={
            <ProtectedRoute role="admin">
              <ManageNotes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-messages"
          element={
            <ProtectedRoute role="admin">
              <ViewMessages />
            </ProtectedRoute>
          }
        />

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<h2>404 – Page Not Found</h2>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
