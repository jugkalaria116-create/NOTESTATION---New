import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* PUBLIC PAGES */
import Home from "./pages/Home";
import Logins from "./pages/Logins";
import Registers from "./pages/Registers";
import About from "./pages/About";
import Contact from "./pages/Contact";

/* CLIENT PAGES */
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";
import ClientDashboard from "./pages/ClientDashboard";
import MyNotes from "./pages/MyNotes";
import TrashBin from "./pages/TrashBin";

/* ADMIN PAGES */
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageNotes from "./pages/ManageNotes";
import ViewMessages from "./pages/ViewMessages";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Logins />} />
        <Route path="/registers" element={<Registers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ================= CLIENT ================= */}
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

        <Route
          path="/my-notes"
          element={
            <ProtectedRoute role="client">
              <MyNotes />
            </ProtectedRoute>
          }
        />

        {/* 🗑 TRASH BIN */}
        <Route
          path="/trash"
          element={
            <ProtectedRoute role="client">
              <TrashBin />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
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

        {/* ================= 404 ================= */}
        <Route path="*" element={<h2>404 – Page Not Found</h2>} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
