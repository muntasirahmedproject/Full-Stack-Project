import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcome.css';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h1>TripPlanner</h1>
                <p className="welcome-subtitle">Plan Your Journey, Preserve Your Memories</p>

                <div className="welcome-description">
                    <p>
                        TripPlanner is your all-in-one travel companion. Plan multi-destination trips with detailed itineraries,
                        track your spending, and create lasting memories of every journey you take.
                    </p>
                </div>

                <div className="welcome-features">
                    <div className="feature">
                        <h3>📍 Plan Itineraries</h3>
                        <p>Create detailed trips with multiple destinations and activities</p>
                    </div>
                    <div className="feature">
                        <h3>💰 Track Spending</h3>
                        <p>Budget per activity and compare planned vs actual costs</p>
                    </div>
                    <div className="feature">
                        <h3>📸 Capture Memories</h3>
                        <p>Add photos and notes to preserve your travel stories</p>
                    </div>
                </div>

                <div className="welcome-buttons">
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/register')}>
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;