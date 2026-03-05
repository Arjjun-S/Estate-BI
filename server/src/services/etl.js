/**
 * ETL (Extract, Transform, Load) Service for EstateBI
 * Handles data pipeline operations for property data
 */

const { query, transaction } = require('../config/db');

// ETL Status tracking
let etlStatus = {
    lastRun: null,
    status: 'idle',
    bronzeCount: 0,
    silverCount: 0,
    goldRefreshed: false,
    errors: []
};

/**
 * Load raw data into Bronze layer (raw/staging table)
 * @param {Array} records - Array of raw property records
 * @returns {Object} Result with count of loaded records
 */
const loadToBronzeProperties = async (records) => {
    etlStatus.status = 'loading_bronze';
    etlStatus.errors = [];
    
    try {
        let loadedCount = 0;
        let failedCount = 0;
        
        for (const record of records) {
            try {
                // Insert into properties table (bronze layer)
                await query(
                    `INSERT INTO properties 
                    (property_code, address, city, type, status, price, sqft, bedrooms, bathrooms, year_built, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    address = VALUES(address),
                    city = VALUES(city),
                    type = VALUES(type),
                    status = VALUES(status),
                    price = VALUES(price),
                    sqft = VALUES(sqft),
                    bedrooms = VALUES(bedrooms),
                    bathrooms = VALUES(bathrooms),
                    year_built = VALUES(year_built),
                    description = VALUES(description),
                    updated_at = CURRENT_TIMESTAMP`,
                    [
                        record.property_code || `PROP${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        record.address || null,
                        record.city || 'Unknown',
                        record.type || 'Residential',
                        record.status || 'Active',
                        record.price || 0,
                        record.sqft || null,
                        record.bedrooms || 0,
                        record.bathrooms || 0,
                        record.year_built || null,
                        record.description || null
                    ]
                );
                loadedCount++;
            } catch (err) {
                failedCount++;
                etlStatus.errors.push({ record: record.property_code, error: err.message });
            }
        }
        
        etlStatus.bronzeCount = loadedCount;
        etlStatus.lastRun = new Date().toISOString();
        
        return {
            success: true,
            loaded: loadedCount,
            failed: failedCount,
            total: records.length
        };
    } catch (error) {
        etlStatus.status = 'error';
        etlStatus.errors.push({ stage: 'bronze', error: error.message });
        throw error;
    }
};

/**
 * Transform Bronze data to Silver layer (cleaned/validated data)
 * @returns {Object} Result with transformation stats
 */
const transformBronzeToSilver = async () => {
    etlStatus.status = 'transforming_silver';
    
    try {
        // Update region_id based on city matching
        await query(`
            UPDATE properties p
            LEFT JOIN regions r ON p.city = r.city
            SET p.region_id = r.id
            WHERE p.region_id IS NULL AND r.id IS NOT NULL
        `);
        
        // Clean price data - ensure positive values
        await query(`
            UPDATE properties 
            SET price = ABS(price)
            WHERE price < 0
        `);
        
        // Standardize property types
        await query(`
            UPDATE properties 
            SET type = 'Residential'
            WHERE type NOT IN ('Residential', 'Commercial', 'Land')
        `);
        
        // Standardize status values
        await query(`
            UPDATE properties 
            SET status = 'Active'
            WHERE status NOT IN ('Active', 'Sold', 'Pending')
        `);
        
        // Get count of transformed records
        const [countResult] = await query('SELECT COUNT(*) as count FROM properties');
        etlStatus.silverCount = countResult?.count || 0;
        
        return {
            success: true,
            transformedCount: etlStatus.silverCount
        };
    } catch (error) {
        etlStatus.status = 'error';
        etlStatus.errors.push({ stage: 'silver', error: error.message });
        throw error;
    }
};

/**
 * Refresh Gold layer metrics (aggregated/analytics-ready data)
 * @returns {Object} Result with refresh stats
 */
const refreshGoldMetrics = async () => {
    etlStatus.status = 'refreshing_gold';
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get metrics by city
        const cityMetrics = await query(`
            SELECT 
                city,
                COUNT(*) as total_inventory,
                ROUND(AVG(price), 2) as avg_price,
                SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as total_sales,
                SUM(CASE WHEN status = 'Sold' THEN price ELSE 0 END) as total_revenue
            FROM properties
            GROUP BY city
        `);
        
        // Upsert daily metrics for each city
        for (const metric of cityMetrics) {
            await query(`
                INSERT INTO daily_metrics (date, city, total_inventory, avg_price, total_sales, total_revenue)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_inventory = VALUES(total_inventory),
                avg_price = VALUES(avg_price),
                total_sales = VALUES(total_sales),
                total_revenue = VALUES(total_revenue)
            `, [today, metric.city, metric.total_inventory, metric.avg_price, metric.total_sales, metric.total_revenue]);
        }
        
        // Also store aggregate metrics (all cities)
        const aggregateMetrics = await query(`
            SELECT 
                COUNT(*) as total_inventory,
                ROUND(AVG(price), 2) as avg_price,
                SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as total_sales,
                SUM(CASE WHEN status = 'Sold' THEN price ELSE 0 END) as total_revenue
            FROM properties
        `);
        
        if (aggregateMetrics.length > 0) {
            await query(`
                INSERT INTO daily_metrics (date, city, total_inventory, avg_price, total_sales, total_revenue)
                VALUES (?, NULL, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_inventory = VALUES(total_inventory),
                avg_price = VALUES(avg_price),
                total_sales = VALUES(total_sales),
                total_revenue = VALUES(total_revenue)
            `, [today, aggregateMetrics[0].total_inventory, aggregateMetrics[0].avg_price, 
                aggregateMetrics[0].total_sales, aggregateMetrics[0].total_revenue]);
        }
        
        etlStatus.goldRefreshed = true;
        etlStatus.status = 'completed';
        
        return {
            success: true,
            citiesUpdated: cityMetrics.length,
            date: today
        };
    } catch (error) {
        etlStatus.status = 'error';
        etlStatus.errors.push({ stage: 'gold', error: error.message });
        throw error;
    }
};

/**
 * Get current ETL pipeline status
 * @returns {Object} Current ETL status
 */
const getETLStatus = () => {
    return {
        ...etlStatus,
        timestamp: new Date().toISOString()
    };
};

/**
 * Run full ETL pipeline
 * @param {Array} records - Raw data records
 * @returns {Object} Pipeline execution results
 */
const runFullPipeline = async (records) => {
    etlStatus = {
        lastRun: new Date().toISOString(),
        status: 'running',
        bronzeCount: 0,
        silverCount: 0,
        goldRefreshed: false,
        errors: []
    };
    
    try {
        // Step 1: Load to Bronze
        const bronzeResult = await loadToBronzeProperties(records);
        
        // Step 2: Transform to Silver
        const silverResult = await transformBronzeToSilver();
        
        // Step 3: Refresh Gold metrics
        const goldResult = await refreshGoldMetrics();
        
        etlStatus.status = 'completed';
        
        return {
            success: true,
            bronze: bronzeResult,
            silver: silverResult,
            gold: goldResult,
            status: getETLStatus()
        };
    } catch (error) {
        etlStatus.status = 'failed';
        return {
            success: false,
            error: error.message,
            status: getETLStatus()
        };
    }
};

module.exports = {
    loadToBronzeProperties,
    transformBronzeToSilver,
    refreshGoldMetrics,
    getETLStatus,
    runFullPipeline
};
