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

  const subjects = ["all", ...new Set(notes.map(n => n.subject))];

  const filteredNotes = notes
    .filter(note =>
      (note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.description.toLowerCase().includes(searchText.toLowerCase())) &&
      (selectedSubject === "all" || note.subject === selectedSubject)
    )
    .sort((a, b) => {
      if (sortOrder === "liked") return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortOrder === "downloaded") return (b.downloads_count || 0) - (a.downloads_count || 0);
      if (sortOrder === "rated") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const likeNote = async (id) => {
    await fetch(`http://localhost:5000/notes/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    fetchNotes();
  };

  const rateNote = async (id, rating) => {
    await fetch(`http://localhost:5000/notes/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, rating }),
    });
    fetchNotes();
  };

  const downloadNote = async (id, url) => {
    await fetch(`http://localhost:5000/notes/${id}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    window.open(url, "_blank");
    fetchNotes();
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-wrap">
        <div className="container">
          <h1>All Notes</h1>

          {/* SEARCH BAR */}
          <div className="search-bar">
            <input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select onChange={(e) => setSelectedSubject(e.target.value)}>
              {subjects.map((s, i) => (
                <option key={i}>{s}</option>
              ))}
            </select>

            <select onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="liked">Most Liked</option>
              <option value="downloaded">Most Downloaded</option>
              <option value="rated">Top Rated</option>
            </select>
          </div>

          {/* NOTES */}
          <div className="card-grid">
            {filteredNotes.map(note => (
              <div className="note-card" key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.description}</p>
                <p><b>Subject:</b> {note.subject}</p>

                <div className="note-stats">
                  ❤️ {note.likes_count || 0}
                  &nbsp;⬇️ {note.downloads_count || 0}

                  <span className="rating-click">
                    ⭐ {note.avg_rating || "0.0"}
                    <div className="rating-popup">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} onClick={() => rateNote(note.id, star)}>
                          ★
                        </span>
                      ))}
                    </div>
                  </span>
                </div>

                <div className="note-actions">
                  <button onClick={() => window.open(note.url, "_blank")}>View</button>
                  <button onClick={() => downloadNote(note.id, note.url)}>Download</button>
                  <button onClick={() => likeNote(note.id)}>❤️ Like</button>
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
