import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const userEmail = sessionStorage.getItem("email");

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/notes");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const subjects = ["all", ...new Set(notes.map((n) => n.subject))];

  const filteredNotes = notes
    .filter(
      (note) =>
        (note.title.toLowerCase().includes(searchText.toLowerCase()) ||
          note.description.toLowerCase().includes(searchText.toLowerCase())) &&
        (selectedSubject === "all" || note.subject === selectedSubject)
    )
    .sort((a, b) => {
      if (sortOrder === "liked")
        return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortOrder === "downloaded")
        return (b.downloads_count || 0) - (a.downloads_count || 0);
      if (sortOrder === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // ❤️ LIKE
  const likeNote = async (id) => {
    if (!id) return alert("Invalid note ID");
    if (!userEmail) return alert("Please login");

    await fetch(`http://localhost:5000/notes/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail }),
    });

    fetchNotes();
  };

  // ⬇️ DOWNLOAD
  const downloadNote = async (note) => {
    if (!note.id) return alert("Invalid note ID");
    if (!userEmail) return alert("Please login");

    await fetch(`http://localhost:5000/notes/${note.id}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail }),
    });

    window.open(note.url, "_blank");
    fetchNotes();
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-wrap">
        <div className="container">
          <h1>All Notes</h1>

          <div className="search-bar">
            <input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="liked">Most Liked</option>
              <option value="downloaded">Most Downloaded</option>
            </select>
          </div>

          <div className="card-grid">
            {filteredNotes.map((note) => (
              <div
                className="note-card"
                key={note.id ?? note.upload_file}
              >
                <h3>{note.title}</h3>
                <p>{note.description}</p>

                <p><b>Subject:</b> {note.subject}</p>

                <div className="note-stats">
                  ❤️ {note.likes_count || 0}
                  &nbsp;&nbsp;⬇️ {note.downloads_count || 0}
                </div>

                <div className="note-actions">
                  <button onClick={() => window.open(note.url, "_blank")}>
                    View
                  </button>
                  <button onClick={() => downloadNote(note)}>
                    Download
                  </button>
                  <button onClick={() => likeNote(note.id)}>
                    ❤️ Like
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Notes;
