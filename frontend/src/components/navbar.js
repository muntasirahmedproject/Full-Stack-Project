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
                    <span className="brand-icon">✈️</span> Trip<span className="gradient-text">Planner</span>
                </span>
                {showBack && (
                    <button className="navbar-back-btn" onClick={() => navigate(backTo || -1)}>
                        ← {backLabel || 'Back'}
                    </button>
                )}
            </div>

            {token && (
                <div className="navbar-right">
                    <button className="navbar-btn nav-btn-dash" onClick={() => navigate('/dashboard')}>
                        <span>📊 Dashboard</span>
                    </button>
                    {role === 'admin' && (
                        <button className="navbar-btn nav-btn-admin" onClick={() => navigate('/admin')}>
                            <span>🛡️ Admin Panel</span>
                        </button>
                    )}
                    <button className="navbar-btn logout" onClick={handleLogout}>
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;