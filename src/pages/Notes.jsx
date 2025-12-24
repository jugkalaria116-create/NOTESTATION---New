import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);

  // 🔍 Advanced search states
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 📌 Get unique subjects for dropdown
  const subjects = ["all", ...new Set(notes.map(note => note.subject))];

  // 🧠 Advanced filtering logic
  const filteredNotes = notes
    .filter(note => {
      const textMatch =
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.description.toLowerCase().includes(searchText.toLowerCase());

      const subjectMatch =
        selectedSubject === "all" || note.subject === selectedSubject;

      return textMatch && subjectMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-wrap">
        <div className="container">
          <h1>All Notes</h1>

          {/* 🔍 Advanced Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub === "all" ? "All Subjects" : sub}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* 📄 Notes */}
          <div className="card-grid">
            {filteredNotes.length === 0 ? (
              <p>No matching notes found</p>
            ) : (
              filteredNotes.map((note) => (
                <div className="note-card" key={note.id}>
                  <h3>{note.title}</h3>
                  <p>{note.description}</p>
                  <p><b>Subject:</b> {note.subject}</p>
                  <p>
                    <b>Uploaded At:</b>{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </p>

                  {note.upload_file && (
                    <div className="note-actions">
                      <a
                        href={`http://localhost:5000/uploads/${note.upload_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        View
                      </a>
                      <a
                        href={`http://localhost:5000/uploads/${note.upload_file}`}
                        download
                        className="download-btn"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Notes;
