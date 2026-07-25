import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../api';
import Navbar from '../components/navbar';
import './tripsummary.css';

const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'INR', symbol: '₹' }
];

const TripSummary = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTrip();
    }, [tripId]);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const response = await tripAPI.getTrip(tripId);
            setTrip(response.data);
        } catch (err) {
            setError('Failed to load trip');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    if (loading) return (
        <div className="summary-page">
            <Navbar showBack backTo={`/trip/${tripId}`} backLabel="Back to Trip" />
            <div className="loading">Loading summary...</div>
        </div>
    );

    if (error) return (
        <div className="summary-page">
            <Navbar showBack backTo={`/trip/${tripId}`} backLabel="Back to Trip" />
            <div className="error-message">{error}</div>
        </div>
    );

    if (!trip) return null;

    const currencySymbol = CURRENCIES.find(c => c.code === trip.currency)?.symbol || '$';

    const allActivities = trip.destinations.flatMap(d => d.activities || []);
    const visitedActivities = allActivities.filter(a => a.visited);
    const foodActivities = visitedActivities.filter(a => a.category?.name === 'Food');

    const totalPlanned = allActivities.reduce((sum, a) => sum + (a.budgetPlanned || 0), 0);
    const totalActual = allActivities.reduce((sum, a) => sum + (a.budgetActual || 0), 0);

    const totalDestinations = trip.destinations.length;
    const visitedDestinations = trip.destinations.filter(d => d.visited).length;
    const percentVisited = allActivities.length > 0
        ? Math.round((visitedActivities.length / allActivities.length) * 100)
        : 0;

    const startDate = new Date(trip.startDate).toLocaleDateString();
    const endDate = new Date(trip.endDate).toLocaleDateString();

    const firstDestination = trip.destinations[0]?.name || 'Unknown';
    const lastDestination = trip.destinations[trip.destinations.length - 1]?.name || 'Unknown';

    return (
        <div className="summary-page">
            <Navbar showBack backTo={`/trip/${tripId}`} backLabel="Back to Trip" />

            <div className="summary-container">
                <div className="summary-actions no-print">
                    <button className="btn-download" onClick={handleDownload}>
                        📥 Download Summary
                    </button>
                </div>

                <div className="summary-card">
                    <div className="summary-header">
                        <h1>{trip.title}</h1>
                        <p className="summary-dates">{startDate} — {endDate}</p>
                        <p className="summary-journey">
                            Journey began in <strong>{firstDestination}</strong> and ended in <strong>{lastDestination}</strong>
                        </p>
                    </div>

                    <div className="summary-stats">
                        <div className="stat-box">
                            <span className="stat-value">{percentVisited}%</span>
                            <span className="stat-label">of plan visited</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{currencySymbol}{totalActual.toFixed(2)}</span>
                            <span className="stat-label">actual spend</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{currencySymbol}{totalPlanned.toFixed(2)}</span>
                            <span className="stat-label">planned budget</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{visitedDestinations}/{totalDestinations}</span>
                            <span className="stat-label">destinations visited</span>
                        </div>
                    </div>

                    {trip.description && (
                        <div className="summary-section">
                            <h3>About This Trip</h3>
                            <p>{trip.description}</p>
                        </div>
                    )}

                    <div className="summary-section">
                        <h3>What You Visited</h3>
                        {trip.destinations.map((dest) => {
                            const destVisitedActivities = (dest.activities || []).filter(a => a.visited);
                            if (destVisitedActivities.length === 0 && !dest.visited) return null;

                            return (
                                <div key={dest.id} className="summary-destination">
                                    <h4>{dest.name}</h4>
                                    {dest.images && dest.images.length > 0 && (
                                        <div className="summary-photos">
                                            {dest.images.map((img) => (
                                                <img
                                                    key={img.id}
                                                    src={`http://localhost:3000/uploads/${img.filename}`}
                                                    alt={dest.name}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {destVisitedActivities.length > 0 ? (
                                        <ul>
                                            {destVisitedActivities.map((act) => (
                                                <li key={act.id}>
                                                    {act.name}
                                                    {act.rating && <span className="rating"> {'★'.repeat(act.rating)}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-activities-visited">Visited, no specific activities logged</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {foodActivities.length > 0 && (
                        <div className="summary-section">
                            <h3>What You Ate</h3>
                            <ul>
                                {foodActivities.map((act) => (
                                    <li key={act.id}>{act.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {trip.notes && (
                        <div className="summary-section">
                            <h3>Notes & Memories</h3>
                            <p className="notes-text">{trip.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripSummary;