import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        condition: 'good',
        totalQuantity: '',
    });

    const { user, logout } = useAuth();

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await equipmentAPI.getAll();
            setEquipment(response.data);
        } catch (err) {
            showMessage('error', 'Failed to fetch equipment');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setEditMode(false);
        setFormData({
            name: '',
            category: '',
            condition: 'good',
            totalQuantity: '',
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setCurrentEquipment(item);
        setFormData({
            name: item.name,
            category: item.category,
            condition: item.condition,
            totalQuantity: item.totalQuantity,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentEquipment(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editMode) {
                await equipmentAPI.update(currentEquipment._id, formData);
                showMessage('success', 'Equipment updated successfully');
            } else {
                await equipmentAPI.add(formData);
                showMessage('success', 'Equipment added successfully');
            }

            closeModal();
            fetchEquipment();
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) {
            return;
        }

        try {
            await equipmentAPI.delete(id);
            showMessage('success', 'Equipment deleted successfully');
            fetchEquipment();
        } catch (err) {
            showMessage('error', 'Failed to delete equipment');
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <div className="header-actions">
                        <span className="admin-name">Welcome, {user?.name}</span>
                        <button onClick={() => window.location.href = '/equipment'} className="btn-secondary">
                            View Equipment Portal
                        </button>
                        <button onClick={logout} className="btn-logout">Logout</button>
                    </div>
                </div>
            </header>

            <div className="dashboard-container">
                {/* Messages */}
                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Actions Bar */}
                <div className="actions-bar">
                    <h2>Equipment Management</h2>
                    <button onClick={openAddModal} className="btn-primary">
                        + Add New Equipment
                    </button>
                </div>

                {/* Equipment Table */}
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : equipment.length === 0 ? (
                    <div className="no-data">No equipment found. Add your first item!</div>
                ) : (
                    <div className="table-container">
                        <table className="equipment-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Condition</th>
                                <th>Total Quantity</th>
                                <th>Available</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {equipment.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>
                      <span className={`badge badge-${item.condition}`}>
                        {item.condition}
                      </span>
                                    </td>
                                    <td>{item.totalQuantity}</td>
                                    <td>{item.availableCount}</td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                            <button onClick={closeModal} className="close-btn">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Equipment Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Basketball Kit"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Books">Books</option>
                                    <option value="Lab">Lab Equipment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Condition *</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="needs repair">Needs Repair</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Total Quantity *</label>
                                <input
                                    type="number"
                                    name="totalQuantity"
                                    value={formData.totalQuantity}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editMode ? 'Update Equipment' : 'Add Equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
