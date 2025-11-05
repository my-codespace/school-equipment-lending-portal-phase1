import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import '../styles/RequestManagement.css';

const RequestManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('all');

    const { user, logout, isAdmin } = useAuth();

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await requestAPI.getAll(params);
            setRequests(response.data);
        } catch (err) {
            showMessage('error', 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleApprove = async (id) => {
        try {
            await requestAPI.approve(id);
            showMessage('success', 'Request approved successfully');
            fetchRequests();
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this request?')) {
            return;
        }

        try {
            await requestAPI.reject(id);
            showMessage('success', 'Request rejected');
            fetchRequests();
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Failed to reject request');
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Confirm that the equipment has been returned?')) {
            return;
        }

        try {
            await requestAPI.return(id);
            showMessage('success', 'Equipment marked as returned');
            fetchRequests();
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Failed to mark as returned');
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime())
            ? "N/A"
            : parsed.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    };


    return (
        <div className="request-management">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <h1>Request Management</h1>
                    <div className="header-actions">
                        <span>Welcome, {user?.name}</span>
                        <button onClick={() => window.location.href = '/equipment'} className="btn-secondary">
                            Equipment Portal
                        </button>
                        {isAdmin && (
                            <button onClick={() => window.location.href = '/admin/dashboard'} className="btn-secondary">
                                Admin Dashboard
                            </button>
                        )}
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </header>

            <div className="requests-container">
                {/* Messages */}
                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

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

                {/* Requests List */}
                {loading ? (
                    <div className="loading">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="no-data">No requests found</div>
                ) : (
                    <div className="requests-grid">
                        {requests.map((request) => (
                            <div key={request._id} className="request-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{request.equipment?.name || 'Equipment Not Found'}</h3>
                                        <p className="user-info">
                                            Requested by: <strong>{request.user?.name || 'Unknown'}</strong>
                                        </p>
                                    </div>
                                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Category:</span>
                                        <span>{request.equipment?.category || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Request Date:</span>
                                        <span>{formatDate(request.createdAt)}</span>
                                    </div>
                                    {request.status === 'approved' && request.approvedAt && (
                                        <div className="info-row">
                                            <span className="label">Approved Date:</span>
                                            <span>{formatDate(request.approvedAt)}</span>
                                        </div>
                                    )}
                                    {request.status === 'rejected' && request.rejectedAt && (
                                        <div className="info-row">
                                            <span className="label">Rejected Date:</span>
                                            <span>{formatDate(request.rejectedAt)}</span>
                                        </div>
                                    )}
                                    {request.status === 'returned' && request.returnedAt && (
                                        <div className="info-row">
                                            <span className="label">Returned Date:</span>
                                            <span>{formatDate(request.returnedAt)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer">
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                className="btn-approve"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                className="btn-reject"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'approved' && (
                                        <button
                                            onClick={() => handleReturn(request._id)}
                                            className="btn-return"
                                        >
                                            Mark as Returned
                                        </button>
                                    )}
                                    {(request.status === 'rejected' || request.status === 'returned') && (
                                        <span className="info-text">No actions available</span>
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

export default RequestManagement;

