import React, { useState } from "react";
import axios from "axios";
import styles from "./Login.module.scss";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/admin/login",
        { username, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: false }
      );
  
      const { token } = res.data; // Extract token from response
      setToken(token);
      localStorage.setItem("token", token);
  
      alert("Login successful!");
      window.location.href = "/admin";
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed. Please check your credentials.");
    }
  };
  
  return (
    <div className={styles["admin-login-container"]}>
      <div className={styles["admin-login-box"]}>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit} className={styles["admin-login-form"]}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
