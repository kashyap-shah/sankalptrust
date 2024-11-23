import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.scss'; // SCSS file for styling

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password,
      });
      setToken(res.data);
      localStorage.setItem('token', res.data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data}`;
      alert('Login successful!');
      window.location.href = '/admin';
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit} className="admin-login-form">
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
