-- EstateBI Seed Data - Chennai & Salem Housing Data
-- Run this after schema.sql

USE estatebi;

-- Insert default admin user (password: admin123 - bcrypt hashed)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@estatebi.com', '$2b$10$rQZ5QNsKbCvGqW8h1hJVxOz5R5X1eNqk5F6AqKnXhZ9yY8Y5Q5H.W', 'admin'),
('Arjun S', 'arjun@estatebi.com', '$2b$10$rQZ5QNsKbCvGqW8h1hJVxOz5R5X1eNqk5F6AqKnXhZ9yY8Y5Q5H.W', 'analyst');

-- Insert Regions for Chennai
INSERT INTO regions (name, city, state, pincode) VALUES
('T. Nagar', 'Chennai', 'Tamil Nadu', '600017'),
('Adyar', 'Chennai', 'Tamil Nadu', '600020'),
('Anna Nagar', 'Chennai', 'Tamil Nadu', '600040'),
('Velachery', 'Chennai', 'Tamil Nadu', '600042'),
('OMR', 'Chennai', 'Tamil Nadu', '600097'),
('Porur', 'Chennai', 'Tamil Nadu', '600116'),
('Tambaram', 'Chennai', 'Tamil Nadu', '600045'),
('Guindy', 'Chennai', 'Tamil Nadu', '600032'),
('Mylapore', 'Chennai', 'Tamil Nadu', '600004'),
('Nungambakkam', 'Chennai', 'Tamil Nadu', '600034');

-- Insert Regions for Salem
INSERT INTO regions (name, city, state, pincode) VALUES
('Fairlands', 'Salem', 'Tamil Nadu', '636016'),
('Hasthampatti', 'Salem', 'Tamil Nadu', '636001'),
('Shevapet', 'Salem', 'Tamil Nadu', '636002'),
('Suramangalam', 'Salem', 'Tamil Nadu', '636005'),
('Ammapet', 'Salem', 'Tamil Nadu', '636003'),
('Kondalampatti', 'Salem', 'Tamil Nadu', '636010'),
('Attur Road', 'Salem', 'Tamil Nadu', '636004'),
('Omalur Road', 'Salem', 'Tamil Nadu', '636009');

-- Insert Chennai Properties
INSERT INTO properties (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description) VALUES
('CHN001', '12 GN Chetty Road', 'Chennai', 1, 'Residential', 'Active', 15000000, 1800, 3, 2.0, 2018, '3BHK Apartment in prime T. Nagar location'),
('CHN002', '45 Kasturi Rangan Road', 'Chennai', 2, 'Residential', 'Sold', 22000000, 2200, 4, 3.0, 2020, 'Luxury 4BHK Villa in Adyar'),
('CHN003', '78 2nd Avenue', 'Chennai', 3, 'Residential', 'Active', 8500000, 1200, 2, 2.0, 2019, 'Modern 2BHK flat in Anna Nagar'),
('CHN004', '23 Velachery Main Road', 'Chennai', 4, 'Commercial', 'Active', 45000000, 5000, 0, 2.0, 2021, 'Commercial space in IT corridor'),
('CHN005', '156 Rajiv Gandhi Salai', 'Chennai', 5, 'Commercial', 'Pending', 85000000, 10000, 0, 4.0, 2022, 'Office space in OMR Tech Park'),
('CHN006', '89 Porur Gardens', 'Chennai', 6, 'Residential', 'Active', 6500000, 1100, 2, 1.0, 2017, 'Affordable 2BHK in Porur'),
('CHN007', '34 Tambaram East', 'Chennai', 7, 'Residential', 'Active', 4500000, 900, 2, 1.0, 2016, 'Budget-friendly apartment'),
('CHN008', '67 Mount Road', 'Chennai', 8, 'Commercial', 'Sold', 125000000, 15000, 0, 6.0, 2020, 'Premium commercial complex'),
('CHN009', '11 San Thome High Road', 'Chennai', 9, 'Residential', 'Active', 18500000, 2000, 3, 2.5, 2019, 'Heritage style 3BHK'),
('CHN010', '45 Khader Nawaz Khan Road', 'Chennai', 10, 'Residential', 'Pending', 35000000, 3500, 4, 4.0, 2021, 'Penthouse in Nungambakkam'),
('CHN011', '22 Cathedral Road', 'Chennai', 10, 'Commercial', 'Active', 95000000, 8000, 0, 3.0, 2022, 'Office building'),
('CHN012', '78 ECR', 'Chennai', 5, 'Land', 'Active', 25000000, 4800, 0, 0.0, NULL, 'Plot near IT Park'),
('CHN013', '33 Thiruvanmiyur', 'Chennai', 2, 'Residential', 'Active', 12000000, 1500, 3, 2.0, 2020, '3BHK with sea view'),
('CHN014', '55 Mogappair', 'Chennai', 3, 'Residential', 'Sold', 7200000, 1150, 2, 2.0, 2018, 'Well-connected 2BHK'),
('CHN015', '99 Chromepet', 'Chennai', 7, 'Residential', 'Active', 5800000, 1050, 2, 2.0, 2019, 'Metro-adjacent flat');

