import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Components (UNCHANGED) */
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";

/* Pages */
import Logins from "./pages/Login";
import Notes from "./pages/Notes";              // ✅ ADDED (IMPORTANT)
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
            key={note.id}
            note={note}
            onEdit={() => setEditingNote(note)}
            onDelete={() => handleDelete(note.id)}
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
        <Route path="/" element={<Logins />} />
        <Route path="/login" element={<Logins />} />

        {/* ✅ FIXED: route now uses Notes.jsx */}
        <Route path="/notes" element={<Notes />} />

        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
