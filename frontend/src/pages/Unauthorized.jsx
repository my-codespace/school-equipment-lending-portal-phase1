import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Error.css';

const Unauthorized = () => {
    return (
        <div className="error-container">
            <div className="error-card">
                <h1>403</h1>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <Link to="/equipment" className="btn-primary">
                    Go to Equipment List
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;

