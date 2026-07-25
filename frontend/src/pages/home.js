import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import './home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <Navbar />

            <div className="home-content">
                <h2>Welcome to TripPlanner!</h2>
                <p className="subtitle">What would you like to do?</p>

                <div className="home-cards">
                    <div className="card" onClick={() => navigate('/create-trip')}>
                        <div className="card-icon">✈️</div>
                        <h3>Create a New Trip</h3>
                        <p>Plan a new journey with destinations and activities</p>
                    </div>

                    <div className="card" onClick={() => navigate('/view-trips')}>
                        <div className="card-icon">📋</div>
                        <h3>View My Trips</h3>
                        <p>View all your planned and past trips</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;