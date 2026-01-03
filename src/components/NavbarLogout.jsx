import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link className="logo-text">
          NOTESTATION
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/notes">Browse Notes</Link>
        </li>
        <li>
          <Link to="/upload">Upload Notes</Link>
        </li>
        <li>
          <Link to="/registers">Register</Link>
        </li>
        <li>
           <Link to="/login">Contact</Link>
        </li>
        <li>
          <Link to="/about">About Us</Link>
        </li>
      </ul>

      {/* Login Button */}
      <div className="login-btn">
        <Link to="/client-dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;
