import React, { useEffect, useState } from "react";
import "./MyNotes.css";

function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all"); // all | public | private
  const email = sessionStorage.getItem("email");

  // ================= FETCH MY NOTES =================
  const fetchMyNotes = async () => {
    try {
      const res = await fetch(`http://localhost:5000/notes/my/${email}`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch my notes error:", err);
    }
  };

  useEffect(() => {
    if (email) fetchMyNotes();
  }, [email]);

  // ================= TOGGLE VISIBILITY =================
  const toggleVisibility = async (note) => {
    const newVisibility =
      note.visibility === "public" ? "private" : "public";

    await fetch(
      `http://localhost:5000/notes/toggle-visibility/${note.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      }
    );

    fetchMyNotes(); // refresh list
  };

  // ================= FILTERED NOTES =================
  const filteredNotes =
    filter === "all"
      ? notes
      : notes.filter((note) => note.visibility === filter);

  return (
    <div className="page-container">
      <h1>My Notes</h1>

      {/* ===== VISIBILITY FILTER ===== */}
      <div className="filter-bar">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="visibility-filter"
        >
          <option value="all">All Notes</option>
          <option value="public">🌍 Public</option>
          <option value="private">🔒 Private</option>
        </select>
      </div>

      {/* ===== NOTES GRID ===== */}
      <div className="card-grid">
        {filteredNotes.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No notes found.</p>
        )}

        {filteredNotes.map((note) => (
          <div className="note-card" key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.description}</p>

            <p>
              <b>Subject:</b> {note.subject}
            </p>

            <p>
              <b>Visibility:</b>{" "}
              {note.visibility === "public" ? "🌍 Public" : "🔒 Private"}
            </p>

            <div className="note-stats">
              ❤️ {note.likes_count} &nbsp; ⬇️ {note.downloads_count}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyNotes;
