import React, { useEffect, useState } from "react";
import "./ManageUser.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;

    fetch(`http://localhost:5000/users/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    });
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
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.fname}</td>
                <td>{u.lname}</td>
                <td>{u.email}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(u.id)}
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
