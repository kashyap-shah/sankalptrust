import React, { useState } from 'react';
import styles from './Dashboard.module.scss'; // Import the SCSS file
import Shows from '../Shows/Shows';
import Users from '../Users/Users';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('shows');

  const renderView = () => {
    switch (currentView) {
      case 'shows':
        return <Shows />;
      case 'users':
        return <Users />;
      default:
        return <Shows />;
    }
  };

  return (
    <div className={styles["dashboard-container"]}>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li 
            onClick={() => setCurrentView('shows')} 
            className={styles[currentView === 'shows' ? 'active' : '']}
          >
            Shows
          </li>
          <li 
            onClick={() => setCurrentView('users')} 
            className={styles[currentView === 'users' ? 'active' : '']}
          >
            Users
          </li>
        </ul>
      </nav>
      <div className={styles["component-wrapper"]}>
        {renderView()}
      </div>
    </div>
  );
};

export default Dashboard;
