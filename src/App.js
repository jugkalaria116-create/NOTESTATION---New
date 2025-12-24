import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";
import Registers from "./pages/Registers";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Logins from "./pages/Logins";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageNotes from "./pages/ManageNotes";
import ViewMessages from "./pages/ViewMessages";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/logins" element={<Logins />} />
        <Route path="/registers" element={<Registers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* CLIENT */}
        <Route path="/notes" element={<Notes />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-notes" element={<ManageNotes />} />
        <Route path="/view-messages" element={<ViewMessages />} />

        {/* FALLBACK */}
        <Route path="*" element={<h2>404 – Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
