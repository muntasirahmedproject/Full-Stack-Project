import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { destinationAPI, activityAPI, categoryAPI, imageAPI } from '../api';
import Navbar from '../components/navbar';
import './destinationdetail.css';

const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'INR', symbol: '₹' }
];

const DestinationDetail = () => {
    const { destinationId } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadingActivityId, setUploadingActivityId] = useState(null);

    const [showAddActivity, setShowAddActivity] = useState(false);
    const [actName, setActName] = useState('');
    const [actDate, setActDate] = useState('');
    const [actTime, setActTime] = useState('');
    const [actCategory, setActCategory] = useState('');
    const [actBudget, setActBudget] = useState('');
    const [actLink, setActLink] = useState('');

    const [editingActivityId, setEditingActivityId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editBudget, setEditBudget] = useState('');

    useEffect(() => {
        fetchData();
    }, [destinationId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [destRes, catRes, imgRes] = await Promise.all([
                destinationAPI.getDestination(destinationId),
                categoryAPI.getCategories(),
                imageAPI.getDestinationImages(destinationId)
            ]);
            setDestination(destRes.data);
            setCategories(catRes.data);
            setImages(imgRes.data);
            if (catRes.data.length > 0 && !actCategory) {
                setActCategory(catRes.data[0].id);
            }
        } catch (err) {
            setError('Failed to load destination');
        } finally {
            setLoading(false);
        }
    };

    const isInFuture = (dateTime) => {
        return new Date(dateTime) > new Date();
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm('Delete this activity? This cannot be undone.')) return;
        try {
            await activityAPI.deleteActivity(activityId);
            fetchData();
        } catch (err) {
            setError('Failed to delete activity');
        }
    };

    const startEditActivity = (act) => {
        setEditingActivityId(act.id);
        const dt = new Date(act.dateTime);
        setEditName(act.name);
        setEditDate(dt.toISOString().split('T')[0]);
        setEditTime(dt.toTimeString().slice(0, 5));
        setEditCategory(act.categoryId);
        setEditBudget(act.budgetPlanned);
    };

    const cancelEditActivity = () => {
        setEditingActivityId(null);
    };

    const handleUpdateActivity = async (activityId) => {
        try {
            const dateTime = `${editDate}T${editTime || '00:00'}`;
            await activityAPI.updateActivity(activityId, {
                name: editName,
                dateTime,
                categoryId: editCategory,
                budgetPlanned: editBudget
            });
            setEditingActivityId(null);
            fetchData();
        } catch (err) {
            setError('Failed to update activity');
        }
    };

    const handleSetRating = async (activityId, rating) => {
        try {
            await activityAPI.updateActivity(activityId, { rating });
            fetchData();
        } catch (err) {
            setError('Failed to update rating');
        }
    };

    const handleToggleVisited = async (activityId, currentVisited) => {
        try {
            await activityAPI.updateActivity(activityId, { visited: !currentVisited });
            fetchData();
        } catch (err) {
            setError('Failed to update activity');
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (!actName.trim() || !actDate || !actCategory) {
            setError('Name, date, and category are required');
            return;
        }

        try {
            const dateTime = actTime ? `${actDate}T${actTime}` : `${actDate}T00:00`;
            await activityAPI.createActivity(
                destinationId,
                actCategory,
                actName,
                dateTime,
                actBudget || 0
            );
            setActName('');
            setActDate('');
            setActTime('');
            setActBudget('');
            setActLink('');
            setShowAddActivity(false);
            setError('');
            fetchData();
        } catch (err) {
            setError('Failed to add activity');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);
            formData.append('destinationId', destinationId);
            await imageAPI.upload(formData);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await imageAPI.deleteImage(imageId);
            fetchData();
        } catch (err) {
            setError('Failed to delete image');
        }
    };

    const handleActivityImageUpload = async (e, activityId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingActivityId(activityId);
            const formData = new FormData();
            formData.append('image', file);
            formData.append('activityId', activityId);
            await imageAPI.upload(formData);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploadingActivityId(null);
            e.target.value = '';
        }
    };

    if (loading) return (
        <div className="dest-detail-page">
            <Navbar showBack backTo="/home" backLabel="Back" />
            <div className="loading">Loading destination...</div>
        </div>
    );

    if (!destination) return (
        <div className="dest-detail-page">
            <Navbar showBack backTo="/home" backLabel="Back" />
            <div className="error-message">Destination not found</div>
        </div>
    );

    const mapQuery = encodeURIComponent(destination.name);
    const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&z=11&output=embed`;
    const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
    const currencySymbol = CURRENCIES.find(c => c.code === destination.trip?.currency)?.symbol || '$';

    return (
        <div className="dest-detail-page">
            <Navbar showBack backTo={`/trip/${destination.tripId}`} backLabel="Back to Trip" />

            <div className="dest-detail-container">
                <div className="dest-detail-header">
                    <h2>{destination.name}</h2>
                    {destination.notes && <p className="dest-notes">{destination.notes}</p>}
                </div>

                <div className="map-section">
                    <iframe
                        title="Destination map"
                        src={mapEmbedUrl}
                        width="100%"
                        height="250"
                        style={{ border: 0, borderRadius: '8px 8px 0 0' }}
                        loading="lazy"
                    ></iframe>
                    <a href={mapLinkUrl} target="_blank" rel="noopener noreferrer" className="btn-open-map-full">
                        🗺️ Open {destination.name} in Google Maps for accurate location
                    </a>
                </div>

                <div className="images-section">
                    <div className="section-header">
                        <h3>Photos</h3>
                        <label className="btn-add btn-upload-label">
                            {uploading ? 'Uploading...' : '+ Upload Photo'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {images.length > 0 ? (
                        <div className="images-grid">
                            {images.map((img) => (
                                <div key={img.id} className="image-thumb">
                                    <img src={`http://localhost:3000/uploads/${img.filename}`} alt="Destination" />
                                    <button className="btn-delete-image" onClick={() => handleDeleteImage(img.id)}>×</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-images">No photos yet. Upload one above.</p>
                    )}
                </div>

                <div className="activities-section">
                    <div className="section-header">
                        <h3>Activities</h3>
                        <button className="btn-add" onClick={() => setShowAddActivity(!showAddActivity)}>
                            + Add Activity
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {showAddActivity && (
                        <form className="add-activity-form" onSubmit={handleAddActivity}>
                            <div className="form-row">
                                <input
                                    type="text"
                                    value={actName}
                                    onChange={(e) => setActName(e.target.value)}
                                    placeholder="Activity name (e.g. Visit Sagrada Familia)"
                                />
                            </div>

                            <div className="form-row">
                                <select value={actCategory} onChange={(e) => setActCategory(e.target.value)}>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={actDate}
                                    onChange={(e) => setActDate(e.target.value)}
                                />
                                <input
                                    type="time"
                                    value={actTime}
                                    onChange={(e) => setActTime(e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <input
                                    type="number"
                                    value={actBudget}
                                    onChange={(e) => setActBudget(e.target.value)}
                                    placeholder={`Budget (e.g. 50 ${currencySymbol})`}
                                    step="0.01"
                                />
                                <input
                                    type="text"
                                    value={actLink}
                                    onChange={(e) => setActLink(e.target.value)}
                                    placeholder="Link (optional)"
                                />
                            </div>

                            <button type="submit" className="btn-save">Save Activity</button>
                        </form>
                    )}

                    {destination.activities && destination.activities.length > 0 ? (
                        <div className="activities-list">
                            {destination.activities.map((act) => (
                                <div key={act.id} className="activity-card-wrapper">
                                    {editingActivityId === act.id ? (
                                        <form
                                            className="edit-activity-form"
                                            onSubmit={(e) => { e.preventDefault(); handleUpdateActivity(act.id); }}
                                        >
                                            <div className="form-row">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    placeholder="Activity name"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="date"
                                                    value={editDate}
                                                    onChange={(e) => setEditDate(e.target.value)}
                                                />
                                                <input
                                                    type="time"
                                                    value={editTime}
                                                    onChange={(e) => setEditTime(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-row">
                                                <input
                                                    type="number"
                                                    value={editBudget}
                                                    onChange={(e) => setEditBudget(e.target.value)}
                                                    placeholder="Budget"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="edit-actions">
                                                <button type="button" className="btn-cancel-edit" onClick={cancelEditActivity}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn-save">Save Changes</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="activity-card">
                                                <div className="activity-info">
                                                    <span className="activity-category">{act.category?.name}</span>
                                                    <h4>{act.name}</h4>
                                                    <p className="activity-date">
                                                        {new Date(act.dateTime).toLocaleDateString()} at{' '}
                                                        {new Date(act.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="activity-budget">Budget: {currencySymbol}{act.budgetPlanned}</p>
                                                </div>
                                                <div className="activity-card-right">
                                                    {isInFuture(act.dateTime) ? (
                                                        <span className="future-badge" title="This activity hasn't happened yet">
                                                            🕒 Upcoming
                                                        </span>
                                                    ) : (
                                                        <label className="visited-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={act.visited}
                                                                onChange={() => handleToggleVisited(act.id, act.visited)}
                                                            />
                                                            {act.visited ? '✓ Visited' : 'Mark Visited'}
                                                        </label>
                                                    )}
                                                    <div className="activity-actions">
                                                        <button className="btn-edit-activity" onClick={() => startEditActivity(act)}>
                                                            Edit
                                                        </button>
                                                        <button className="btn-delete-activity" onClick={() => handleDeleteActivity(act.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {act.visited && (
                                                <div className="rating-row">
                                                    <span className="rating-label">Rate it:</span>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            className={`rating-star ${act.rating >= star ? 'filled' : ''}`}
                                                            onClick={() => handleSetRating(act.id, star)}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="activity-images-row">
                                                {act.images && act.images.map((img) => (
                                                    <img
                                                        key={img.id}
                                                        className="activity-thumb"
                                                        src={`http://localhost:3000/uploads/${img.filename}`}
                                                        alt={act.name}
                                                    />
                                                ))}
                                                <label className="btn-upload-small">
                                                    {uploadingActivityId === act.id ? '...' : '+ Photo'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleActivityImageUpload(e, act.id)}
                                                        disabled={uploadingActivityId === act.id}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-activities">No activities yet. Add your first one above.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;