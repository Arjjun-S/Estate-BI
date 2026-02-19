require('dotenv').config({ path: '../server/.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'housing_bi',
            multipleStatements: true
        });

        console.log('Connected to database.');

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

        await connection.query(schemaSql);

        console.log('Schema executed successfully.');

        // Seed some dummy data if empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM properties');

        if (rows[0].count === 0) {
            console.log('Seeding initial data...');
            const seedSql = `
                INSERT INTO properties (property_id, address, city, region_id, type, status, market_value, list_price, created_at) VALUES
                ('#H-49210', '123 Maple Ave', 'Springfield', 1, 'Residential', 'Sold', 429000, 435000, NOW()),
                ('#H-49211', '456 Oak Ln', 'Shelbyville', 2, 'Residential', 'Pending', 385000, 390000, NOW()),
                ('#H-49212', '789 Pine St', 'Capital City', 5, 'Commercial', 'Sold', 510000, 520000, NOW()),
                ('#H-49213', '101 Elm Blvd', 'Ogdenville', 3, 'Land', 'Active', 299000, 310000, NOW()),
                ('#H-49214', '202 Birch Rd', 'North Haverbrook', 4, 'Residential', 'Active', 650000, 660000, NOW());

                INSERT INTO transactions (property_id, transaction_date, amount, status, buyer_name) VALUES
                (1, '2023-10-24', 429000, 'Completed', 'John Doe'),
                (2, '2023-10-23', 385000, 'Pending', 'Jane Smith'),
                (3, '2023-10-23', 510000, 'Completed', 'Bob Johnson'),
                (4, '2023-10-22', 299000, 'Canceled', 'Alice Williams');
            `;
            await connection.query(seedSql);
            console.log('Seed data inserted.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error executing schema:', err);
    }
}

run();
