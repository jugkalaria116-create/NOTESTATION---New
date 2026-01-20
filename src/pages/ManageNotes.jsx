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
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this note?"))
      return;

    const res = await fetch(
      `http://localhost:5000/notes/permanent/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin" }) // required
      }
    );

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setNotes((prev) => prev.filter((n) => n.id !== id));
    alert("Note permanently deleted");
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
