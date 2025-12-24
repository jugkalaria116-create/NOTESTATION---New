import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>
            <span className="brand">Welcome to</span>{" "}
            <span className="brand">NoteStation</span>
          </h1>
          <p>
            Connect, collaborate and expand your understanding with a vibrant
            community of learners.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
