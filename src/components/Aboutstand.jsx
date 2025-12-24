import React from 'react';
import './Aboutstand.css';

const sectionTitle = "Why NoteStation Stands Out";
const cards = [
  {
    title: "Peer Collaboration",
    text: "Students uplift each other through sharing your notes each other."
  },
  {
    title: "Quality & Accuracy",
    text: "Each note is peer-reviewed for reliability and accuracy."
  },
  {
    title: "Global Reach",
    text: "Connecting students worldwide in a collaborative community."
  }
];

function Aboutstand() {
  return (
    <div className="aboutstand-container">
      <h2 className="aboutstand-title">{sectionTitle}</h2>
      <div className="aboutstand-card-row">
        {cards.map((card, idx) => (
          <div key={idx} className="aboutstand-card">
            <h3 className="aboutstand-card-title">{card.title}</h3>
            <p className="aboutstand-card-text">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Aboutstand;
