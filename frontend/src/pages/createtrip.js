import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tripAPI } from '../api';
import Navbar from '../components/navbar';
import './createtrip.css';

const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' }
];

const PRESET_TEMPLATES = [
    {
        name: '🌸 Tokyo & Kyoto Odyssey',
        title: 'Tokyo & Kyoto Cherry Blossom Safari',
        description: '7 days exploring bullet trains, ancient shrines, and neon cityscape dining.',
        budgetCap: 1800,
        currency: 'USD',
        daysOffset: 14,
        duration: 7,
        cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
    },
    {
        name: '🍷 Tuscan Villa Roadtrip',
        title: 'Tuscan Countryside & Amalfi Coast',
        description: '5 days driving through Florence vineyards and coastal Mediterranean cliffs.',
        budgetCap: 1500,
        currency: 'EUR',
        daysOffset: 21,
        duration: 5,
        cover: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'
    },
    {
        name: '❄️ Iceland Lights Tour',
        title: 'Iceland Ring Road & Glacier Trek',
        description: '6 days around waterfalls, black sand beaches, and geothermal hot springs.',
        budgetCap: 2200,
        currency: 'USD',
        daysOffset: 30,
        duration: 6,
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    },
    {
        name: '🏔️ Swiss Alps Express',
        title: 'Swiss Alps Mountain & Lakes Tour',
        description: '5 days riding scenic trains and hiking alpine trails in Lauterbrunnen.',
        budgetCap: 1600,
        currency: 'EUR',
        daysOffset: 10,
        duration: 5,
        cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    }
];

