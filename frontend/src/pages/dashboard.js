import React, { useState, useEffect } from 'react';
import { tripAPI } from '../api';
import Navbar from '../components/navbar';
import './dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await tripAPI.getDashboardStats();
            setStats(response.data);
        } catch (err) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="dashboard-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />
            <div className="loading">Loading dashboard...</div>
        </div>
    );

    if (error) return (
        <div className="dashboard-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />
            <div className="error-message">{error}</div>
        </div>
    );

    if (!stats) return null;

    const categoryEntries = Object.entries(stats.spendByCategory || {});
    const maxCategorySpend = Math.max(...categoryEntries.map(([, amt]) => amt), 1);

    const yearEntries = Object.entries(stats.tripsPerYear || {}).sort();
    const maxTripsInYear = Math.max(...yearEntries.map(([, count]) => count), 1);

    const budgetDiff = stats.totalActual - stats.totalPlanned;
    const budgetDiffLabel = budgetDiff > 0
        ? `$${budgetDiff.toFixed(2)} over budget`
        : budgetDiff < 0
            ? `$${Math.abs(budgetDiff).toFixed(2)} under budget`
            : 'Exactly on budget';

    return (
        <div className="dashboard-page">
            <Navbar showBack backTo="/home" backLabel="Back to Home" />

            <div className="dashboard-container">
                <h2>Your Travel Dashboard</h2>

                <div className="dashboard-top-stats">
                    <div className="top-stat-box">
                        <span className="top-stat-value">{stats.totalTrips}</span>
                        <span className="top-stat-label">Total Trips</span>
                    </div>
                    <div className="top-stat-box">
                        <span className="top-stat-value">{stats.percentVisited}%</span>
                        <span className="top-stat-label">Activities Visited</span>
                    </div>
                    <div className="top-stat-box">
                        <span className="top-stat-value">${stats.totalPlanned.toFixed(2)}</span>
                        <span className="top-stat-label">Total Planned</span>
                    </div>
                    <div className="top-stat-box">
                        <span className="top-stat-value">${stats.totalActual.toFixed(2)}</span>
                        <span className="top-stat-label">Total Actual Spend</span>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h3>Planned vs Actual Budget</h3>
                    <div className="budget-bars">
                        <div className="budget-bar-row">
                            <span className="budget-bar-label">Planned</span>
                            <div className="budget-bar-track">
                                <div
                                    className="budget-bar-fill planned"
                                    style={{ width: `${Math.min((stats.totalPlanned / Math.max(stats.totalPlanned, stats.totalActual, 1)) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="budget-bar-value">${stats.totalPlanned.toFixed(2)}</span>
                        </div>
                        <div className="budget-bar-row">
                            <span className="budget-bar-label">Actual</span>
                            <div className="budget-bar-track">
                                <div
                                    className="budget-bar-fill actual"
                                    style={{ width: `${Math.min((stats.totalActual / Math.max(stats.totalPlanned, stats.totalActual, 1)) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="budget-bar-value">${stats.totalActual.toFixed(2)}</span>
                        </div>
                    </div>
                    <p className="budget-diff-label">{budgetDiffLabel}</p>
                </div>

                {categoryEntries.length > 0 && (
                    <div className="dashboard-section">
                        <h3>Spend by Category</h3>
                        <div className="category-bars">
                            {categoryEntries.map(([category, amount]) => (
                                <div key={category} className="category-bar-row">
                                    <span className="category-bar-label">{category}</span>
                                    <div className="category-bar-track">
                                        <div
                                            className="category-bar-fill"
                                            style={{ width: `${(amount / maxCategorySpend) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="category-bar-value">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {yearEntries.length > 0 && (
                    <div className="dashboard-section">
                        <h3>Trips Per Year</h3>
                        <div className="year-bars">
                            {yearEntries.map(([year, count]) => (
                                <div key={year} className="year-bar-column">
                                    <div
                                        className="year-bar-fill"
                                        style={{ height: `${(count / maxTripsInYear) * 100}%` }}
                                    ></div>
                                    <span className="year-bar-count">{count}</span>
                                    <span className="year-bar-label">{year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats.totalTrips === 0 && (
                    <div className="no-data-message">
                        <p>No trip data yet. Create a trip to see your dashboard come to life!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
