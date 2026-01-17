import React, { useEffect, useState, useCallback } from "react";
import "./TrashBin.css";

function TrashBin() {
  const [trash, setTrash] = useState([]);
  const email = sessionStorage.getItem("email");

  const fetchTrash = useCallback(async () => {
    if (!email) return;

    const res = await fetch(
      `http://localhost:5000/notes/trash/${email}`
    );
    const data = await res.json();
    setTrash(Array.isArray(data) ? data : []);
  }, [email]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const restoreNote = async (id) => {
    await fetch(`http://localhost:5000/notes/restore/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    fetchTrash();
  };

  const deleteForever = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    await fetch(`http://localhost:5000/notes/permanent/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    fetchTrash();
  };

  return (
    <div className="page-container">
      <h1>🗑 Trash Bin</h1>

      <div className="card-grid">
        {trash.length === 0 && <p>No deleted notes</p>}

        {trash.map((note) => (
          <div className="note-card" key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.description}</p>

            <div className="note-actions">
              <button onClick={() => restoreNote(note.id)}>
                Restore
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteForever(note.id)}
              >
                Delete Forever
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrashBin;