const CreateTrip = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [budgetCap, setBudgetCap] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [previewCover, setPreviewCover] = useState(PRESET_TEMPLATES[0].cover);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Read URL query params if user clicked template from another page
        const params = new URLSearchParams(location.search);
        const titleParam = params.get('title');
        if (titleParam) {
            const matchedTemplate = PRESET_TEMPLATES.find(t => t.title.toLowerCase().includes(titleParam.toLowerCase())) || PRESET_TEMPLATES[0];
            applyTemplate(matchedTemplate);
        } else {
            // Default dates to next week
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() + 7);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [location.search]);

    const applyTemplate = (template) => {
        setTitle(template.title);
        setDescription(template.description);
        setCurrency(template.currency);
        setBudgetCap(template.budgetCap);
        setPreviewCover(template.cover);

        const start = new Date();
        start.setDate(start.getDate() + template.daysOffset);
        const end = new Date(start);
        end.setDate(start.getDate() + (template.duration - 1));

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const calculateDuration = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 0;
    };

    const getCurrencySymbol = () => {
        const found = CURRENCIES.find(c => c.code === currency);
        return found ? found.symbol : '$';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !startDate || !endDate) {
            setError('Title, start date, and end date are required');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be before start date');
            return;
        }

        try {
            setLoading(true);
            const budgetVal = budgetCap ? parseFloat(budgetCap) : null;
            const response = await tripAPI.createTrip(title, description, startDate, endDate, currency, budgetVal);
            const newTripId = response.data.trip.id;

            if (notes) {
                await tripAPI.updateTrip(newTripId, { notes });
            }

            navigate(`/trip/${newTripId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create trip');
        } finally {
            setLoading(false);
        }
    };

    const durationDays = calculateDuration();
    const symbol = getCurrencySymbol();
    const numericBudget = parseFloat(budgetCap) || 0;

    return (
        <div className="create-trip-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            <div className="create-trip-studio">
                {/* Left Column: Form Controls */}
                <div className="studio-form-column">
                    <div className="form-header-box">
                        <h2>✨ Craft Your Next Journey</h2>
                        <p>Build a custom itinerary workspace with budget caps, travel dates, and currency defaults.</p>
                    </div>

                    {/* Quick Preset Template Chips */}
                    <div className="template-presets-section">
                        <label className="presets-label">⚡ Quick Presets (Click to autofill):</label>
                        <div className="presets-chips">
                            {PRESET_TEMPLATES.map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="preset-chip-btn"
                                    onClick={() => applyTemplate(tmpl)}
                                >
                                    {tmpl.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="studio-form">
                        <div className="form-group">
                            <label>Trip Title <span className="req-star">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Summer Expedition in Kyoto"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Short Overview / Story (optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is the goal or theme of this adventure?"
                                rows="3"
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Currency</label>
                                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Estimated Budget Cap ({symbol})</label>
                                <input
                                    type="number"
                                    value={budgetCap}
                                    onChange={(e) => setBudgetCap(e.target.value)}
                                    placeholder="e.g. 1500"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Start Date <span className="req-star">*</span></label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date <span className="req-star">*</span></label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notes & Packing Ideas (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Flight numbers, hotel reservations, or key places to visit..."
                                rows="3"
                            />
                        </div>

                        <div className="button-row">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/home')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Creating Workspace...' : '🚀 Launch Itinerary'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Live Preview & Insights Studio */}
                <div className="studio-preview-column">
                    <div className="preview-sticky-wrapper">
                        {/* Live Card Preview */}
                        <div className="preview-card-section">
                            <div className="preview-badge-bar">
                                <span className="live-pill">● LIVE PREVIEW</span>
                                {durationDays > 0 && <span className="duration-pill">{durationDays} Days Trip</span>}
                            </div>

                            <div className="live-preview-card">
                                <div className="preview-image-box">
                                    <img src={previewCover} alt="Trip Preview" />
                                    <span className="status-overlay">UPCOMING</span>
                                </div>
                                <div className="preview-card-body">
                                    <h3>{title || 'Your Adventure Title'}</h3>
                                    <p className="preview-dates">
                                        🗓️ {startDate ? new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Start Date'} – {endDate ? new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'End Date'}
                                    </p>
                                    <p className="preview-desc">
                                        {description || 'Your custom trip description will appear here as you type...'}
                                    </p>

                                    <div className="preview-footer">
                                        <span className="preview-chip">📍 0 Destinations</span>
                                        <span className="preview-chip chip-budget">
                                            💰 {symbol}{numericBudget ? numericBudget.toLocaleString() : '0'} Cap
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Budget Allocation Estimator */}
                        {numericBudget > 0 && (
                            <div className="budget-allocation-card">
                                <h4>📊 Recommended Budget Allocation</h4>
                                <p className="alloc-subtitle">Based on your {symbol}{numericBudget.toLocaleString()} target limit:</p>
                                <div className="alloc-bars">
                                    <div className="alloc-item">
                                        <span>🏨 Stays (40%): <strong>{symbol}{(numericBudget * 0.4).toFixed(0)}</strong></span>
                                        <div className="alloc-bar"><div className="alloc-fill fill-stays" style={{ width: '40%' }}></div></div>
                                    </div>
                                    <div className="alloc-item">
                                        <span>✈️ Transport (35%): <strong>{symbol}{(numericBudget * 0.35).toFixed(0)}</strong></span>
                                        <div className="alloc-bar"><div className="alloc-fill fill-transit" style={{ width: '35%' }}></div></div>
                                    </div>
                                    <div className="alloc-item">
                                        <span>🍽️ Dining (15%): <strong>{symbol}{(numericBudget * 0.15).toFixed(0)}</strong></span>
                                        <div className="alloc-bar"><div className="alloc-fill fill-food" style={{ width: '15%' }}></div></div>
                                    </div>
                                    <div className="alloc-item">
                                        <span>🎟️ Activities (10%): <strong>{symbol}{(numericBudget * 0.1).toFixed(0)}</strong></span>
                                        <div className="alloc-bar"><div className="alloc-fill fill-activity" style={{ width: '10%' }}></div></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pro Travel Tips Card */}
                        <div className="pro-tips-card">
                            <h4>💡 Pro Travel Tip</h4>
                            <p>Once created, you can attach photos, multi-stop destinations, daily activities, and download printable summary documents anytime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTrip;