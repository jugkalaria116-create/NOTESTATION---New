import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
import "./Upload.css";

function Upload() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    email: ""
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !form.title || !form.subject || !form.email) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key =>
      formData.append(key, form[key])
    );
    formData.append("upload_file", file);

    const res = await fetch("http://localhost:5000/notes", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("✅ Note uploaded successfully");
      navigate("/notes");
    } else {
      alert("❌ Upload failed");
    }
  };

  return (
    <div className="upload-page-container">
      {/* <Navbar /> */}

      <div className="upload-content-wrap">
        <form className="upload-container" onSubmit={handleSubmit}>
          <h2 className="upload-title">Upload Your Notes</h2>

          <input
            name="title"
            placeholder="Note Title"
            className="upload-input"
            onChange={handleChange}
          />

          <input
            name="subject"
            placeholder="Subject"
            className="upload-input"
            onChange={handleChange}
          />

          <input
            type="file"
            accept=".pdf"
            className="upload-file"
            onChange={handleFileChange}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            className="upload-textarea"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="upload-input"
            onChange={handleChange}
          />
          <select
            name="visibility"
            className="upload-input"
            onChange={handleChange}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>


          <button className="submit-btn">Upload Note</button>
        </form>
      </div>

      {/* <Footer /> */}
    </div>
  );
}

export default Upload;
