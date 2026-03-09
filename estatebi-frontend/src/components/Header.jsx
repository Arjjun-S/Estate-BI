import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, User, Bell, Moon, Sun, MapPin, Home, DollarSign, Maximize, Calendar, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const Header = ({ onSearch, onGlobalFilter, globalFilters }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showPropertyModal, setShowPropertyModal] = useState(false);

    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const profileMenuRef = useRef(null);

    // Initial User load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    // Global Click Outside Handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Dark Mode Toggle
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Search Logic
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (onSearch) {
            onSearch(value);
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (value.trim().length > 1) {
            setIsSearching(true);
            setShowSearchResults(true);

            debounceTimer.current = setTimeout(async () => {
                try {
                    const response = await api.get(`/properties/search/${encodeURIComponent(value)}`);
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Error searching properties:", error);
                    setSearchResults({ properties: [], cities: [] });
                } finally {
                    setIsSearching(false);
                }
            }, 400); // 400ms debounce
        } else {
            setSearchResults({ properties: [], cities: [] });
            setShowSearchResults(false);
        }
    };

    const handlePropertyClick = async (propertyId) => {
        setShowSearchResults(false);
        setSearchTerm('');
        try {
            const response = await api.get(`/properties/${propertyId}`);
            setSelectedProperty(response.data);
            setShowPropertyModal(true);
        } catch (error) {
            console.error("Error fetching property details:", error);
        }
    };

    const handleCityClick = (cityData) => {
        setShowSearchResults(false);
        setSearchTerm('');

        // Trigger global teleportation effect (direct filter, no modal)
        if (onGlobalFilter) {
            onGlobalFilter({ city: cityData.name });
        }
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return { bg: '#fee2e2', color: '#991b1b' };
            case 'analyst': return { bg: '#dbeafe', color: '#1e40af' };
            default: return { bg: '#f3f4f6', color: '#374151' };
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Property Details Modal Component
    const PropertyModal = ({ property, show, onClose, formatCurrency }) => {
        if (!property || !show) return null;

        return createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(10px)',
                    padding: '2rem'
                }}
                onClick={onClose}
            >
                <style>{`
                    @keyframes modalScaleIn {
                        from { opacity: 0; transform: scale(0.95) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>
                <div
                    style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-color)',
                        animation: 'modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--card-bg)',
                        zIndex: 10
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {property.property_code}
                                </h2>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: property.status === 'Active' ? '#dcfce7' :
                                        property.status === 'Sold' ? '#fee2e2' : '#fef3c7',
                                    color: property.status === 'Active' ? '#166534' :
                                        property.status === 'Sold' ? '#991b1b' : '#92400e'
                                }}>
                                    {property.status}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> {property.address}, {property.city}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-secondary)' }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <DollarSign size={16} /> Price
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {formatCurrency(property.price)}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Home size={16} /> Type
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {property.type}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Maximize size={16} /> Area
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {property.sqft ? `${property.sqft} sq ft` : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--bg-color)', paddingBottom: '0.5rem' }}>Property Features</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Bedrooms</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{property.bedrooms || 'N/A'}</span>
                                    </li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Bathrooms</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{property.bathrooms || 'N/A'}</span>
                                    </li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Year Built</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{property.year_built || 'N/A'}</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--bg-color)', paddingBottom: '0.5rem' }}>Location Details</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>City</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{property.city}</span>
                                    </li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Region</span>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{property.region_name || 'N/A'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {property.description && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Description</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {property.transactions && property.transactions.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>Recent Transactions</h3>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                                    {property.transactions.map((t, idx) => (
                                        <div key={t.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 1rem',
                                            borderBottom: idx < property.transactions.length - 1 ? '1px solid var(--border-color)' : 'none',
                                            background: idx % 2 === 0 ? 'transparent' : 'var(--bg-color)'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                                                {new Date(t.transaction_date).toLocaleDateString()}
                                            </span>
                                            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>
                                                {formatCurrency(t.sale_price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };



    return (
        <header className="top-bar">
            <div></div> {/* Placeholder to keep layout balanced if logo was removed */}

            <div style={{ position: 'relative', width: 450 }} ref={searchRef}>
                <input
                    type="text"
                    placeholder="Search properties, cities, addresses..."
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={() => { if (searchTerm.length > 1) setShowSearchResults(true); }}
                    style={{
                        width: '100%',
                        padding: '0.65rem 0.65rem 0.65rem 2.75rem',
                        borderRadius: 10,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        boxShadow: showSearchResults ? '0 0 0 2px var(--primary-light)' : 'none',
                    }}
                />

                {isSearching ? (
                    <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                ) : (
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                )}

                {showSearchResults && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        background: 'var(--card-bg)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid var(--border-color)',
                        maxHeight: '450px',
                        overflowY: 'auto',
                        zIndex: 100,
                        animation: 'slideDown 0.2s ease-out'
                    }}>
                        {isSearching ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>Searching dataset...</p>
                            </div>
                        ) : (searchResults?.cities?.length > 0 || searchResults?.properties?.length > 0) ? (
                            <div style={{ padding: '0.5rem 0' }}>
                                {/* Cities Section */}
                                {searchResults?.cities?.length > 0 && (
                                    <div style={{ borderBottom: searchResults.properties?.length > 0 ? '1px solid var(--border-color)' : 'none' }}>
                                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cities Matched</div>
                                        {searchResults.cities.map((city) => (
                                            <div
                                                key={city.name}
                                                onClick={() => handleCityClick(city)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '8px',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{city.name}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {city.property_count} Properties • Click for Insights
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Properties Section */}
                                {searchResults?.properties?.length > 0 && (
                                    <div>
                                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Properties Matched</div>
                                        {searchResults.properties.map((result) => (
                                            <div
                                                key={result.id}
                                                onClick={() => handlePropertyClick(result.id)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '8px',
                                                    background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <Home size={18} />
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1rem' }}>
                                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                            {result.property_code}
                                                        </h4>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                            {formatCurrency(result.price)}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                        {result.address}, {result.city}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Search size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>No results found for "{searchTerm}"</p>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>Try searching by city, address, or property code</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                    className="btn btn-outline"
                    style={{ borderRadius: '50%', padding: '0.6rem', border: 'none' }}
                    onClick={toggleDarkMode}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.6rem', border: 'none' }}>
                    <Bell size={20} />
                </button>

                {/* Profile Dropdown Container */}
                <div style={{ position: 'relative' }} ref={profileMenuRef}>
                    <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                        title="View Profile"
                    >
                        <User size={20} />
                    </div>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '280px',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            animation: 'slideDown 0.2s ease-out',
                            zIndex: 100
                        }}>
                            {/* User Header */}
                            <div style={{
                                padding: '1.25rem',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: user?.profile_picture
                                        ? `url(${user.profile_picture}) center/cover`
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>
                                    {!user?.profile_picture ? (user ? getInitials(user.name) : <User size={24} />) : ''}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {user?.name || 'User'}
                                    </h4>
                                    <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {user?.email || 'email@example.com'}
                                    </p>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        marginTop: '0.3rem',
                                        ...getRoleBadgeColor(user?.role)
                                    }}>
                                        {user?.role || 'User'}
                                    </span>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div style={{ padding: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        navigate('/profile');
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        transition: 'background 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <User size={18} style={{ color: 'var(--text-secondary)' }} />
                                    View Full Profile
                                </button>

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem' }}></div>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        fontSize: '0.95rem',
                                        transition: 'background 0.2s',
                                        textAlign: 'left',
                                        fontWeight: 500
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Modals outside of flow */}
            <PropertyModal
                property={selectedProperty}
                show={showPropertyModal}
                onClose={() => setShowPropertyModal(false)}
                formatCurrency={formatCurrency}
            />
        </header>
    );
};

export default Header;
