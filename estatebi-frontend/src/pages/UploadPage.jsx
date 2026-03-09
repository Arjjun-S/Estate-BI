import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { getUploadHistory, uploadFile } from '../services/api';

const UploadPage = () => {
    const [history, setHistory] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [tempFile, setTempFile] = useState(null);
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
        const allowedExtensions = ['.csv', '.json', '.xlsx', '.xls'];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(ext)) {
            setUploadResult({ success: false, message: 'Only CSV, JSON, and Excel files are allowed' });
            return;
        }

        setUploading(true);
        setUploadResult(null);
        setPreviewData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Step 1: Send to AI for preprocessing
            const response = await fetch('http://localhost:5001/api/upload/ai-process', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'AI Processing failed');

            setPreviewData(data.preview);
            setTempFile({ filename: file.name, total: data.totalRecords });

        } catch (error) {
            setUploadResult({
                success: false,
                message: error.message || 'Processing failed'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmSave = async () => {
        setConfirming(true);
        try {
            const response = await fetch('http://localhost:5001/api/upload/confirm-save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    records: previewData,
                    filename: tempFile.filename
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save data');

            setUploadResult({
                success: true,
                message: `Successfully processed ${data.processed} records using AI Intelligence.`,
                details: data
            });
            setPreviewData(null);
            fetchHistory();
        } catch (error) {
            setUploadResult({
                success: false,
                message: error.message || 'Save failed'
            });
        } finally {
            setConfirming(false);
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
                    accept=".csv,.json,.xlsx,.xls"
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
                    href="http://localhost:5001/api/upload/template"
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

            {previewData && (
                <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Preview</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Local finetuned LLM has mapped your columns. Please verify the data below.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn"
                                style={{ background: '#f1f5f9', color: '#64748b' }}
                                onClick={() => setPreviewData(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmSave}
                                disabled={confirming}
                            >
                                {confirming ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>Confirm & Import {tempFile?.total} Records</>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                        <table style={{ minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th>Code</th>
                                    <th>Address</th>
                                    <th>City</th>
                                    <th>Region</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Sqft</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: 600 }}>{row.property_code}</td>
                                        <td>{row.address}</td>
                                        <td>{row.city}</td>
                                        <td>{row.region}</td>
                                        <td>{row.type}</td>
                                        <td>₹{(row.price || 0).toLocaleString()}</td>
                                        <td>{row.sqft}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
