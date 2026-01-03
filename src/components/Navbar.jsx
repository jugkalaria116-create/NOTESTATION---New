import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" className="logo-text">
          NOTESTATION
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/login">Browse Notes</Link>
        </li>
        <li>
          <Link to="/login">Upload Notes</Link>
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
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
