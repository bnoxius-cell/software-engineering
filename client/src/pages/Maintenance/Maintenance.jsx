import React from 'react';

const Maintenance = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
            background: '#0a0a0a',
            color: '#e0e0e0'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ff6b6b' }}>
                🛠️ Under Maintenance
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', lineHeight: 1.6 }}>
                The platform is currently undergoing scheduled maintenance.
                Please check back later.
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                Only administrators can access the site during maintenance.
            </p>
        </div>
    );
};

export default Maintenance;

