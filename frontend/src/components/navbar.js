import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './navbar.css';

const Navbar = ({ showBack, backTo, backLabel }) => {
    const navigate = useNavigate();
    const { token, role, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="app-navbar">
            <div className="navbar-left">
                <span className="navbar-brand" onClick={() => navigate(token ? '/home' : '/')}>
                    TripPlanner
                </span>
                {showBack && (
                    <button className="navbar-back-btn" onClick={() => navigate(backTo || -1)}>
                        ← {backLabel || 'Back'}
                    </button>
                )}
            </div>

            {token && (
                <div className="navbar-right">
                    <button className="navbar-btn" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                    {role === 'admin' && (
                        <button className="navbar-btn" onClick={() => navigate('/admin')}>
                            Admin Panel
                        </button>
                    )}
                    <button className="navbar-btn logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;