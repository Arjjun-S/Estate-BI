/**
 * Data Preprocessing Service for EstateBI
 * Handles data validation, cleaning, and transformation
 */

// City-wise median prices for missing value imputation
const CITY_MEDIAN_PRICES = {
    'Chennai': 15000000,
    'Salem': 5000000,
    'default': 8000000
};

// Type-wise average sqft for missing value estimation
const TYPE_AVG_SQFT = {
    'Residential': 1400,
    'Commercial': 3500,
    'Land': 5000,
    'default': 1500
};

/**
 * Preprocess a single data row
 * @param {Object} row - Raw data row
 * @returns {Object} - Preprocessed data row
 */
function preprocessData(row) {
    const processed = { ...row };
    
    // 1. Normalize city name
    if (processed.city) {
        processed.city = normalizeCity(processed.city);
    }
    
    // 2. Fill missing price with city median
    if (!processed.price || isNaN(parseFloat(processed.price))) {
        processed.price = CITY_MEDIAN_PRICES[processed.city] || CITY_MEDIAN_PRICES.default;
    } else {
        processed.price = parseFloat(processed.price);
    }
    
    // 3. Normalize and validate type
    processed.type = normalizeType(processed.type);
    
    // 4. Fill missing sqft with type average
    if (!processed.sqft || isNaN(parseInt(processed.sqft))) {
        processed.sqft = TYPE_AVG_SQFT[processed.type] || TYPE_AVG_SQFT.default;
    } else {
        processed.sqft = parseInt(processed.sqft);
    }
    
    // 5. Normalize status
    processed.status = normalizeStatus(processed.status);
    
    // 6. Handle missing region
    if (!processed.region || processed.region.trim() === '') {
        processed.region = 'Unknown';
    }
    
    // 7. Normalize numeric fields
    processed.bedrooms = parseInt(processed.bedrooms) || 0;
    processed.bathrooms = parseFloat(processed.bathrooms) || 0;
    processed.year_built = parseInt(processed.year_built) || null;
    
    // 8. Clean address
    if (processed.address) {
        processed.address = processed.address.trim().replace(/\s+/g, ' ');
    }
    
    // 9. Generate property_code if missing
    if (!processed.property_code) {
        const cityPrefix = processed.city ? processed.city.substring(0, 3).toUpperCase() : 'UNK';
        processed.property_code = `${cityPrefix}${Date.now().toString().slice(-6)}`;
    }
    
    return processed;
}

/**
 * Validate a preprocessed row
 * @param {Object} row - Preprocessed data row
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateRow(row) {
    const errors = [];
    
    // Required fields
    if (!row.city) {
        errors.push('City is required');
    }
    
    if (!row.price || row.price <= 0) {
        errors.push('Price must be a positive number');
    }
    
    // Validate type
    const validTypes = ['Residential', 'Commercial', 'Land'];
    if (row.type && !validTypes.includes(row.type)) {
        errors.push(`Invalid type: ${row.type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // Validate status
    const validStatuses = ['Active', 'Sold', 'Pending'];
    if (row.status && !validStatuses.includes(row.status)) {
        errors.push(`Invalid status: ${row.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate numeric ranges
    if (row.sqft && row.sqft < 0) {
        errors.push('Square footage cannot be negative');
    }
    
    if (row.bedrooms && row.bedrooms < 0) {
        errors.push('Bedrooms cannot be negative');
    }
    
    if (row.year_built && (row.year_built < 1800 || row.year_built > new Date().getFullYear() + 1)) {
        errors.push('Invalid year built');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Normalize city name
 */
function normalizeCity(city) {
    if (!city) return null;
    
    const cityMap = {
        'chennai': 'Chennai',
        'madras': 'Chennai',
        'salem': 'Salem',
        'selam': 'Salem'
    };
    
    const normalized = city.trim().toLowerCase();
    return cityMap[normalized] || city.trim().split(' ').map(
        word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

/**
 * Normalize property type
 */
function normalizeType(type) {
    if (!type) return 'Residential';
    
    const typeMap = {
        'residential': 'Residential',
        'flat': 'Residential',
        'apartment': 'Residential',
        'house': 'Residential',
        'villa': 'Residential',
        'commercial': 'Commercial',
        'office': 'Commercial',
        'shop': 'Commercial',
        'showroom': 'Commercial',
        'land': 'Land',
        'plot': 'Land',
        'site': 'Land'
    };
    
    const normalized = type.trim().toLowerCase();
    return typeMap[normalized] || 'Residential';
}

/**
 * Normalize status
 */
function normalizeStatus(status) {
    if (!status) return 'Active';
    
    const statusMap = {
        'active': 'Active',
        'available': 'Active',
        'for sale': 'Active',
        'sold': 'Sold',
        'completed': 'Sold',
        'pending': 'Pending',
        'under contract': 'Pending',
        'in escrow': 'Pending'
    };
    
    const normalized = status.trim().toLowerCase();
    return statusMap[normalized] || 'Active';
}

/**
 * Remove duplicate entries based on property_code
 */
function removeDuplicates(rows) {
    const seen = new Set();
    return rows.filter(row => {
        if (row.property_code && seen.has(row.property_code)) {
            return false;
        }
        if (row.property_code) {
            seen.add(row.property_code);
        }
        return true;
    });
}

/**
 * Batch preprocess multiple rows
 */
function batchPreprocess(rows) {
    const processed = rows.map(preprocessData);
    return removeDuplicates(processed);
}

module.exports = {
    preprocessData,
    validateRow,
    normalizeCity,
    normalizeType,
    normalizeStatus,
    removeDuplicates,
    batchPreprocess,
    CITY_MEDIAN_PRICES,
    TYPE_AVG_SQFT
};
