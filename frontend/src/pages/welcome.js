import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcome.css';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-wrapper">
            {/* Ambient Background Glows */}
            <div className="glow-sphere sphere-1"></div>
            <div className="glow-sphere sphere-2"></div>
            <div className="glow-sphere sphere-3"></div>

            {/* Navigation Header */}
            <nav className="welcome-nav">
                <div className="nav-logo" onClick={() => navigate('/')}>
                    <span className="logo-icon">✈️</span>
                    <span className="logo-text">Trip<span className="gradient-text">Planner</span></span>
                </div>
                <div className="nav-actions">
                    <button className="nav-btn-link" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="nav-btn-primary" onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section">
                <div className="badge-container">
                    <span className="hero-badge">
                        <span className="badge-sparkle">✨</span> Next-Gen Trip Planning Platform
                    </span>
                </div>

                <h1 className="hero-title">
                    Plan Epic Journeys.<br />
                    <span className="gradient-text hero-highlight">Master Your Budget.</span>
                </h1>

                <p className="hero-description">
                    The ultra-fast, intuitive workspace for travelers. Build multi-stop itineraries, 
                    track live expenses, and preserve unforgettable travel memories—all in one place.
                </p>

                <div className="hero-cta-group">
                    <button className="btn-hero-primary" onClick={() => navigate('/register')}>
                        <span>Start Planning Free</span>
                        <span className="btn-arrow">→</span>
                    </button>
                    <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
                        <span>Sign In</span>
                    </button>
                </div>

                {/* Floating Highlights / Feature Tags */}
                <div className="floating-tags">
                    <div className="tag-chip chip-1">
                        <span className="chip-icon">🗺️</span> Smart Itineraries
                    </div>
                    <div className="tag-chip chip-2">
                        <span className="chip-icon">💸</span> Real-time Budgeting
                    </div>
                    <div className="tag-chip chip-3">
                        <span className="chip-icon">📸</span> Memory Vaults
                    </div>
                </div>
            </main>

            {/* Live Interactive Preview Card */}
            <section className="preview-section">
                <div className="glass-preview-card">
                    <div className="preview-header">
                        <div className="preview-dots">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="preview-title-bar">
                            🗼 Tokyo & Kyoto Adventure • 7 Days
                        </div>
                        <span className="preview-status-badge">Active Trip</span>
                    </div>

                    <div className="preview-body">
                        <div className="preview-timeline">
                            <div className="timeline-item completed">
                                <div className="timeline-icon">⛩️</div>
                                <div className="timeline-info">
                                    <h4>Fushimi Inari Shrine Visit</h4>
                                    <p>Kyoto • Morning Hike & Torii Gates</p>
                                </div>
                                <div className="timeline-tag tag-done">Done • $25</div>
                            </div>
                            <div className="timeline-item active">
                                <div className="timeline-icon">🚅</div>
                                <div className="timeline-info">
                                    <h4>Shinkansen Bullet Train</h4>
                                    <p>Kyoto → Tokyo • Reserved Seats</p>
                                </div>
                                <div className="timeline-tag tag-current">In Progress</div>
                            </div>
                            <div className="timeline-item upcoming">
                                <div className="timeline-icon">🍜</div>
                                <div className="timeline-info">
                                    <h4>Shibuya Ramen Tasting Tour</h4>
                                    <p>Tokyo • Evening Culinary Walk</p>
                                </div>
                                <div className="timeline-tag tag-next">Upcoming • $40</div>
                            </div>
                        </div>

                        <div className="preview-stats-panel">
                            <div className="stat-box">
                                <span className="stat-label">Total Budget</span>
                                <span className="stat-value">$1,850</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Spent</span>
                                <span className="stat-value stat-accent">$620</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Destinations</span>
                                <span className="stat-value">3 Cities</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="features-grid-section">
                <div className="section-heading">
                    <h2>Everything You Need for Perfect Journeys</h2>
                    <p>Designed for solo wanderers, group expeditions, and frequent flyers.</p>
                </div>

                <div className="cards-grid">
                    <div className="feature-card">
                        <div className="card-icon-wrapper icon-gradient-1">
                            <span>🗺️</span>
                        </div>
                        <h3>Multi-Stop Itineraries</h3>
                        <p>Organize complex trips with sequential destinations, activity timelines, and custom notes.</p>
                    </div>

                    <div className="feature-card">
                        <div className="card-icon-wrapper icon-gradient-2">
                            <span>📊</span>
                        </div>
                        <h3>Expense Tracker</h3>
                        <p>Keep costs under control. Compare target budgets against actual expenditures seamlessly.</p>
                    </div>

                    <div className="feature-card">
                        <div className="card-icon-wrapper icon-gradient-3">
                            <span>📷</span>
                        </div>
                        <h3>Memory Highlights</h3>
                        <p>Attach photos, memories, and personal ratings to every location you visit.</p>
                    </div>

                    <div className="feature-card">
                        <div className="card-icon-wrapper icon-gradient-4">
                            <span>⚡</span>
                        </div>
                        <h3>Instant Access</h3>
                        <p>Access your itinerary anytime on mobile, tablet, or desktop with instant cloud synchronization.</p>
                    </div>
                </div>
            </section>

            {/* Quick Metrics Bar */}
            <section className="metrics-banner">
                <div className="metric-item">
                    <span className="metric-number">10k+</span>
                    <span className="metric-desc">Trips Planned</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                    <span className="metric-number">50+</span>
                    <span className="metric-desc">Countries Covered</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                    <span className="metric-number">99.9%</span>
                    <span className="metric-desc">Travel Joy</span>
                </div>
            </section>

            {/* Call To Action Footer Banner */}
            <section className="cta-banner">
                <div className="cta-content">
                    <h2>Ready to embark on your next adventure?</h2>
                    <p>Join thousands of travelers crafting memorable journeys with TripPlanner today.</p>
                    <button className="btn-cta-large" onClick={() => navigate('/register')}>
                        Get Started Now — It's Free 🚀
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="welcome-footer">
                <p>© {new Date().getFullYear()} TripPlanner. Crafted for explorers worldwide.</p>
            </footer>
        </div>
    );
};

export default Welcome;