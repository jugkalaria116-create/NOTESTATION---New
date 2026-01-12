import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-text">
          NOTESTATION
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <Link to={role ? "/notes" : "/login"}>Browse Notes</Link>
        </li>

        {role === "client" && (
          <li>
            <Link to="/upload">Upload Notes</Link>
          </li>
        )}

        <li>
          <Link to="/contact">Contact</Link>
        </li>

        <li>
          <Link to="/about">About Us</Link>
        </li>
      </ul>

      <div className="login-btn">
        {!role ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            {role === "client" && (
              <Link to="/client-dashboard">Dashboard</Link>
            )}
            {role === "admin" && (
              <Link to="/admin">Admin</Link>
            )}
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
