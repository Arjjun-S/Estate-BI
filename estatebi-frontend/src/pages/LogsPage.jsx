import React, { useState, useEffect } from 'react';
import { getLogs } from '../services/api';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        getLogs().then(res => setLogs(res.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h1>System Logs</h1>
            <p>Track all activity and system events.</p>
            <div className="card" style={{ marginTop: '2rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Event</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={index}>
                                <td>{log.time}</td>
                                <td>{log.user}</td>
                                <td>{log.event}</td>
                                <td>{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogsPage;
