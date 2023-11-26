import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/");
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/testmongodb", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users:", response.status);
      }
    } catch (error) {
      console.error("Error during fetchUsers:", error);
    }
  };

  const handleEditUser = (uuid) => {
    // Redirect to the edit user page, passing the user's UUID
    navigate(`/admin/editUser/${uuid}`);
  };

  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>User List:</h3>
      <ul>
        {users.map((user) => (
          <li key={user.uuid}>
            {user.username} - {user.email}{" "}
            <button onClick={() => handleEditUser(user.uuid)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
