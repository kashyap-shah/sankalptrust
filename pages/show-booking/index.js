import Dashboard from 'components/Booking/Dashboard/Dashboard';
import UserLogin from 'components/Booking/Login/Login';
import { useEffect, useState } from 'react';

export default function Admin() {
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        // Only access localStorage in the client-side render
        const token = localStorage.getItem('user-token');
        if (token) {
            setUserToken(token);
        }
    }, []); // Empty dependency array to run only on mount

    const handleSetToken = (token) => {
        localStorage.setItem('user-token', token);
        setUserToken(token);
    };

    // if (userToken === null) {
    //     // Return a loading state or just the Login component
    //     return <div>Loading...</div>;  // Avoid server mismatch by returning loading initially
    // }

    if (!userToken) {
        return <UserLogin setToken={handleSetToken} />;
    } else {
        return <Dashboard />;
    }
}
