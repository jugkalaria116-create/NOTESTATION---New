import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

      // ✅ DO NOT CLEAR STORAGE HERE
      // sessionStorage.clear(); ❌ REMOVE THIS

      // ✅ STORE USER INFO
      sessionStorage.setItem("role", "client");
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("name", data.name);

      // ✅ KEEP YOUR DASHBOARD ROUTE
      navigate("/client-dashboard");
    } catch {
      setError("Server not responding");
    }
  };

  return (
    <div className="page-container">
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

          <p className="register-link">
            Not registered?{" "}
            <Link to="/registers">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Logins;
