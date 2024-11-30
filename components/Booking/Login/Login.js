import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.scss'; // SCSS file for styling

const UserLogin = ({ setToken }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        phone_number: mobile,
        password,
      });

      setToken(res.data.token);
      window.location.href = '/show-booking';
    } catch (err) {  
      console.log("err", err);
          
      alert('Invalid login credentials');
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-box"]}>
        <h2>User Login</h2>
        <form onSubmit={handleLogin} className={styles["login-form"]}>
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
