import React from "react";
import "./Aboutstand.css";

const sectionTitle = "Why NoteStation Stands Out";

const cards = [
  {
    title: "Peer Collaboration",
    text: "Students uplift each other through sharing notes."
  },
  {
    title: "Quality & Accuracy",
    text: "Each note is peer-reviewed for reliability."
  },
  {
    title: "Global Reach",
    text: "Connecting students worldwide."
  }
];

function Aboutstand() {
  return (
    <div className="aboutstand-container">
      <h2 className="aboutstand-title">{sectionTitle}</h2>

      <div className="aboutstand-card-row">
        {cards.map((card) => (
          <div key={card.title} className="aboutstand-card"> {/* ✅ FIXED */}
            <h3 className="aboutstand-card-title">{card.title}</h3>
            <p className="aboutstand-card-text">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Aboutstand;
