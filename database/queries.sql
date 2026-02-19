-- Analytical Queries for BI

USE housing_bi_db;

-- 1. Total Sales vs Rentals by City
SELECT 
    l.city,
    t.transaction_type,
    COUNT(t.transaction_id) as total_transactions,
    SUM(t.price) as total_value
FROM transaction t
JOIN property p ON t.property_id = p.property_id
JOIN location l ON p.location_id = l.location_id
GROUP BY l.city, t.transaction_type;

-- 2. Top Performing Agents (by Commission Value)
-- Assuming commission is calculated on transaction price
SELECT 
    a.agent_name,
    COUNT(t.transaction_id) as deals_closed,
    SUM(t.price) as total_sales_value,
    SUM(t.price * (a.commission_percentage / 100)) as earned_commission
FROM transaction t
JOIN agent a ON t.agent_id = a.agent_id
WHERE t.transaction_type = 'Buy'
GROUP BY a.agent_id
ORDER BY earned_commission DESC;

-- 3. Average Price per SqFt for Properties Sold
SELECT 
    l.city,
    p.property_type,
    AVG(t.price / p.size_sqft) as avg_price_per_sqft
FROM transaction t
JOIN property p ON t.property_id = p.property_id
JOIN location l ON p.location_id = l.location_id
WHERE t.transaction_type = 'Buy'
GROUP BY l.city, p.property_type;

-- 4. Customer Demographics - Who is buying vs renting?
SELECT 
    c.occupation,
    t.transaction_type,
    COUNT(t.transaction_id) as count
FROM transaction t
JOIN customer c ON t.customer_id = c.customer_id
GROUP BY c.occupation, t.transaction_type;

-- 5. Monthly Sales Trend (Using Time Dimension)
SELECT 
    td.year,
    td.month,
    SUM(t.price) as monthly_sales
FROM transaction t
JOIN time_dimension td ON t.time_id = td.time_id
WHERE t.transaction_type = 'Buy'
GROUP BY td.year, td.month
ORDER BY td.year, FIELD(td.month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
