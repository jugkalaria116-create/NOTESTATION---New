import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import this
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Registers.css";

function Registers() {
  const navigate = useNavigate(); // <-- initialize navigate
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setMessage({ text: "All fields are required!", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }

    // Send registration request to backend
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fname: firstName,
          lname: lastName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: data.message, type: "success" });

        // Redirect to home page after 1 second
        setTimeout(() => {
          navigate("/"); // <-- redirect to home
        }, 1000);
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error!", type: "error" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-page-container">
        <h2>Register</h2>

        {message.text && (
          <p className={message.type === "error" ? "error-msg" : "success-msg"}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit">Register</button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Registers;
