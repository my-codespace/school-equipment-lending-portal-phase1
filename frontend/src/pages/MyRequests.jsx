import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import '../styles/MyRequests.css';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const { user, logout } = useAuth();

    useEffect(() => {
        fetchMyRequests();
    }, [filter]);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await requestAPI.getAll(params);
            setRequests(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            case 'returned':
                return 'status-returned';
            default:
                return 'status-pending';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Your request is awaiting approval from staff';
            case 'approved':
                return 'Your request has been approved. Collect the equipment!';
            case 'rejected':
                return 'Your request was rejected';
            case 'returned':
                return 'Equipment has been returned';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="my-requests-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <h1>My Borrow Requests</h1>
                    <div className="header-actions">
                        <span>Welcome, {user?.name}</span>
                        <button onClick={() => window.location.href = '/equipment'} className="btn-secondary">
                            Browse Equipment
                        </button>
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </header>

            <div className="requests-container">
                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('all')}
                    >
                        All Requests
                    </button>
                    <button
                        className={filter === 'pending' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={filter === 'approved' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={filter === 'rejected' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                    <button
                        className={filter === 'returned' ? 'tab active' : 'tab'}
                        onClick={() => setFilter('returned')}
                    >
                        Returned
                    </button>
                </div>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {/* Requests List */}
                {loading ? (
                    <div className="loading">Loading your requests...</div>
                ) : requests.length === 0 ? (
                    <div className="no-data">
                        <p>You haven't made any borrow requests yet.</p>
                        <button
                            onClick={() => window.location.href = '/equipment'}
                            className="btn-primary"
                        >
                            Browse Equipment
                        </button>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {requests.map((request) => (
                            <div key={request._id} className="request-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{request.equipment?.name || 'Equipment Not Found'}</h3>
                                        <p className="equipment-category">
                                            {request.equipment?.category || 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                                </div>

                                <div className="card-body">
                                    <p className="status-message">
                                        {getStatusMessage(request.status)}
                                    </p>

                                    <div className="info-row">
                                        <span className="label">Requested On:</span>
                                        <span>{formatDate(request.createdAt)}</span>
                                    </div>

                                    {request.status === 'approved' && request.approvedAt && (
                                        <div className="info-row">
                                            <span className="label">Approved On:</span>
                                            <span>{formatDate(request.approvedAt)}</span>
                                        </div>
                                    )}

                                    {request.status === 'rejected' && request.rejectedAt && (
                                        <div className="info-row">
                                            <span className="label">Rejected On:</span>
                                            <span>{formatDate(request.rejectedAt)}</span>
                                        </div>
                                    )}

                                    {request.status === 'returned' && request.returnedAt && (
                                        <div className="info-row">
                                            <span className="label">Returned On:</span>
                                            <span>{formatDate(request.returnedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequests;
