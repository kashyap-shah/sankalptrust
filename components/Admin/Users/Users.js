import React, { useEffect, useState } from "react";
import styles from "./Users.module.scss"; // Import SCSS for Users
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [changePassword, setChangePassword] = useState(""); // New state for change password
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users", 
        {
        headers: { "auth-token": localStorage.getItem("token") },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message before submitting

    try {
      if (userId) {
        // For editing, only send password if changePassword has a value
        const updatedData = {
          username,
          phone_number: phoneNumber,
        };
        if (changePassword) {
          updatedData.password = changePassword; // Only send password if it's being changed
        }

        try {
          await axios.put(
            `/api/users/${userId}`,
            updatedData,
            {
              headers: { "auth-token": localStorage.getItem("token") },
            }
          );
        } catch (error) {
          alert("Something went wrong.")
        }
        setUserId(null); // Clear userId after updating
      } else {
        // For adding a new user, password is required
        try {
          await axios.post(
            "/api/users",
            { username, password: changePassword, phone_number: phoneNumber },
            {
              headers: { "auth-token": localStorage.getItem("token") },
            }
          );
        } catch (error) {
          alert("Invalid value. Please check if phone number already exists.");
        }
      }

      setUsername("");
      setChangePassword(""); // Clear the change password field
      setPhoneNumber("");
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.response.data); // Set the error message from the response
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setUsername(user.username);
    setPhoneNumber(user.phone_number);
    setChangePassword(""); // Clear the change password field during edit
    setUserId(user.id);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`, 
        {
        headers: { "auth-token": localStorage.getItem("token") },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles["users-container"]}>
      <h1>Registered Users</h1>
      {users?.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <div className={styles["user-details"]}>
                {user.username} - {user.phone_number}
              </div>
              <div className={styles["user-actions"]}>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span>No data available</span>
      )}

      <hr />

      <h1>{userId ? "Edit User" : "Add User"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        {userId ? (
          <input
            type="password"
            value={changePassword}
            onChange={(e) => setChangePassword(e.target.value)}
            placeholder="Enter new password (leave blank to keep current)"
          />
        ) : (
          <input
            type="password"
            value={changePassword}
            onChange={(e) => setChangePassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        )}
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          required
        />
        <button type="submit">{userId ? "Update User" : "Add User"}</button>
      </form>

      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
};

export default Users;