-- Insert Salem Properties
INSERT INTO properties (property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description) VALUES
('SLM001', '12 Main Road, Fairlands', 'Salem', 11, 'Residential', 'Active', 4500000, 1400, 3, 2.0, 2019, '3BHK independent house'),
('SLM002', '45 Bus Stand Road', 'Salem', 12, 'Commercial', 'Active', 15000000, 3000, 0, 2.0, 2020, 'Commercial complex near bus stand'),
('SLM003', '78 Shevapet Main', 'Salem', 13, 'Residential', 'Sold', 3200000, 1100, 2, 1.0, 2017, '2BHK in city center'),
('SLM004', '23 Suramangalam', 'Salem', 14, 'Land', 'Active', 8000000, 5000, 0, 0.0, NULL, 'Residential plot'),
('SLM005', '56 Ammapet Extension', 'Salem', 15, 'Residential', 'Active', 2800000, 950, 2, 1.0, 2018, 'Affordable 2BHK'),
('SLM006', '89 Kondalampatti Road', 'Salem', 16, 'Land', 'Pending', 12000000, 10000, 0, 0.0, NULL, 'Large plot near highway'),
('SLM007', '34 Attur Road', 'Salem', 17, 'Residential', 'Active', 5500000, 1600, 3, 2.0, 2021, 'Newly built 3BHK'),
('SLM008', '67 Omalur Road', 'Salem', 18, 'Commercial', 'Active', 22000000, 4500, 0, 2.0, 2022, 'Showroom space'),
('SLM009', '11 Junction Road', 'Salem', 12, 'Commercial', 'Sold', 8500000, 2000, 0, 1.0, 2019, 'Shop complex'),
('SLM010', '45 Five Roads', 'Salem', 13, 'Residential', 'Active', 6200000, 1350, 3, 2.0, 2020, '3BHK apartment'),
('SLM011', '22 Steel Plant Road', 'Salem', 14, 'Residential', 'Active', 3800000, 1200, 2, 2.0, 2018, '2BHK near industrial area'),
('SLM012', '78 Yercaud Foothills', 'Salem', 16, 'Land', 'Active', 35000000, 20000, 0, 0.0, NULL, 'Hill-view plot');

-- Insert Transactions
INSERT INTO transactions (property_id, amount, transaction_date, status, buyer_name, buyer_email, notes) VALUES
(2, 22000000, '2024-01-15', 'Completed', 'Rajesh Kumar', 'rajesh@email.com', 'Full payment received'),
(8, 125000000, '2024-02-20', 'Completed', 'ABC Corp', 'finance@abccorp.com', 'Corporate purchase'),
(14, 7200000, '2024-03-10', 'Completed', 'Priya Sharma', 'priya@email.com', 'Home loan'),
(18, 3200000, '2024-01-25', 'Completed', 'Suresh M', 'suresh@email.com', 'Cash payment'),
(24, 8500000, '2024-02-28', 'Completed', 'Salem Traders', 'info@salemtraders.com', 'Business expansion'),
(5, 85000000, '2024-04-05', 'Pending', 'Tech Solutions', 'cfo@techsol.com', 'Due diligence in progress'),
(10, 35000000, '2024-04-15', 'Pending', 'Vikram Rao', 'vikram@email.com', 'Negotiation phase'),
(21, 12000000, '2024-03-20', 'Pending', 'Steel Corp', 'purchase@steelcorp.com', 'Awaiting approval'),
(1, 15000000, '2024-05-01', 'Pending', 'Anita Singh', 'anita@email.com', 'Bank approval pending'),
(15, 5800000, '2024-04-25', 'Pending', 'Karthik R', 'karthik@email.com', 'Documentation in progress');

-- Insert Daily Metrics (last 30 days sample)
INSERT INTO daily_metrics (date, city, total_inventory, avg_price, total_sales, total_revenue) VALUES
('2024-04-01', 'Chennai', 142, 28500000, 8, 228000000),
('2024-04-01', 'Salem', 65, 8200000, 4, 32800000),
('2024-04-08', 'Chennai', 145, 29000000, 12, 348000000),
('2024-04-08', 'Salem', 68, 8500000, 6, 51000000),
('2024-04-15', 'Chennai', 148, 29200000, 10, 292000000),
('2024-04-15', 'Salem', 70, 8800000, 5, 44000000),
('2024-04-22', 'Chennai', 150, 29500000, 15, 442500000),
('2024-04-22', 'Salem', 72, 9000000, 7, 63000000),
('2024-04-29', 'Chennai', 152, 30000000, 11, 330000000),
('2024-04-29', 'Salem', 75, 9200000, 8, 73600000);

-- Insert initial logs
INSERT INTO logs (user_id, event, details) VALUES
(1, 'System Initialized', 'EstateBI system initialized with Chennai and Salem data'),
(1, 'Data Import', 'Imported 27 properties from seed data'),
(1, 'Schema Update', 'Database schema updated to v2.0');

-- Insert sample upload history
INSERT INTO upload_history (user_id, filename, file_type, records_processed, records_failed, status) VALUES
(1, 'chennai_properties_2024.csv', 'CSV', 15, 0, 'Success'),
(1, 'salem_properties_2024.csv', 'CSV', 12, 0, 'Success'),
(1, 'transactions_q1_2024.json', 'JSON', 10, 0, 'Success');
