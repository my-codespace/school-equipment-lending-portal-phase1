import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI, requestAPI } from '../services/api';
import '../styles/Equipment.css';


const EquipmentList = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        available: '',
    });

    const { user, isStudent, isAdmin, isStaff, logout } = useAuth();


    useEffect(() => {
        fetchEquipment();
    }, [filters]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.category) params.category = filters.category;

            if (filters.available === 'true') {
                params.available = true;
            } else if (filters.available === 'false') {
                params.available = false;
            }

            const response = await equipmentAPI.getAll(params);
            setEquipment(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch equipment');
        } finally {
            setLoading(false);
        }
    };


    const handleBorrowRequest = async (equipmentId) => {
        try {
            await requestAPI.create({ equipmentId });
            setSuccessMessage('Borrow request submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchEquipment(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create borrow request');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="equipment-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <h1>Equipment Portal</h1>
                    <div className="user-info">
                        <span className="welcome">Welcome, {user?.name}</span>
                        <span className="role-badge">{user?.role}</span>

                        {/* Student navigation */}
                        {isStudent && (
                            <button
                                onClick={() => window.location.href = '/my-requests'}
                                className="btn-nav"
                            >
                                My Requests
                            </button>
                        )}

                        {/* Staff/Admin navigation */}
                        {(isAdmin || isStaff) && (
                            <button
                                onClick={() => window.location.href = '/requests'}
                                className="btn-nav"
                            >
                                Manage Requests
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => window.location.href = '/admin/dashboard'}
                                className="btn-nav"
                            >
                                Admin Dashboard
                            </button>
                        )}

                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </header>

            <div className="equipment-container">
                {/* Filters */}
                <div className="filters-section">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            <option value="Sports">Sports</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="Lab">Lab Equipment</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Availability</label>
                        <select name="available" value={filters.available} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="true">Available Only</option>
                            <option value="false">Unavailable</option>
                        </select>
                    </div>


                </div>

                {/* Equipment List */}
                <div className="equipment-list-section">
                    {successMessage && (
                        <div className="success-message">{successMessage}</div>
                    )}
                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {loading ? (
                        <div className="loading">Loading equipment...</div>
                    ) : equipment.length === 0 ? (
                        <div className="no-data">No equipment found</div>
                    ) : (
                        <div className="equipment-grid">
                            {equipment.map((item) => (
                                <div key={item._id} className="equipment-card">
                                    <div className="card-header">
                                        <h3>{item.name}</h3>
                                        <span className={`badge badge-${item.condition}`}>
                      {item.condition}
                    </span>
                                    </div>

                                    <div className="card-body">
                                        <p className="category">
                                            <strong>Category:</strong> {item.category}
                                        </p>
                                        <p className="quantity">
                                            <strong>Available:</strong> {item.availableCount} / {item.totalQuantity}
                                        </p>

                                        <div className="availability-bar">
                                            <div
                                                className="availability-fill"
                                                style={{
                                                    width: `${(item.availableCount / item.totalQuantity) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        {isStudent && (
                                            <button
                                                className="btn-borrow"
                                                onClick={() => handleBorrowRequest(item._id)}
                                                disabled={item.availableCount === 0}
                                            >
                                                {item.availableCount === 0 ? 'Unavailable' : 'Request to Borrow'}
                                            </button>
                                        )}
                                        {!isStudent && (
                                            <span className="info-text">
                        {item.availableCount === 0 ? 'Out of Stock' : 'In Stock'}
                      </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentList;
