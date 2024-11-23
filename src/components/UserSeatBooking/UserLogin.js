import React, { useState } from 'react';
import axios from 'axios';
import './UserLogin.scss'; // SCSS file for styling

const UserLogin = ({ setUserToken }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        mobile,
        password,
      });
      localStorage.setItem('user-token', res.data.token);
      setUserToken(res.data.token);
      window.location.href = '/show-booking';
    } catch (err) {
      alert('Invalid login credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>User Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
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

export default UserLogin;
