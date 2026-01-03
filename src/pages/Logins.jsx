import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

function Logins() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ================= ADMIN LOGIN =================
    if (email === "admin@gmail.com" && password === "Admin@123") {
      sessionStorage.clear();
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("name", "Admin");
      navigate("/admin");
      return;
    }

    // ================= CLIENT LOGIN =================
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      sessionStorage.clear();
      sessionStorage.setItem("role", "client");
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("name", data.name);
      sessionStorage.setItem("userId", data.userId);

      navigate("/client-dashboard");
    } catch {
      setError("Server not responding");
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      {/* SAME STRUCTURE AS REGISTER */}
      <div className="login-page-container">
        <h2>Login</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          {/* SAME AS REGISTER */}
          <p className="register-link">
            Not registered?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Logins;
