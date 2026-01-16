import React, { useEffect, useState, useCallback } from "react";
import "./MyNotes.css";

function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all");

  const email = sessionStorage.getItem("email");

  const fetchMyNotes = useCallback(async () => {
    if (!email) return;

    const res = await fetch(`http://localhost:5000/notes/my/${email}`);
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  }, [email]);

  useEffect(() => {
    fetchMyNotes();
  }, [fetchMyNotes]);

  const toggleVisibility = async (note) => {
    const newVisibility =
      note.visibility === "public" ? "private" : "public";

    await fetch(`http://localhost:5000/notes/toggle-visibility/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: newVisibility }),
    });

    fetchMyNotes();
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Delete this note permanently?")) return;

    const res = await fetch(`http://localhost:5000/notes/${noteId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    fetchMyNotes();
  };

  const filteredNotes =
    filter === "all"
      ? notes
      : notes.filter((n) => n.visibility === filter);

  return (
    <div className="page-container">
      <h1>My Notes</h1>

      <div className="filter-bar">
        <select
          className="visibility-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Notes</option>
          <option value="public">🌍 Public</option>
          <option value="private">🔒 Private</option>
        </select>
      </div>

      <div className="card-grid">
        {filteredNotes.map((note) => (
          <div className="note-card" key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.description}</p>

            <p><b>Subject:</b> {note.subject}</p>
            <p><b>Visibility:</b> {note.visibility}</p>

            <div className="note-stats">
              ❤️ {note.likes_count} ⬇️ {note.downloads_count}
            </div>

            <div className="note-actions">
              <button onClick={() => window.open(note.url, "_blank")}>
                👁 View
              </button>

              <button onClick={() => toggleVisibility(note)}>
                {note.visibility === "public"
                  ? "🔒 Make Private"
                  : "🌍 Make Public"}
              </button>

              {/* 🗑 ALWAYS VISIBLE ON MY NOTES */}
              <button
                className="delete-btn"
                onClick={() => deleteNote(note.id)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyNotes;
