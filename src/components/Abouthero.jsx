import React from 'react';
import './Abouthero.css';

const heading = "About NoteStation";
const subheading = "Explore how we empower students to learn, share insights, and collaborate globally.";
const backgroundImage = "url('your-background-image.jpg')"; // Replace with actual image path if needed

function Abouthero() {
  return (
    <div className="about-hero" style={{backgroundImage}}>
      <div className="about-hero-overlay">
        <h1 className="about-hero-title">{heading}</h1>
        <p className="about-hero-subtitle">{subheading}</p>
      </div>
    </div>
  );
}

export default Abouthero;
