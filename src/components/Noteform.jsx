import React, { useState, useEffect } from "react";

function NoteForm({ note, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    upload_file: null,
  });

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title,
        description: note.description,
        subject: note.subject,
        upload_file: note.upload_file,
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("subject", form.subject);
    if (form.upload_file instanceof File) {
      formData.append("upload_file", form.upload_file);
    } else if (form.upload_file) {
      formData.append("upload_file", form.upload_file);
    }

    const url = note ? `http://localhost:5000/notes/${note._id}` : "http://localhost:5000/notes";
    const method = note ? "PUT" : "POST";

    await fetch(url, { method, body: formData });
    onSave();
    setForm({ title: "", description: "", subject: "", upload_file: null });
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
      <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description"></textarea>
      <input type="file" name="upload_file" onChange={handleChange} />
      <button type="submit">{note ? "Update Note" : "Add Note"}</button>
    </form>
  );
}

export default NoteForm;
