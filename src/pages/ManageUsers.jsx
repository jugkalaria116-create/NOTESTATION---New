import React, { useState, useEffect } from "react";
import "./ManageUser.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from backend
  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users && Array.isArray(data.users)) {
          // if backend sends { users: [...] }
          setUsers(data.users);
        } else {
          console.error("Unexpected response format:", data);
          setUsers([]); // fallback to empty
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  // Delete user
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } else {
          alert("Failed to delete user");
        }
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="manage-users-page">
      <h1>Manage Users</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id || index}>
                <td>{index + 1}</td>
                <td>{user.fname || user.firstName}</td>
                <td>{user.lname || user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageUsers;
