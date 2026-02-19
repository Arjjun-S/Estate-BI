import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { getUploadHistory, uploadFile } from '../services/api';

const UploadPage = () => {
    const [history, setHistory] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = () => {
        getUploadHistory().then(res => setHistory(res.data)).catch(console.error);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        const allowedTypes = ['text/csv', 'application/json'];
        const allowedExtensions = ['.csv', '.json'];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(ext)) {
            setUploadResult({ success: false, message: 'Only CSV and JSON files are allowed' });
            return;
        }

        setUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData);
            setUploadResult({
                success: true,
                message: `Successfully processed ${response.data.processed} records`,
                details: response.data
            });
            fetchHistory();
        } catch (error) {
            setUploadResult({
                success: false,
                message: error.response?.data?.error || 'Upload failed'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h1>Data Upload</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Import new housing datasets (CSV, JSON) to synchronize with the database.
            </p>

            <div 
                className="card" 
                style={{ 
                    padding: '3rem', 
                    border: dragActive ? '2px solid var(--primary)' : '2px dashed var(--border-color)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    background: dragActive ? '#fef3c7' : '#f8fafc',
                    transition: 'all 0.2s'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: '#0284c7' }}>
                    <UploadCloud size={32} />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>
                    {uploading ? 'Uploading...' : 'Drag & drop files here'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>or browse from computer</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.json"
                    style={{ display: 'none' }}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? 'Processing...' : 'Browse Files'}
                </button>
                <a 
                    href="http://localhost:5000/api/upload/template" 
                    style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                    <Download size={14} /> Download CSV Template
                </a>
            </div>

            {uploadResult && (
                <div 
                    className="card" 
                    style={{ 
                        marginTop: '1rem', 
                        background: uploadResult.success ? '#f0fdf4' : '#fef2f2', 
                        border: `1px solid ${uploadResult.success ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem' 
                    }}
                >
                    {uploadResult.success ? (
                        <CheckCircle size={24} color="#16a34a" />
                    ) : (
                        <AlertTriangle size={24} color="#dc2626" />
                    )}
                    <div>
                        <h4 style={{ color: uploadResult.success ? '#166534' : '#991b1b', marginBottom: '0.2rem' }}>
                            {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: uploadResult.success ? '#166534' : '#991b1b' }}>
                            {uploadResult.message}
                        </p>
                    </div>
                </div>
            )}

            <h3 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Upload History</h3>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Timestamp</th>
                            <th>Records</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={16} color="var(--text-secondary)" /> {item.filename}
                                </td>
                                <td>{item.timestamp}</td>
                                <td>{item.records_processed || '-'}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'Success' ? 'status-success' : 'status-error'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No upload history yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UploadPage;
