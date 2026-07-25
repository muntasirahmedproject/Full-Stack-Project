import React, { useState, useEffect } from 'react';
import { adminAPI, categoryAPI } from '../api';
import Navbar from '../components/navbar';
import './admin.css';

const Admin = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, catRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(),
                categoryAPI.getCategories()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setCategories(catRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load admin data. You may not have admin access.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (userId, isDisabled) => {
        try {
            if (isDisabled) {
                await adminAPI.enableUser(userId);
            } else {
                await adminAPI.disableUser(userId);
            }
            fetchAll();
        } catch (err) {
            setError('Failed to update user');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await categoryAPI.createCategory(newCategoryName);
            setNewCategoryName('');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Delete this category? Activities using it may be affected.')) return;

        try {
            await categoryAPI.deleteCategory(categoryId);
            fetchAll();
        } catch (err) {
            setError('Failed to delete category');
        }
    };

    if (loading) return (
        <div className="admin-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />
            <div className="loading">Loading admin panel...</div>
        </div>
    );

    if (error) {
        return (
            <div className="admin-page">
                <Navbar showBack backTo="/home" backLabel="Back to Home" />
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            <div className="admin-container">
                <h2>Admin Panel</h2>

                <div className="admin-section">
                    <h3>Platform Statistics</h3>
                    <div className="admin-stats">
                        <div className="admin-stat-box">
                            <span className="admin-stat-value">{stats.totalUsers}</span>
                            <span className="admin-stat-label">Total Users</span>
                        </div>
                        <div className="admin-stat-box">
                            <span className="admin-stat-value">{stats.totalTrips}</span>
                            <span className="admin-stat-label">Total Trips</span>
                        </div>
                        <div className="admin-stat-box">
                            <span className="admin-stat-value">{stats.totalDestinations}</span>
                            <span className="admin-stat-label">Total Destinations</span>
                        </div>
                        <div className="admin-stat-box">
                            <span className="admin-stat-value">{stats.totalActivities}</span>
                            <span className="admin-stat-label">Total Activities</span>
                        </div>
                    </div>
                </div>

                <div className="admin-section">
                    <h3>User Management</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td>
                                        <span className={u.isDisabled ? 'status-disabled' : 'status-active'}>
                                            {u.isDisabled ? 'Disabled' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        {u.role !== 'admin' && (
                                            <button
                                                className={u.isDisabled ? 'btn-enable' : 'btn-disable'}
                                                onClick={() => handleToggleUser(u.id, u.isDisabled)}
                                            >
                                                {u.isDisabled ? 'Enable' : 'Disable'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-section">
                    <h3>Category Management</h3>
                    <form className="add-category-form" onSubmit={handleAddCategory}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                        />
                        <button type="submit" className="btn-add-category">+ Add</button>
                    </form>

                    <div className="category-list">
                        {categories.map((cat) => (
                            <div key={cat.id} className="category-chip">
                                <span>{cat.name}</span>
                                <button className="btn-delete-chip" onClick={() => handleDeleteCategory(cat.id)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;