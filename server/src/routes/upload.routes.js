const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { query, transaction } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { preprocessData, validateRow } = require('../services/preprocess');
const { loadToBronzeProperties, transformBronzeToSilver, refreshGoldMetrics, getETLStatus } = require('../services/etl');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../..', 'data', 'raw');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.csv', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and JSON files are allowed'));
        }
    }
});

// POST /api/upload/ - Upload and process data file
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileExt = path.extname(fileName).toLowerCase();
        
        let records = [];
        let processedCount = 0;
        let failedCount = 0;
        const errors = [];
        
        // Parse file based on type
        if (fileExt === '.csv') {
            records = await parseCSV(filePath);
        } else if (fileExt === '.json') {
            const content = fs.readFileSync(filePath, 'utf-8');
            records = JSON.parse(content);
            if (!Array.isArray(records)) {
                records = [records];
            }
        }
        
        // Preprocess and insert data
        for (const row of records) {
            try {
                const processedRow = preprocessData(row);
                const validation = validateRow(processedRow);
                
                if (!validation.valid) {
                    failedCount++;
                    errors.push({ row, errors: validation.errors });
                    continue;
                }
                
                // Insert into database
                await insertProperty(processedRow);
                processedCount++;
            } catch (err) {
                failedCount++;
                errors.push({ row, error: err.message });
            }
        }
        
        // Log the upload
        const userId = req.user?.id || 1;
        await query(
            `INSERT INTO upload_history (user_id, filename, file_type, records_processed, records_failed, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, fileName, fileExt.replace('.', '').toUpperCase(), processedCount, failedCount, 
             failedCount === 0 ? 'Success' : (processedCount > 0 ? 'Partial' : 'Failed')]
        );
        
        // Move to processed folder
        const processedDir = path.join(__dirname, '../../..', 'data', 'processed');
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true });
        }
        const newPath = path.join(processedDir, path.basename(filePath));
        fs.renameSync(filePath, newPath);
        
        res.json({
            message: 'File processed successfully',
            filename: fileName,
            total: records.length,
            processed: processedCount,
            failed: failedCount,
            errors: errors.slice(0, 10) // Return first 10 errors
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process upload', message: error.message });
    }
});

// GET /api/upload/history - Get upload history
router.get('/history', async (req, res) => {
    try {
        const history = await query(`
            SELECT 
                id,
                filename,
                file_type,
                records_processed,
                records_failed,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as timestamp
            FROM upload_history
            ORDER BY created_at DESC
            LIMIT 20
        `);
        
        // If no data, return sample
        if (history.length === 0) {
            return res.json([
                { id: 1, filename: 'chennai_properties.csv', timestamp: '2024-04-15 10:30:00', status: 'Success' },
                { id: 2, filename: 'salem_data.json', timestamp: '2024-04-14 15:20:00', status: 'Success' }
            ]);
        }
        
        res.json(history);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch upload history' });
    }
});

// GET /api/upload/template - Download template file
router.get('/template', (req, res) => {
    const template = `property_code,address,city,region,type,status,price,sqft,bedrooms,bathrooms,year_built,description
CHN001,123 Example Road,Chennai,T. Nagar,Residential,Active,15000000,1800,3,2,2020,Sample property description
SLM001,456 Sample Street,Salem,Fairlands,Commercial,Active,8000000,2500,0,1,2019,Commercial space`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=property_template.csv');
    res.send(template);
});

// ============================================================================
// MEDALLION ARCHITECTURE ENDPOINTS
// ============================================================================

// POST /api/upload/bronze - Upload data directly to Bronze layer
router.post('/bronze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileExt = path.extname(fileName).toLowerCase();
        
        let records = [];
        
        // Parse file
        if (fileExt === '.csv') {
            records = await parseCSV(filePath);
        } else if (fileExt === '.json') {
            const content = fs.readFileSync(filePath, 'utf-8');
            records = JSON.parse(content);
            if (!Array.isArray(records)) {
                records = [records];
            }
        }
        
        const userId = req.user?.id || 1;
        
        // Load to Bronze layer
        const result = await loadToBronzeProperties(records, fileName, userId);
        
        // Move file to processed folder
        const processedDir = path.join(__dirname, '../../..', 'data', 'processed');
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true });
        }
        fs.renameSync(filePath, path.join(processedDir, path.basename(filePath)));
        
        res.json({
            message: 'Data loaded to Bronze layer',
            layer: 'Bronze',
            importId: result.importId,
            total: result.total,
            loaded: result.loaded,
            failed: result.failed
        });
    } catch (error) {
        console.error('Bronze upload error:', error);
        res.status(500).json({ error: 'Failed to load to Bronze layer', message: error.message });
    }
});

// POST /api/upload/transform - Transform Bronze to Silver
router.post('/transform', async (req, res) => {
    try {
        const { importId } = req.body;
        
        const result = await transformBronzeToSilver(importId);
        
        // Log the transformation
        await query(
            `INSERT INTO logs (event, event_type, details) VALUES (?, ?, ?)`,
            ['ETL Transform', 'INFO', JSON.stringify(result)]
        );
        
        res.json({
            message: 'Bronze to Silver transformation complete',
            processed: result.processed,
            errors: result.errors,
            total: result.total
        });
    } catch (error) {
        console.error('Transform error:', error);
        res.status(500).json({ error: 'Failed to transform data', message: error.message });
    }
});

// POST /api/upload/refresh-gold - Refresh Gold layer aggregations
router.post('/refresh-gold', async (req, res) => {
    try {
        const { date } = req.body;
        
        const result = await refreshGoldMetrics(date);
        
        // Log the refresh
        await query(
            `INSERT INTO logs (event, event_type, details) VALUES (?, ?, ?)`,
            ['Gold Refresh', 'INFO', JSON.stringify(result)]
        );
        
        res.json({
            message: 'Gold layer refreshed',
            date: result.date,
            cities: result.cities
        });
    } catch (error) {
        console.error('Gold refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh Gold layer', message: error.message });
    }
});

// GET /api/upload/etl-status - Get ETL pipeline status
router.get('/etl-status', async (req, res) => {
    try {
        const status = await getETLStatus();
        res.json(status);
    } catch (error) {
        console.error('ETL status error:', error);
        res.status(500).json({ error: 'Failed to get ETL status', message: error.message });
    }
});

// POST /api/upload/full-pipeline - Run complete ETL pipeline (Bronze -> Silver -> Gold)
router.post('/full-pipeline', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileExt = path.extname(fileName).toLowerCase();
        const userId = req.user?.id || 1;
        
        // Parse file
        let records = [];
        if (fileExt === '.csv') {
            records = await parseCSV(filePath);
        } else if (fileExt === '.json') {
            const content = fs.readFileSync(filePath, 'utf-8');
            records = JSON.parse(content);
            if (!Array.isArray(records)) records = [records];
        }
        
        // Step 1: Load to Bronze
        const bronzeResult = await loadToBronzeProperties(records, fileName, userId);
        
        // Step 2: Transform to Silver
        const silverResult = await transformBronzeToSilver(bronzeResult.importId);
        
        // Step 3: Refresh Gold
        const goldResult = await refreshGoldMetrics();
        
        // Move file to processed folder
        const processedDir = path.join(__dirname, '../../..', 'data', 'processed');
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true });
        }
        fs.renameSync(filePath, path.join(processedDir, path.basename(filePath)));
        
        // Log the complete pipeline
        await query(
            `INSERT INTO logs (user_id, event, event_type, details) VALUES (?, ?, ?, ?)`,
            [userId, 'Full ETL Pipeline', 'INFO', JSON.stringify({ bronzeResult, silverResult, goldResult })]
        );
        
        res.json({
            message: 'Full ETL pipeline completed successfully',
            pipeline: {
                bronze: {
                    importId: bronzeResult.importId,
                    loaded: bronzeResult.loaded,
                    failed: bronzeResult.failed
                },
                silver: {
                    processed: silverResult.processed,
                    errors: silverResult.errors
                },
                gold: {
                    date: goldResult.date,
                    cities: goldResult.cities
                }
            }
        });
    } catch (error) {
        console.error('Full pipeline error:', error);
        res.status(500).json({ error: 'ETL pipeline failed', message: error.message });
    }
});

// Helper: Parse CSV file
async function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];
        fs.createReadStream(filePath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                trim: true
            }))
            .on('data', (row) => records.push(row))
            .on('error', reject)
            .on('end', () => resolve(records));
    });
}

// Helper: Insert property into database
async function insertProperty(data) {
    // First, ensure region exists
    let regionId = null;
    
    if (data.region && data.city) {
        const existingRegion = await query(
            'SELECT id FROM regions WHERE name = ? AND city = ?',
            [data.region, data.city]
        );
        
        if (existingRegion.length > 0) {
            regionId = existingRegion[0].id;
        } else {
            const result = await query(
                'INSERT INTO regions (name, city) VALUES (?, ?)',
                [data.region, data.city]
            );
            regionId = result.insertId;
        }
    }
    
    // Check for duplicate property_code
    if (data.property_code) {
        const existing = await query(
            'SELECT id FROM properties WHERE property_code = ?',
            [data.property_code]
        );
        
        if (existing.length > 0) {
            // Update existing property
            await query(`
                UPDATE properties SET
                    address = ?, city = ?, region_id = ?, type = ?, status = ?,
                    price = ?, sqft = ?, bedrooms = ?, bathrooms = ?, year_built = ?,
                    description = ?, updated_at = NOW()
                WHERE property_code = ?
            `, [
                data.address, data.city, regionId, data.type, data.status,
                data.price, data.sqft, data.bedrooms, data.bathrooms, data.year_built,
                data.description, data.property_code
            ]);
            return;
        }
    }
    
    // Insert new property
    await query(`
        INSERT INTO properties 
        (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.property_code || `PROP${Date.now()}`,
        data.address,
        data.city,
        regionId,
        data.type,
        data.status,
        data.price,
        data.sqft,
        data.bedrooms,
        data.bathrooms,
        data.year_built,
        data.description
    ]);
}

module.exports = router;
