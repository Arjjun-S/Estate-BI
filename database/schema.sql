-- EstateBI Database Schema
-- Production-Ready for Chennai & Salem Housing Data

CREATE DATABASE IF NOT EXISTS estatebi;
USE estatebi;

-- Drop tables if exist (for clean rebuild)
DROP TABLE IF EXISTS daily_metrics;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS upload_history;

-- 1. Users Table (Authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst') DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Regions Table
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_region_city (name, city)
);

-- 3. Properties Table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_code VARCHAR(20) UNIQUE,
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region_id INT,
    type ENUM('Residential', 'Commercial', 'Land') DEFAULT 'Residential',
    status ENUM('Active', 'Sold', 'Pending') DEFAULT 'Active',
    price DECIMAL(15, 2) NOT NULL,
    sqft INT,
    bedrooms INT DEFAULT 0,
    bathrooms DECIMAL(3, 1) DEFAULT 0,
    year_built INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);

-- 4. Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    status ENUM('Completed', 'Pending', 'Cancelled') DEFAULT 'Pending',
    buyer_name VARCHAR(100),
    buyer_email VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 5. Daily Metrics Table (for dashboard analytics)
CREATE TABLE daily_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    city VARCHAR(100),
    total_inventory INT DEFAULT 0,
    avg_price DECIMAL(15, 2) DEFAULT 0,
    total_sales INT DEFAULT 0,
    total_revenue DECIMAL(18, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_city (date, city)
);

-- 6. System Logs Table
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Upload History Table
CREATE TABLE upload_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    records_processed INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    status ENUM('Success', 'Failed', 'Processing') DEFAULT 'Processing',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);
