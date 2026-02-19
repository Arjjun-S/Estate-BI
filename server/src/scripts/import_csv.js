const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Parse price strings like "₹1.99 Cr" or "₹48.0 L"
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const str = priceStr.replace('₹', '').trim();
    if (str.includes('Cr')) {
        return parseFloat(str.replace('Cr', '').trim()) * 10000000; // 1 Cr = 10 million
    } else if (str.includes('L')) {
        return parseFloat(str.replace('L', '').trim()) * 100000; // 1 L = 100,000
    }
    return parseFloat(str) || 0;
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Extract BHK from title like "4 BHK Flat for sale..."
function extractBHK(title) {
    const match = title.match(/(\d+)\s*BHK/i);
    return match ? parseInt(match[1]) : 2;
}

// Extract city from location string "Kanathur Reddikuppam, Chennai"
function extractCity(location) {
    if (!location) return 'Chennai';
    // Clean the location string - sometimes it has extra text
    const cleanLocation = location.split('.')[0]; // Take part before any period
    const parts = cleanLocation.split(',');
    const lastPart = parts[parts.length - 1]?.trim();
    // Only return if it looks like a city name (short, no weird chars)
    if (lastPart && lastPart.length < 50 && !lastPart.includes('BHK') && !lastPart.includes('Property')) {
        return lastPart;
    }
    return 'Chennai';
}

async function importData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'your name',
        database: process.env.DB_NAME || 'estatebi'
    });

    console.log('🔗 Connected to database');

    try {
        // Get max property code number
        const [maxResult] = await connection.execute(
            "SELECT MAX(CAST(SUBSTRING(property_code, 2) AS UNSIGNED)) as max_num FROM properties"
        );
        let propertyCounter = (maxResult[0].max_num || 0) + 1;
        
        // Track cities and regions
        const cityRegionMap = new Map();
        const [existingRegions] = await connection.execute("SELECT id, city FROM regions");
        existingRegions.forEach(r => cityRegionMap.set(r.city.toLowerCase(), r.id));

        // ========== Import Real Estate Data V21.csv ==========
        console.log('\n📁 Importing Real Estate Data V21.csv...');
        const realEstateFile = fs.readFileSync(
            path.join(__dirname, '../../../Real Estate Data V21.csv'), 
            'utf-8'
        );
        const realEstateLines = realEstateFile.split('\n').filter(l => l.trim());
        const realEstateHeaders = parseCSVLine(realEstateLines[0]);
        
        // All Real Estate Data V21 is Chennai, get or create Chennai region
        let chennaiRegionId = cityRegionMap.get('chennai');
        if (!chennaiRegionId) {
            const [result] = await connection.execute(
                "INSERT INTO regions (name, city, state) VALUES ('Chennai City', 'Chennai', 'Tamil Nadu')"
            );
            chennaiRegionId = result.insertId;
            cityRegionMap.set('chennai', chennaiRegionId);
        }
        
        let realEstateCount = 0;
        for (let i = 1; i < realEstateLines.length; i++) {
            const values = parseCSVLine(realEstateLines[i]);
            if (values.length < 5) continue;
            
            const name = values[0] || '';
            const title = values[1] || '';
            const priceStr = values[2] || '';
            const location = values[3] || 'Chennai';
            const sqft = parseInt(values[4]) || 1000;
            const baths = parseInt(values[7]) || 2;
            
            const price = parsePrice(priceStr);
            if (price === 0) continue; // Skip invalid prices
            
            const bhk = extractBHK(title);
            
            const propertyCode = `P${String(propertyCounter++).padStart(3, '0')}`;
            await connection.execute(
                `INSERT INTO properties (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, description)
                 VALUES (?, ?, 'Chennai', ?, 'Residential', 'Active', ?, ?, ?, ?, ?)`,
                [propertyCode, location.substring(0, 250), chennaiRegionId, price, sqft, bhk, baths, (name + ' - ' + title).substring(0, 200)]
            );
            realEstateCount++;
        }
        console.log(`✅ Imported ${realEstateCount} properties from Real Estate Data V21.csv`);

        // ========== Import india_housing_prices.csv (sample) ==========
        console.log('\n📁 Importing india_housing_prices.csv...');
        const indiaFile = fs.readFileSync(
            path.join(__dirname, '../../../india_housing_prices.csv'), 
            'utf-8'
        );
        const indiaLines = indiaFile.split('\n').filter(l => l.trim());
        
        // Import first 1000 records + 200 from each major city
        const majorCities = ['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad'];
        const cityImportCount = {};
        const maxPerCity = 150;
        const maxTotal = 2000;
        
        let indiaCount = 0;
        for (let i = 1; i < indiaLines.length && indiaCount < maxTotal; i++) {
            const values = parseCSVLine(indiaLines[i]);
            if (values.length < 10) continue;
            
            const state = values[1];
            const city = values[2];
            const locality = values[3];
            const propertyType = values[4];
            const bhk = parseInt(values[5]) || 2;
            const sqft = parseInt(values[6]) || 1000;
            const priceLakhs = parseFloat(values[7]) || 50;
            const yearBuilt = parseInt(values[9]) || 2020;
            const availabilityStatus = values[22];
            
            // Limit per city
            cityImportCount[city] = (cityImportCount[city] || 0) + 1;
            if (cityImportCount[city] > maxPerCity) continue;
            
            const price = priceLakhs * 100000; // Convert lakhs to rupees
            const address = `${locality}, ${city}`;
            
            // Map property type
            let type = 'Residential';
            if (propertyType === 'Commercial') type = 'Commercial';
            else if (propertyType === 'Land') type = 'Land';
            
            // Map status
            let status = 'Active';
            if (availabilityStatus === 'Under_Construction') status = 'Pending';
            else if (i % 10 === 0) status = 'Sold'; // Mark some as sold for variety
            
            // Get or create region
            let regionId = cityRegionMap.get(city.toLowerCase());
            if (!regionId) {
                const [result] = await connection.execute(
                    "INSERT INTO regions (name, city, state) VALUES (?, ?, ?)",
                    [locality.substring(0, 90), city.substring(0, 90), state.substring(0, 90)]
                );
                regionId = result.insertId;
                cityRegionMap.set(city.toLowerCase(), regionId);
            }
            
            const propertyCode = `P${String(propertyCounter++).padStart(3, '0')}`;
            await connection.execute(
                `INSERT INTO properties (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [propertyCode, address, city, regionId, type, status, price, sqft, bhk, Math.ceil(bhk * 0.7), yearBuilt, `${bhk} BHK ${propertyType} in ${locality}`]
            );
            indiaCount++;
            
            if (indiaCount % 500 === 0) {
                console.log(`  Imported ${indiaCount} records...`);
            }
        }
        console.log(`✅ Imported ${indiaCount} properties from india_housing_prices.csv`);
        
        // Show summary by city
        console.log('\n📊 Import Summary by City:');
        const [cityStats] = await connection.execute(
            "SELECT city, COUNT(*) as count FROM properties GROUP BY city ORDER BY count DESC LIMIT 15"
        );
        cityStats.forEach(row => console.log(`  ${row.city}: ${row.count} properties`));
        
        const [totalProps] = await connection.execute("SELECT COUNT(*) as total FROM properties");
        console.log(`\n🏠 Total properties in database: ${totalProps[0].total}`);
        
    } catch (error) {
        console.error('❌ Import error:', error);
    } finally {
        await connection.end();
        console.log('\n✅ Import completed!');
    }
}

importData();
