import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ⚠️ For now UI-only (backend can be added later)
    if (!email) {
      setError("Please enter your registered email");
      return;
    }

    setMessage(
      "If this email is registered, a password reset link has been sent."
    );
    setEmail("");
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-wrap">
        <div className="forgot-page-container">
          <h2>Forgot Password</h2>
          <p className="info-text">
            Enter your registered email address. We’ll send you a reset link.
          </p>

          {error && <p className="error-msg">{error}</p>}
          {message && <p className="success-msg">{message}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>

            <p className="back-login">
              Remember your password?{" "}
              <Link to="/login">Back to Login</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ForgotPassword;
