import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI, destinationAPI, imageAPI, API_BASE_URL } from '../api';
import Navbar from '../components/navbar';
import './tripdetail.css';

const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' }
];

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [coverImages, setCoverImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingCover, setUploadingCover] = useState(false);

    const [showAddDestination, setShowAddDestination] = useState(false);
    const [destName, setDestName] = useState('');

    const [editingDestId, setEditingDestId] = useState(null);
    const [editDestName, setEditDestName] = useState('');
    const [editDestNotes, setEditDestNotes] = useState('');

    const [editingTrip, setEditingTrip] = useState(false);
    const [editTripTitle, setEditTripTitle] = useState('');
    const [editTripDescription, setEditTripDescription] = useState('');
    const [editTripNotes, setEditTripNotes] = useState('');
    const [editTripCurrency, setEditTripCurrency] = useState('USD');
    const [editTripStart, setEditTripStart] = useState('');
    const [editTripEnd, setEditTripEnd] = useState('');

    useEffect(() => {
        fetchTrip();
    }, [tripId]);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const response = await tripAPI.getTrip(tripId);
            setTrip(response.data);
            setCoverImages(response.data.images || []);
        } catch (err) {
            setError('Failed to load trip');
        } finally {
            setLoading(false);
        }
    };

    const isTripInFuture = () => {
        return new Date(trip.startDate) > new Date();
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingCover(true);
            const formData = new FormData();
            formData.append('image', file);
            formData.append('tripId', tripId);
            await imageAPI.upload(formData);
            fetchTrip();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload cover image');
        } finally {
            setUploadingCover(false);
            e.target.value = '';
        }
    };

    const handleDeleteCover = async (imageId) => {
        try {
            await imageAPI.deleteImage(imageId);
            fetchTrip();
        } catch (err) {
            setError('Failed to delete cover image');
        }
    };

    const handleToggleDestVisited = async (destId, currentVisited) => {
        try {
            await destinationAPI.updateDestination(destId, { visited: !currentVisited });
            fetchTrip();
        } catch (err) {
            setError('Failed to update destination');
        }
    };

    const handleAddDestination = async (e) => {
        e.preventDefault();
        if (!destName.trim()) return;

        try {
            const orderIndex = trip.destinations ? trip.destinations.length : 0;
            await destinationAPI.createDestination(tripId, destName, orderIndex);
            setDestName('');
            setShowAddDestination(false);
            fetchTrip();
        } catch (err) {
            setError('Failed to add destination');
        }
    };

    const startEditDestination = (dest) => {
        setEditingDestId(dest.id);
        setEditDestName(dest.name);
        setEditDestNotes(dest.notes || '');
    };

    const cancelEditDestination = () => {
        setEditingDestId(null);
    };

    const handleUpdateDestination = async (destId) => {
        try {
            await destinationAPI.updateDestination(destId, { name: editDestName, notes: editDestNotes });
            setEditingDestId(null);
            fetchTrip();
        } catch (err) {
            setError('Failed to update destination');
        }
    };

    const handleDeleteDestination = async (destId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this destination? All its activities will be deleted too. This cannot be undone.')) return;
        try {
            await destinationAPI.deleteDestination(destId);
            fetchTrip();
        } catch (err) {
            setError('Failed to delete destination');
        }
    };

    const startEditTrip = () => {
        setEditTripTitle(trip.title);
        setEditTripDescription(trip.description || '');
        setEditTripNotes(trip.notes || '');
        setEditTripCurrency(trip.currency || 'USD');
        setEditTripStart(new Date(trip.startDate).toISOString().split('T')[0]);
        setEditTripEnd(new Date(trip.endDate).toISOString().split('T')[0]);
        setEditingTrip(true);
    };

    const cancelEditTrip = () => {
        setEditingTrip(false);
    };

    const handleUpdateTrip = async (e) => {
        e.preventDefault();
        try {
            await tripAPI.updateTrip(tripId, {
                title: editTripTitle,
                description: editTripDescription,
                notes: editTripNotes,
                currency: editTripCurrency,
                startDate: editTripStart,
                endDate: editTripEnd
            });
            setEditingTrip(false);
            fetchTrip();
        } catch (err) {
            setError('Failed to update trip');
        }
    };

    if (loading) return (
        <div className="trip-detail-page">
            <Navbar showBack backTo="/view-trips" backLabel="Back to My Trips" />
            <div className="loading">Loading trip...</div>
        </div>
    );

    if (error) return (
        <div className="trip-detail-page">
            <Navbar showBack backTo="/view-trips" backLabel="Back to My Trips" />
            <div className="error-message">{error}</div>
        </div>
    );

    if (!trip) return null;

    const startDate = new Date(trip.startDate).toLocaleDateString();
    const endDate = new Date(trip.endDate).toLocaleDateString();
    const currencySymbol = CURRENCIES.find(c => c.code === trip.currency)?.symbol || '$';

    return (
        <div className="trip-detail-page">
            <Navbar showBack backTo="/view-trips" backLabel="Back to My Trips" />

            <div className="trip-detail-container">
                <button className="btn-summary" onClick={() => navigate(`/trip/${tripId}/summary`)}>
                    📖 View Trip Summary
                </button>

                <div className="cover-section">
                    {coverImages.length > 0 ? (
                        <div className="cover-image-wrapper">
                            <img
                                className="cover-image"
                                src={`${API_BASE_URL}/uploads/${coverImages[0].filename}`}
                                alt="Trip cover"
                            />
                            <button className="btn-delete-cover" onClick={() => handleDeleteCover(coverImages[0].id)}>
                                Remove Cover
                            </button>
                        </div>
                    ) : (
                        <label className="btn-upload-cover">
                            {uploadingCover ? 'Uploading...' : '🖼️ Add Cover Image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                disabled={uploadingCover}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>

                {editingTrip ? (
                    <form className="edit-trip-form" onSubmit={handleUpdateTrip}>
                        <div className="form-group">
                            <label>Trip Title</label>
                            <input
                                type="text"
                                value={editTripTitle}
                                onChange={(e) => setEditTripTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={editTripDescription}
                                onChange={(e) => setEditTripDescription(e.target.value)}
                                rows="2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes / Random Thoughts</label>
                            <textarea
                                value={editTripNotes}
                                onChange={(e) => setEditTripNotes(e.target.value)}
                                rows="2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select value={editTripCurrency} onChange={(e) => setEditTripCurrency(e.target.value)}>
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
                                    value={editTripStart}
                                    onChange={(e) => setEditTripStart(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={editTripEnd}
                                    onChange={(e) => setEditTripEnd(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="edit-actions">
                            <button type="button" className="btn-cancel-edit" onClick={cancelEditTrip}>Cancel</button>
                            <button type="submit" className="btn-save">Save Changes</button>
                        </div>
                    </form>
                ) : (
                    <div className="trip-detail-header">
                        <div className="trip-header-top">
                            <h2>{trip.title}</h2>
                            <button className="btn-edit-small" onClick={startEditTrip}>Edit Trip</button>
                        </div>
                        <p className="trip-detail-dates">{startDate} - {endDate}</p>
                        <p className="trip-currency-label">Currency: {trip.currency || 'USD'} ({currencySymbol})</p>
                        {trip.description && <p className="trip-detail-desc">{trip.description}</p>}
                        {trip.notes && (
                            <div className="trip-detail-notes">
                                <strong>Notes:</strong> {trip.notes}
                            </div>
                        )}
                    </div>
                )}

                <div className="destinations-section">
                    <div className="section-header">
                        <h3>Destinations</h3>
                        <button className="btn-add" onClick={() => setShowAddDestination(!showAddDestination)}>
                            + Add Destination
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {showAddDestination && (
                        <form className="add-destination-form" onSubmit={handleAddDestination}>
                            <input
                                type="text"
                                value={destName}
                                onChange={(e) => setDestName(e.target.value)}
                                placeholder="Destination name (e.g. Tokyo, Japan)"
                            />
                            <button type="submit" className="btn-save">Save</button>
                        </form>
                    )}

                    {trip.destinations && trip.destinations.length > 0 ? (
                        <div className="destinations-list">
                            {trip.destinations.map((dest) => (
                                <div key={dest.id} className="destination-card-wrapper">
                                    {editingDestId === dest.id ? (
                                        <div className="edit-destination-form" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editDestName}
                                                onChange={(e) => setEditDestName(e.target.value)}
                                                placeholder="Destination name"
                                            />
                                            <textarea
                                                value={editDestNotes}
                                                onChange={(e) => setEditDestNotes(e.target.value)}
                                                placeholder="Notes / thoughts about this place..."
                                                rows="2"
                                            />
                                            <div className="edit-dest-actions">
                                                <button className="btn-cancel-edit" onClick={cancelEditDestination}>Cancel</button>
                                                <button className="btn-save" onClick={() => handleUpdateDestination(dest.id)}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="destination-card"
                                            onClick={() => navigate(`/destination/${dest.id}`)}
                                        >
                                            <div className="dest-card-top">
                                                <h4>{dest.name}</h4>
                                                <div className="dest-card-actions" onClick={(e) => e.stopPropagation()}>
                                                    <button className="btn-edit-small" onClick={() => startEditDestination(dest)}>Edit</button>
                                                    <button className="btn-delete-small" onClick={(e) => handleDeleteDestination(dest.id, e)}>Delete</button>
                                                </div>
                                            </div>
                                            <p>{dest.activities ? dest.activities.length : 0} activities planned</p>
                                            {isTripInFuture() ? (
                                                <span className="future-badge" title="This trip hasn't started yet">
                                                    🕒 Upcoming
                                                </span>
                                            ) : (
                                                <label
                                                    className="visited-checkbox"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={dest.visited}
                                                        onChange={() => handleToggleDestVisited(dest.id, dest.visited)}
                                                    />
                                                    {dest.visited ? '✓ Visited' : 'Mark Visited'}
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-destinations">No destinations yet. Add your first one above.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripDetail;