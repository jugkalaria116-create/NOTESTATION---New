import React from "react";
import "./Information.css";

const Information = () => {
  // Array storing card data
  const infoCards = [
    {
      icon: "📚",
      title: "Discover Vast Knowledge",
      description:
        "Dive into a rich library of notes on diverse subjects. Find exactly what you need.",
    },
    {
      icon: "⬆️",
      title: "Contribute & Empower",
      description:
        "Share your unique insights and help others grow. Your notes make a difference.",
    },
    {
      icon: "👩‍🎓",
      title: "Join a Thriving Community",
      description:
        "Connect with passionate learners, engage in discussions, and collaborate on projects.",
    },
  ];

  return (
    <section className="info-section">
      <h2 className="info-title">What You Can Do on NoteStation</h2>
      <div className="info-cards">
        {infoCards.map((card, index) => (
          <div className="info-card" key={index}>
            <div className="info-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Information;
