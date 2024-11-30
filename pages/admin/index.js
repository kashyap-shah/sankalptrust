import { useEffect, useState } from 'react';
import Dashboard from 'components/Admin/Dashboard/Dashboard';
import Login from 'components/Admin/Login/Login';

export default function Admin() {
    const [adminToken, setAdminToken] = useState(null);

    useEffect(() => {
        // Only access localStorage in the client-side render
        const token = localStorage.getItem('token');
        if (token) {
            setAdminToken(token);
        }
    }, []); // Empty dependency array to run only on mount

    const handleSetToken = (token) => {
        localStorage.setItem('token', token);
        setAdminToken(token);
    };

    // if (adminToken === null) {
    //     // Return a loading state or just the Login component
    //     return <div>Loading...</div>;  // Avoid server mismatch by returning loading initially
    // }

    if (!adminToken) {
        return <Login setToken={handleSetToken} />;
    } else {
        return <Dashboard />;
    }
}
