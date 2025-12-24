import React, { useState, useEffect } from "react";
import "./ManageNotes.css";

function ManageNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notes from backend
  useEffect(() => {
    fetch("http://localhost:5000/notes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else {
          console.error("Expected an array, got:", data);
          setNotes([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setNotes([]);
        setLoading(false);
      });
  }, []);

  // View note file in a new tab
  const handleView = (note) => {
    if (note.url) {
      window.open(note.url, "_blank");
    } else {
      alert("File not found");
    }
  };

  // Delete note
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    fetch(`http://localhost:5000/notes/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          setNotes(notes.filter((n) => n.id !== id));
          alert("Note deleted successfully!");
        } else {
          alert("Failed to delete note");
        }
      })
      .catch((err) => console.error("Error deleting note:", err));
  };

  if (loading) return <p>Loading notes...</p>;

  return (
    <div className="manage-notes-page">
      <h1>Manage Notes</h1>
      {notes.length === 0 ? (
        <p>No notes available.</p>
      ) : (
        <table className="notes-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note, index) => (
              <tr key={note.id}>
                <td>{index + 1}</td>
                <td>{note.title}</td>
                <td>{note.subject}</td>
                <td>{new Date(note.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-view"
                    onClick={() => handleView(note)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageNotes;
