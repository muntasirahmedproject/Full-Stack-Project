import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateTrip = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const response = await tripAPI.createTrip(title, description, startDate, endDate, currency);
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

    return (
        <div className="create-trip-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            <div className="create-trip-container">
                <div className="create-trip-card">
                    <h2>Plan a New Trip</h2>
                    <p className="subtitle">Start with the basics — you can add destinations and activities next</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Trip Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Summer in Japan"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this trip about?"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Notes / Random Thoughts (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anything else on your mind about this trip..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="button-row">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/home')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Trip'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTrip;