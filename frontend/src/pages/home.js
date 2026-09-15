import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { AuthContext } from '../context/AuthContext';
import { tripAPI } from '../api';
import './home.css';

const INSPIRATION_DESTINATIONS = [
    {
        id: 'kyoto',
        title: 'Kyoto Cherry Blossoms',
        country: 'Japan 🇯🇵',
        tag: 'Cultural Hike',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
        desc: 'Explore ancient Torii gates, tea ceremonies, and serene bamboo groves.'
    },
    {
        id: 'amalfi',
        title: 'Amalfi Coast Drive',
        country: 'Italy 🇮🇹',
        tag: 'Coastal Escape',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
        desc: 'Cliffside villages, crystal clear waters, and authentic Mediterranean dining.'
    },
    {
        id: 'alps',
        title: 'Swiss Alps Expedition',
        country: 'Switzerland 🇨🇭',
        tag: 'Mountain Trail',
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
        desc: 'Breathtaking alpine vistas, scenic train routes, and luxury mountain lodges.'
    },
    {
        id: 'bali',
        title: 'Bali Sunset Retreat',
        country: 'Indonesia 🇮🇩',
        tag: 'Tropical Relaxation',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
        desc: 'Spiritual temples, lush rice terraces, and world-class surfing spots.'
    }
];

const CURRENCY_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.2,
    CAD: 1.36,
    AUD: 1.51,
    INR: 83.4
};

const INITIAL_PACKING = [
    { id: 1, text: 'Passport & Travel Visas', checked: true },
    { id: 2, text: 'Universal Power Adapter & Cables', checked: true },
    { id: 3, text: 'Emergency Cash & Credit Cards', checked: false },
    { id: 4, text: 'Travel Insurance Documents', checked: false },
    { id: 5, text: 'Noise-Canceling Headphones', checked: true },
    { id: 6, text: 'First Aid & Prescription Meds', checked: false }
];

const Home = () => {
    const navigate = useNavigate();
    const { role } = useContext(AuthContext);

    // Recent Trips State
    const [recentTrips, setRecentTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);

    // Currency Converter State
    const [amount, setAmount] = useState(100);
    const [fromCurr, setFromCurr] = useState('USD');
    const [toCurr, setToCurr] = useState('EUR');

    // Packing Checklist State
    const [packingList, setPackingList] = useState(INITIAL_PACKING);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await tripAPI.getTrips();
                setRecentTrips(res.data.slice(0, 3)); // show top 3
            } catch (err) {
                console.error('Error fetching recent trips:', err);
            } finally {
                setLoadingTrips(false);
            }
        };
        fetchTrips();
    }, []);

    // Conversion Calc
    const convertCurrency = () => {
        const inUSD = amount / (CURRENCY_RATES[fromCurr] || 1);
        const result = inUSD * (CURRENCY_RATES[toCurr] || 1);
        return result.toFixed(2);
    };

    // Toggle Packing Item
    const togglePacking = (id) => {
        setPackingList(prev =>
            prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
        );
    };

    return (
        <div className="home-container">
            <Navbar />

            {/* Hero Greeting Section */}
            <header className="home-hero">
                <div className="hero-content-wrapper">
                    <span className="welcome-pill">
                        <span className="pill-dot"></span> Active Travel Dashboard
                    </span>
                    <h1>Welcome Back, <span className="gradient-text">Traveler</span> ✈️</h1>
                    <p className="hero-subtext">
                        Your command center for upcoming adventures, budget tracking, and instant itinerary planning.
                    </p>
                </div>
            </header>

            <main className="home-main-content">
                {/* 4-Card Quick Action Hub */}
                <section className="action-hub-section">
                    <div className="section-title-box">
                        <h2>Quick Actions</h2>
                        <p>What would you like to build today?</p>
                    </div>

                    <div className="action-cards-grid">
                        <div className="action-card card-primary" onClick={() => navigate('/create-trip')}>
                            <div className="card-badge">Fast Track</div>
                            <div className="card-icon-box icon-cyan">✈️</div>
                            <h3>Create New Trip</h3>
                            <p>Plan a multi-destination itinerary with activities and custom budget caps.</p>
                            <span className="card-action-link">Get Started →</span>
                        </div>

                        <div className="action-card" onClick={() => navigate('/view-trips')}>
                            <div className="card-icon-box icon-blue">🗺️</div>
                            <h3>My Itineraries</h3>
                            <p>Browse, manage, edit, and organize all your saved journeys and trips.</p>
                            <span className="card-action-link">View Trips →</span>
                        </div>

                        <div className="action-card" onClick={() => navigate('/dashboard')}>
                            <div className="card-icon-box icon-purple">📊</div>
                            <h3>Budget Analytics</h3>
                            <p>Track spending across categories and compare planned vs actual expenses.</p>
                            <span className="card-action-link">View Stats →</span>
                        </div>

                        {role === 'admin' && (
                            <div className="action-card card-admin" onClick={() => navigate('/admin')}>
                                <div className="card-badge badge-admin">Admin Hub</div>
                                <div className="card-icon-box icon-pink">🛡️</div>
                                <h3>Admin Panel</h3>
                                <p>Manage users, system statistics, and global activity categories.</p>
                                <span className="card-action-link">Open Panel →</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Trips Live Widget */}
                <section className="recent-trips-section">
                    <div className="section-header-inline">
                        <div>
                            <h2>Recent Journeys</h2>
                            <p className="section-subtitle">Jump back into your active plans</p>
                        </div>
                        <button className="btn-secondary-sm" onClick={() => navigate('/view-trips')}>
                            View All ({recentTrips.length})
                        </button>
                    </div>

                    {loadingTrips ? (
                        <div className="home-loading">Loading recent trips...</div>
                    ) : recentTrips.length === 0 ? (
                        <div className="no-trips-banner">
                            <span className="empty-icon">📍</span>
                            <h3>No Active Trips Yet</h3>
                            <p>Start by creating your first trip itinerary!</p>
                            <button className="btn-primary-sm" onClick={() => navigate('/create-trip')}>
                                + Plan First Trip
                            </button>
                        </div>
                    ) : (
                        <div className="recent-trips-grid">
                            {recentTrips.map(trip => (
                                <div key={trip.id} className="recent-trip-card" onClick={() => navigate(`/trip/${trip.id}`)}>
                                    <div className="recent-trip-header">
                                        <h4>{trip.title}</h4>
                                        <span className="trip-currency-pill">{trip.currency}</span>
                                    </div>
                                    <p className="recent-trip-date">
                                        📅 {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                                    </p>
                                    {trip.description && (
                                        <p className="recent-trip-desc">{trip.description}</p>
                                    )}
                                    <div className="recent-trip-footer">
                                        <span className="dest-count">📍 {trip.destinations?.length || 0} Destinations</span>
                                        <span className="view-link">Open Details →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Travel Inspiration Showcase */}
                <section className="inspiration-section">
                    <div className="section-title-box">
                        <h2>Explore Travel Inspiration</h2>
                        <p>Need ideas? Pick a destination and start crafting your itinerary.</p>
                    </div>

                    <div className="inspiration-grid">
                        {INSPIRATION_DESTINATIONS.map(item => (
                            <div key={item.id} className="inspiration-card">
                                <div className="inspiration-img-wrapper">
                                    <img src={item.image} alt={item.title} />
                                    <span className="inspiration-tag">{item.tag}</span>
                                </div>
                                <div className="inspiration-body">
                                    <span className="country-label">{item.country}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                    <button 
                                        className="btn-inspiration-action"
                                        onClick={() => navigate('/create-trip')}
                                    >
                                        Plan This Journey ✨
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Smart Travel Utilities Section */}
                <section className="utilities-section">
                    <div className="section-title-box">
                        <h2>Smart Travel Toolkit</h2>
                        <p>Essential utilities for hassle-free journey planning.</p>
                    </div>

                    <div className="utilities-grid">
                        {/* Currency Converter Widget */}
                        <div className="utility-card">
                            <div className="utility-header">
                                <span className="utility-icon">💱</span>
                                <h3>Quick Currency Converter</h3>
                            </div>
                            <div className="converter-body">
                                <div className="converter-row">
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        min="1"
                                    />
                                    <select value={fromCurr} onChange={(e) => setFromCurr(e.target.value)}>
                                        {Object.keys(CURRENCY_RATES).map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="converter-equals font-bold">=</div >
                                <div className="converter-result-box">
                                    <span className="converted-val">{convertCurrency()}</span>
                                    <select value={toCurr} onChange={(e) => setToCurr(e.target.value)}>
                                        {Object.keys(CURRENCY_RATES).map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Packing Checklist */}
                        <div className="utility-card">
                            <div className="utility-header">
                                <span className="utility-icon">🎒</span>
                                <h3>Essential Packing Checklist</h3>
                            </div>
                            <div className="packing-list">
                                {packingList.map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`packing-item ${item.checked ? 'item-done' : ''}`}
                                        onClick={() => togglePacking(item.id)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={item.checked} 
                                            onChange={() => {}} // handled by div click
                                        />
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;