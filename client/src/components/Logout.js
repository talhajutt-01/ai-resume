// LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });

            if (response.status === 200) {
                // Remove token from local storage if stored there
                localStorage.removeItem('token');

                // Redirect to login page
                navigate('/');
            } else {
                // Handle errors here
                alert('Logout failed.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
