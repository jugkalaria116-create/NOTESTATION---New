import React, { useEffect, useState } from "react";
import "./ViewMessages.css";

const ViewMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH MESSAGES =================
  useEffect(() => {
    fetch("http://localhost:5000/admin/contact-messages")
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => {
        setError("⚠️ Failed to fetch messages from server.");
        setLoading(false);
      });
  }, []);

  // ================= DELETE MESSAGE =================
  const handleDelete = (id) => {
    if (!window.confirm("Delete this message?")) return;

    fetch(`http://localhost:5000/admin/contact-messages/${id}`, {
      method: "DELETE",
    }).then(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });
  };

  // ================= UI STATES =================
  if (loading) return <p className="no-messages">Loading...</p>;
  if (error) return <p className="no-messages">{error}</p>;

  return (
    <div className="view-messages-container">
      <h2>📩 Contact Messages</h2>

      {messages.length === 0 ? (
        <p className="no-messages">No messages found</p>
      ) : (
        <table className="messages-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {messages.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.subject}</td>
                <td>{m.message}</td>

                {/* ✅ FIXED DATE */}
                <td>
                  {m.date
                    ? new Date(m.date).toLocaleString()
                    : "—"}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(m.id)}
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewMessages;
  