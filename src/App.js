import React, { useState } from 'react';
import Login from './components/Admin/Login';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import UserLogin from './components/UserSeatBooking/UserLogin';
import BookingPage from './components/UserSeatBooking/BookingPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userToken, setUserToken] = useState(localStorage.getItem('user-token') || '');

  // Determine if the URL path includes /admin
  const isAdminPath = window.location.pathname.includes('/admin');
  const isUserShowBookingPath = window.location.pathname.includes('/show-booking');
  

  if (isAdminPath) {
    // Check for authentication
    if (!token) {
      return <Login setToken={setToken} />
    }
    return <Dashboard />;
  }

  if (isUserShowBookingPath) {
    // Check for authentication
    if (!userToken) {
      return <UserLogin setUserToken={setUserToken} />
    }
    return <BookingPage />;
  }

  return (
    <>Page Not Found</>
  );
}

export default App;
