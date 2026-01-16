import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* <div className="footer-container"> */}

        {/* Brand */}
        <div className="footer-brand">
          <h2>NoteStation</h2>
          <p>Share • Learn • Grow</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/notes">Browse Notes</a>
          <a href="/upload">Upload Notes</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>

        {/* Resources */}
        {/* <div className="footer-links">
          <h4>Resources</h4>
          <a href="#">Engineering Notes</a>
          <a href="#">Computer Science</a>
          <a href="#">Semester-wise Notes</a>
          <a href="#">Exam Preparation</a>
        </div>
      </div> */}

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 NoteStation. All rights reserved | Made for learners, by learners.</p>
      </div>
    </footer>
  );
};

export default Footer;
