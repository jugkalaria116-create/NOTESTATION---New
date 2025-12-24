import React, { useEffect, useState } from "react";
import "./ViewMessages.css";

const ViewMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all messages
  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/contact-messages");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to fetch messages from server.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a message
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/admin/contact-messages/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setMessages(messages.filter((msg) => msg.id !== id));
      } else {
        alert("Failed to delete message.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting message.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p className="no-messages">Loading messages...</p>;
  if (error) return <p className="no-messages">{error}</p>;

  return (
    <div className="view-messages-container">
      <h2>📩 Contact Form Messages</h2>

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
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.id}</td>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td>{msg.subject}</td>
                <td>{msg.message}</td>
                <td>{new Date(msg.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(msg.id)}
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
