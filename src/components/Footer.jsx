import React from "react";
import "./Footer.css";

const Footer = () => {


  // Array of copyright content
  const copyrightContent = [
    "© 2025 NoteStation. All rights reserved | Made for learners, by learners.",
  ];

  return (
    <footer className="footer">


      {/* Copyright Section */}
      {copyrightContent.map((text, index) => (
        <div className="footer-bottom" key={index}>
          <p>{text}</p>
        </div>
      ))}
    </footer>
  );
};

export default Footer;
