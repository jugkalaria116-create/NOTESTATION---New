import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import "./ContactForm.css";

const contactDetails = [
  { icon: "📞", title: "Phone", info: "+91 98243 90618" },
  { icon: "✉️", title: "Email", info: "support@notestation.com" },
  { icon: "📍", title: "Location", info: "137, Silver Hub, Surat, Gujarat - 395010" },
  { icon: "⏰", title: "Timing", info: "Mon - Sat 1:00 PM - 6:00 PM" },
];

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const navigate = useNavigate(); // <-- Initialize navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate("/"); // <-- Redirect
        }, 2000);
      } else {
        setStatus("❌ Failed to send message. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("⚠️ Server error.");
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        {/* Left Column - Contact Details */}
        <div className="contact-details">
          <h2>CONTACT DETAILS</h2>
          <div className="details-grid">
            {contactDetails.map((item, index) => (
              <div className="detail-card" key={index}>
                <div className="detail-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.info}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="contact-form">
          <h2>SEND MESSAGE</h2>
          <form onSubmit={handleSubmit}>
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Write your Name"
              value={formData.name}
              onChange={handleChange}
              className="upload-input"
              required
            />

            <label>Your Email</label>
            <input
              type="email"
              name="email"
              placeholder="Write your Email Id"
              value={formData.email}
              onChange={handleChange}
              className="upload-input"
              required
            />

            <label>Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Write your subject"
              value={formData.subject}
              onChange={handleChange}
              className="upload-input"
              required
            />

            <label>Your Message</label>
            <textarea
              name="message"
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              className="upload-textarea"   // ✅ styled same as Upload description
              required
            />

            <button type="submit" className="submit-btn">Send Message</button>
          </form>

          {status && <p className="status-msg">{status}</p>}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
