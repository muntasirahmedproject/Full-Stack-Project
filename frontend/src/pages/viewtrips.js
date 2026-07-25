import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, API_BASE_URL } from '../api';
import Navbar from '../components/navbar';
import './viewtrips.css';

const ViewTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await tripAPI.getTrips();
            setTrips(response.data);
        } catch (err) {
            setError('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const getTripStatus = (trip) => {
        const now = new Date();
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);

        if (end < now) return { label: 'Completed', className: 'status-completed' };
        if (start <= now && now <= end) return { label: 'Ongoing', className: 'status-ongoing' };
        return { label: 'Upcoming', className: 'status-upcoming' };
    };

    const categorizeTrips = () => {
        const now = new Date();
        const upcoming = [];
        const current = [];
        const previous = [];

        trips.forEach(trip => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);

            if (end < now) {
                previous.push(trip);
            } else if (start <= now && now <= end) {
                current.push(trip);
            } else {
                upcoming.push(trip);
            }
        });

        return { upcoming, current, previous };
    };

    const handleDelete = async (tripId) => {
        if (window.confirm('Are you sure you want to delete this trip?')) {
            try {
                await tripAPI.deleteTrip(tripId);
                setTrips(trips.filter(t => t.id !== tripId));
            } catch (err) {
                setError('Failed to delete trip');
            }
        }
    };

    const { upcoming, current, previous } = categorizeTrips();

    return (
        <div className="view-trips-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            {loading ? (
                <div className="loading">Loading trips...</div>
            ) : (
                <div className="view-trips-container">
                    <div className="trips-header">
                        <h2>My Trips</h2>
                        <button className="btn-create" onClick={() => navigate('/create-trip')}>
                            + Create New Trip
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {current.length > 0 && (
                        <div className="trips-section">
                            <h3>🌍 Current Trip</h3>
                            <div className="trips-grid">
                                {current.map(trip => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onView={() => navigate(`/trip/${trip.id}`)}
                                        onDelete={() => handleDelete(trip.id)}
                                        status={getTripStatus(trip)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <div className="trips-section">
                            <h3>✈️ Upcoming Trips</h3>
                            <div className="trips-grid">
                                {upcoming.map(trip => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onView={() => navigate(`/trip/${trip.id}`)}
                                        onDelete={() => handleDelete(trip.id)}
                                        status={getTripStatus(trip)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {previous.length > 0 && (
                        <div className="trips-section">
                            <h3>📸 Past Trips</h3>
                            <div className="trips-grid">
                                {previous.map(trip => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onView={() => navigate(`/trip/${trip.id}`)}
                                        onDelete={() => handleDelete(trip.id)}
                                        status={getTripStatus(trip)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {trips.length === 0 && (
                        <div className="no-trips">
                            <p>No trips yet. Create one to get started!</p>
                            <button className="btn-create" onClick={() => navigate('/create-trip')}>
                                Create Your First Trip
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TripCard = ({ trip, onView, onDelete, status }) => {
    const startDate = new Date(trip.startDate).toLocaleDateString();
    const endDate = new Date(trip.endDate).toLocaleDateString();
    const coverImage = trip.images && trip.images.length > 0 ? trip.images[0] : null;

    return (
        <div className="trip-card">
            {coverImage && (
                <img
                    className="trip-card-cover"
                    src={`${API_BASE_URL}/uploads/${coverImage.filename}`}
                    alt={trip.title}
                />
            )}
            <div className="trip-card-body">
                <div className="trip-header">
                    <h4>{trip.title}</h4>
                    <button className="btn-delete" onClick={onDelete}>×</button>
                </div>
                <span className={`status-badge ${status.className}`}>{status.label}</span>
                <p className="trip-dates">{startDate} - {endDate}</p>
                {trip.description && <p className="trip-desc">{trip.description}</p>}
                <button className="btn-view" onClick={onView}>View Details</button>
            </div>
        </div>
    );
};

export default ViewTrips;