import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

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

        setTimeout(() => navigate("/"), 2000);
      } else {
        setStatus("❌ Failed to send message.");
      }
    } catch {
      setStatus("⚠️ Server error.");
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">

        {/* LEFT */}
        <div className="contact-details">
          <h2>CONTACT DETAILS</h2>

          <div className="details-grid">
            {contactDetails.map((item) => (
              <div className="detail-card" key={item.title}> {/* ✅ FIXED */}
                <div className="detail-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.info}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="contact-form">
          <h2>SEND MESSAGE</h2>

          <form onSubmit={handleSubmit}>
            <label>Your Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />

            <label>Your Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />

            <label>Subject</label>
            <input name="subject" value={formData.subject} onChange={handleChange} required />

            <label>Your Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required />

            <button type="submit">Send Message</button>
          </form>

          {status && <p>{status}</p>}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
