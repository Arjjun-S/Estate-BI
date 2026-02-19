import React from 'react';

const ReportsPage = () => {
    return (
        <div>
            <h1>Reports</h1>
            <p>View detailed analysis and historical trends.</p>
            <div className="card" style={{ marginTop: '2rem' }}>
                <p>Generating visualizations...</p>
                <div style={{ height: 400, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    Charts Placeholder
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
