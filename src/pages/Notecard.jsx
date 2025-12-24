import React from "react";

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p><strong>Subject:</strong> {note.subject}</p>
      <p>{note.description}</p>
      {note.upload_file && (
        <a href={`http://localhost:5000/uploads/${note.upload_file}`} target="_blank" rel="noreferrer">
          📎 View File
        </a>
      )}
      <div className="actions">
        <button onClick={onEdit}>✏️ Edit</button>
        <button onClick={onDelete}>🗑️ Delete</button>
      </div>
    </div>
  );
}

export default NoteCard;
