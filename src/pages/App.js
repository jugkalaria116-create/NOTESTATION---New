import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Components */
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";

/* Pages */
import Logins from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* ---------------- NOTES PAGE (UNCHANGED) ---------------- */
function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/notes");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = () => {
    fetchNotes();
    setEditingNote(null);
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  };

  return (
    <div className="container">
      <h1>📝 Note Station</h1>
      <NoteForm note={editingNote} onSave={handleSave} />
      <div className="card-grid">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onEdit={() => setEditingNote(note)}
            onDelete={() => handleDelete(note._id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- APP ROUTER ---------------- */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Logins />} />
        <Route path="/login" element={<Logins />} />

        {/* Notes */}
        <Route path="/notes" element={<NotesPage />} />

        {/* Client Dashboard */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
