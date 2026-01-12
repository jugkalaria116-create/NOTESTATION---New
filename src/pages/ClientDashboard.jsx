import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

function ClientDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [notes, setNotes] = useState(0);
  const [likes, setLikes] = useState(0);
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    const n = sessionStorage.getItem("name");
    const e = sessionStorage.getItem("email");
    const r = sessionStorage.getItem("role");

    if (!n || !e || r !== "client") {
      navigate("/login", { replace: true });
    } else {
      setName(n);
      setEmail(e);
    }
  }, [navigate]);

  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:5000/user/notes/${email}`)
      .then(res => res.json())
      .then(d => setNotes(d.totalNotes));

    fetch(`http://localhost:5000/user/likes/${email}`)
      .then(res => res.json())
      .then(d => setLikes(d.totalLikes));

    fetch(`http://localhost:5000/user/downloads/${email}`)
      .then(res => res.json())
      .then(d => setDownloads(d.totalDownloads));
  }, [email]);

  // const logout = () => {
  //   sessionStorage.clear();
  //   navigate("/login");
  // };

  return (
    <div className="client-dashboard">
      <aside className="client-sidebar">
        {/* <h2 className="brand">NoteStation</h2> */}

        <div className="profile">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <p>{name}</p>
        </div>

        <nav>
          {/* <NavLink to="/">🏠 Home</NavLink> */}
          <NavLink to="/notes">📚 Browse Notes</NavLink>
          <NavLink to="/upload">📤 Upload</NavLink>
          <NavLink to="/contact">🌐 Contact Us</NavLink>
          <NavLink to="/about">📘 About Us</NavLink>
        </nav>

        {/* <button className="logout-btn" onClick={logout}>Logout</button> */}
      </aside>

      <main className="client-main">
        <h1>Welcome, {name} 👋</h1>
        <p>{email}</p>

        <div className="stats">
          <div className="stat-card">📄 Your Notes<br /><span>{notes}</span></div>
          <div className="stat-card">❤️ Likes Received<br /><span>{likes}</span></div>
          <div className="stat-card">⬇️ Downloads<br /><span>{downloads}</span></div>
        </div>
      </main>
    </div>
  );
}

export default ClientDashboard;
