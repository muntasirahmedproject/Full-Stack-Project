import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import './auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [tokenReceived, setTokenReceived] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);
            const response = await authAPI.forgotPassword(email);
            setResetToken(response.data.resetToken);
            setTokenReceived(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate reset token');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!resetToken || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await authAPI.resetPassword(email, resetToken, newPassword);
            setResetComplete(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (resetComplete) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Password Reset Successful</h2>
                    <p className="auth-link">
                        Your password has been updated. <Link to="/login">Log in now</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>

                {error && <div className="error-message">{error}</div>}

                {!tokenReceived ? (
                    <form onSubmit={handleRequestToken}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Requesting...' : 'Get Reset Token'}
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="error-message" style={{ background: '#eef', color: '#334', border: '1px solid #ccd' }}>
                            <strong>Demo note:</strong> in a production app, this token would be emailed to you instead of shown here.
                            <br /><br />
                            Your reset token: <strong>{resetToken}</strong>
                        </div>

                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>Reset Token</label>
                                <input
                                    type="text"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                <p className="auth-link">
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;