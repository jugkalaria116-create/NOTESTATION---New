import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import "./MyNotes.css";

function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all");

  // 🧠 Undo state
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimerRef = useRef(null);

  const email = sessionStorage.getItem("email");

  // ================= FETCH MY NOTES =================
  const fetchMyNotes = useCallback(async () => {
    if (!email) return;

    try {
      const res = await fetch(
        `http://localhost:5000/notes/my/${email}`
      );
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch my notes error:", err);
    }
  }, [email]);

  useEffect(() => {
    fetchMyNotes();
  }, [fetchMyNotes]);

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

    fetchMyNotes();
  };

  // ================= MOVE TO TRASH (SAFE) =================
  const deleteNote = async (note) => {
    // 1️⃣ Remove from UI instantly
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setPendingDelete(note);

    // 2️⃣ Move to trash in DB (deleted_at = NOW)
    await fetch(
      `http://localhost:5000/notes/trash/${note.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    // 3️⃣ Undo window (UI only)
    deleteTimerRef.current = setTimeout(() => {
      setPendingDelete(null);
    }, 5000);
  };

  // ================= UNDO DELETE =================
  const undoDelete = async () => {
    if (!pendingDelete) return;

    clearTimeout(deleteTimerRef.current);

    // Restore in DB
    await fetch(
      `http://localhost:5000/notes/restore/${pendingDelete.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    // Restore in UI
    setNotes((prev) => [pendingDelete, ...prev]);
    setPendingDelete(null);
  };

  // ================= FILTER =================
  const filteredNotes =
    filter === "all"
      ? notes
      : notes.filter((n) => n.visibility === filter);

  return (
    <div className="page-container">
      <h1>My Notes</h1>

      {/* ===== FILTER ===== */}
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

      {/* ===== NOTES GRID ===== */}
      <div className="card-grid">
        {filteredNotes.length === 0 && (
          <p className="empty-state">No notes found</p>
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
              {note.visibility === "public"
                ? "🌍 Public"
                : "🔒 Private"}
            </p>

            <div className="note-stats">
              ❤️ {note.likes_count} &nbsp; ⬇️{" "}
              {note.downloads_count}
            </div>

            <div className="note-actions">
              <button
                onClick={() =>
                  window.open(note.url, "_blank")
                }
              >
                👁 View
              </button>

              <button
                onClick={() => toggleVisibility(note)}
              >
                {note.visibility === "public"
                  ? "🔒 Make Private"
                  : "🌍 Make Public"}
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteNote(note)}
              >
                🗑 Move to Trash
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== UNDO BAR ===== */}
      {pendingDelete && (
        <div className="undo-bar">
          <span>Note moved to trash</span>

          <div className="undo-timer">
            <div className="undo-progress" />
          </div>

          <button onClick={undoDelete}>UNDO</button>
        </div>
      )}
    </div>
  );
}

export default MyNotes;
