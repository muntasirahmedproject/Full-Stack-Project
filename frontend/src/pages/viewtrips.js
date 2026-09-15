import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, API_BASE_URL } from '../api';
import Navbar from '../components/navbar';
import './viewtrips.css';

const DEFAULT_COVER_IMAGES = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
];

const ViewTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
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

        if (end < now) return { label: 'Completed', className: 'status-completed', key: 'completed' };
        if (start <= now && now <= end) return { label: 'Ongoing', className: 'status-ongoing', key: 'ongoing' };
        return { label: 'Upcoming', className: 'status-upcoming', key: 'upcoming' };
    };

    const handleDelete = async (tripId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this trip?')) {
            try {
                await tripAPI.deleteTrip(tripId);
                setTrips(trips.filter(t => t.id !== tripId));
            } catch (err) {
                setError('Failed to delete trip');
            }
        }
    };

    // Calculate metrics
    const stats = {
        total: trips.length,
        upcoming: trips.filter(t => getTripStatus(t).key === 'upcoming').length,
        ongoing: trips.filter(t => getTripStatus(t).key === 'ongoing').length,
        completed: trips.filter(t => getTripStatus(t).key === 'completed').length,
    };

    // Find next upcoming trip for countdown hero
    const upcomingTripsSorted = trips
        .filter(t => getTripStatus(t).key === 'upcoming')
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const nextTrip = upcomingTripsSorted.length > 0 ? upcomingTripsSorted[0] : null;

    const calculateDaysLeft = (startDateStr) => {
        const now = new Date();
        const start = new Date(startDateStr);
        const diffTime = start - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Starts today!';
        return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    };

    // Filter trips
    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const statusKey = getTripStatus(trip).key;
        const matchesFilter = statusFilter === 'all' || statusKey === statusFilter;

        return matchesSearch && matchesFilter;
    });

    const handleCreateWithTemplate = (templateTitle) => {
        navigate(`/create-trip?title=${encodeURIComponent(templateTitle)}`);
    };

    return (
        <div className="view-trips-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            <div className="view-trips-container">
                {/* Hero Header */}
                <div className="trips-hero-header">
                    <div className="hero-text">
                        <h2>My Expeditions & Itineraries</h2>
                        <p>Manage your active journeys, review past travel memories, and map out your next adventure.</p>
                    </div>
                    <button className="btn-create-hero" onClick={() => navigate('/create-trip')}>
                        + Plan New Journey
                    </button>
                </div>

                {/* Top Metrics Row */}
                <div className="trips-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-value">{stats.total}</span>
                        <span className="metric-label">Total Trips</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-value value-upcoming">{stats.upcoming}</span>
                        <span className="metric-label">Upcoming</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-value value-ongoing">{stats.ongoing}</span>
                        <span className="metric-label">Ongoing</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-value value-completed">{stats.completed}</span>
                        <span className="metric-label">Completed</span>
                    </div>
                </div>

                {/* Next Trip Countdown Banner */}
                {nextTrip && (
                    <div className="next-trip-banner" onClick={() => navigate(`/trip/${nextTrip.id}`)}>
                        <div className="banner-badge">✈️ Next Up</div>
                        <div className="banner-content">
                            <h3>{nextTrip.title}</h3>
                            <p>Starts on {new Date(nextTrip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="banner-countdown">
                            <span className="countdown-pill">{calculateDaysLeft(nextTrip.startDate)}</span>
                            <span className="banner-arrow">View Details →</span>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="trips-filter-bar">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search itineraries or destinations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                        )}
                    </div>

                    <div className="filter-pills">
                        <button
                            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({trips.length})
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('upcoming')}
                        >
                            Upcoming ({stats.upcoming})
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'ongoing' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('ongoing')}
                        >
                            Ongoing ({stats.ongoing})
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('completed')}
                        >
                            Completed ({stats.completed})
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Trips Grid */}
                {loading ? (
                    <div className="loading">Loading your itineraries...</div>
                ) : filteredTrips.length > 0 ? (
                    <div className="trips-grid">
                        {filteredTrips.map((trip, idx) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                fallbackImage={DEFAULT_COVER_IMAGES[idx % DEFAULT_COVER_IMAGES.length]}
                                onView={() => navigate(`/trip/${trip.id}`)}
                                onSummary={(e) => { e.stopPropagation(); navigate(`/trip/${trip.id}/summary`); }}
                                onDelete={(e) => handleDelete(trip.id, e)}
                                status={getTripStatus(trip)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-trips-card">
                        <div className="no-trips-icon">🗺️</div>
                        <h3>No trips found</h3>
                        <p>{searchQuery ? 'Try adjusting your search terms or filter selection.' : 'You haven’t created any itineraries yet. Get started now!'}</p>
                        <button className="btn-create-hero" onClick={() => navigate('/create-trip')}>
                            + Create First Trip
                        </button>
                    </div>
                )}

                {/* Quick Trip Templates Showcase */}
                <div className="templates-showcase">
                    <div className="templates-header">
                        <h3>💡 Quick Trip Starters</h3>
                        <p>Inspiration for your next itinerary. Click to jumpstart planning.</p>
                    </div>
                    <div className="templates-grid">
                        <div className="template-card" onClick={() => handleCreateWithTemplate('Tokyo & Kyoto 7-Day Discovery')}>
                            <div className="template-badge">7 Days</div>
                            <h4>Tokyo & Kyoto Discovery</h4>
                            <p>Explore bullet trains, ancient shrines, and neon cityscape dining.</p>
                            <span className="template-action">Use Template →</span>
                        </div>
                        <div className="template-card" onClick={() => handleCreateWithTemplate('Amalfi Coast & Rome Getaway')}>
                            <div className="template-badge">5 Days</div>
                            <h4>Amalfi Coast & Rome Getaway</h4>
                            <p>Cliffside villas, Mediterranean beaches, and historic Roman sights.</p>
                            <span className="template-action">Use Template →</span>
                        </div>
                        <div className="template-card" onClick={() => handleCreateWithTemplate('Swiss Alps Glacier Express')}>
                            <div className="template-badge">6 Days</div>
                            <h4>Swiss Alps Glacier Express</h4>
                            <p>Alpine lakes, scenic mountain trains, and breathtaking hiking trails.</p>
                            <span className="template-action">Use Template →</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TripCard = ({ trip, fallbackImage, onView, onSummary, onDelete, status }) => {
    const startDate = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const coverImage = trip.images && trip.images.length > 0 ? `${API_BASE_URL}/uploads/${trip.images[0].filename}` : fallbackImage;
    
    // Calculate duration in days
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const destCount = trip.destinations ? trip.destinations.length : 0;

    return (
        <div className="trip-card" onClick={onView}>
            <div className="trip-card-cover-container">
                <img
                    className="trip-card-cover"
                    src={coverImage}
                    alt={trip.title}
                    onError={(e) => { e.target.src = fallbackImage; }}
                />
                <span className={`status-badge-overlay ${status.className}`}>{status.label}</span>
                <button className="btn-card-delete" onClick={onDelete} title="Delete Trip">🗑️</button>
            </div>

            <div className="trip-card-body">
                <h4 className="trip-card-title">{trip.title}</h4>
                <p className="trip-card-dates">🗓️ {startDate} – {endDate} <span className="duration-pill">{durationDays}d</span></p>

                {trip.description && <p className="trip-card-desc">{trip.description}</p>}

                <div className="trip-card-footer">
                    <div className="card-metrics-chips">
                        {destCount > 0 && <span className="metric-chip">📍 {destCount} Dest</span>}
                        {trip.budget && <span className="metric-chip">💰 ${trip.budget}</span>}
                    </div>

                    <div className="card-action-btns">
                        <button className="btn-card-summary" onClick={onSummary} title="View Summary Document">📄 Summary</button>
                        <button className="btn-card-view" onClick={onView}>Details →</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTrips;