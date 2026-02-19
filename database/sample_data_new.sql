-- Sample Data for EstateBI
-- Chennai & Salem Real Estate Data

USE estatebi;

-- Clear existing data
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE properties;
TRUNCATE TABLE regions;
SET FOREIGN_KEY_CHECKS=1;

-- REGIONS
INSERT INTO regions (id, name, city, state, pincode) VALUES
(101, 'Kattankolathur', 'Chennai', 'Tamil Nadu', '603203'),
(102, 'Kavanur', 'Chennai', 'Tamil Nadu', '603203'),
(103, 'Ninnakarai', 'Chennai', 'Tamil Nadu', '603203'),
(104, 'Tambaram', 'Chennai', 'Tamil Nadu', '600045'),
(105, 'Velachery', 'Chennai', 'Tamil Nadu', '600042'),
(201, 'Hasthampatti', 'Salem', 'Tamil Nadu', '636007'),
(202, 'Ammapet', 'Salem', 'Tamil Nadu', '636003'),
(203, 'Sankar Nagar', 'Salem', 'Tamil Nadu', '636007'),
(204, 'Gorimedu', 'Salem', 'Tamil Nadu', '636008'),
(205, 'Attur', 'Salem', 'Tamil Nadu', '636102');

-- PROPERTIES (Chennai)
INSERT INTO properties (id, property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description) VALUES
(1, 'P001', '12, Kattankolathur Main Road', 'Chennai', 101, 'Residential', 'Active', 7000000, 1800, 3, 2, 2010, 'Spacious 3BHK semi-furnished apartment in Kattankolathur'),
(2, 'P002', 'Plot 5, Village outskirts, Kattankolathur', 'Chennai', 101, 'Land', 'Active', 20000000, 6000, 0, 0, NULL, 'Vacant residential land near Kattankolathur'),
(3, 'P003', '78, Sunshine Apartments, Kavanur Road', 'Chennai', 102, 'Residential', 'Active', 6000000, 1100, 2, 2, 2018, 'Modern 2BHK apartment in Kavanur with amenities'),
(4, 'P004', '21, Kavanur Industrial Complex, Kanchipuram', 'Chennai', 102, 'Commercial', 'Active', 15000000, 3000, 0, 1, 2015, 'Two-storey commercial building in Kavanur ideal for offices'),
(5, 'P005', '10, Lakeview Colony, Ninnakarai', 'Chennai', 103, 'Residential', 'Active', 10000000, 2500, 4, 3, 2012, 'Large 4BHK villa in Ninnakarai with private garden'),
(6, 'P006', 'Agricultural Plot 12, Ninnakarai area', 'Chennai', 103, 'Land', 'Active', 18000000, 8000, 0, 0, NULL, 'Fertile agricultural land near Ninnakarai'),
(7, 'P007', '5, Green Meadows, Tambaram', 'Chennai', 104, 'Residential', 'Active', 12000000, 1600, 3, 2, 2015, 'Newly built 3BHK house in Tambaram'),
(8, 'P008', 'Shop No. 2, GST Road, Tambaram East', 'Chennai', 104, 'Commercial', 'Active', 16000000, 2000, 0, 1, 2010, 'Commercial retail space on GST Road, Tambaram'),
(9, 'P009', 'Flat 101, Sunshine Towers, Velachery', 'Chennai', 105, 'Residential', 'Active', 10000000, 1200, 2, 2, 2020, 'Furnished 2BHK apartment in prime Velachery'),
(10, 'P010', 'Iris Business Park, Velachery OMR', 'Chennai', 105, 'Commercial', 'Active', 50000000, 4000, 0, 2, 2018, 'Multi-level office space in Velachery IT corridor');

-- PROPERTIES (Salem)
INSERT INTO properties (id, property_code, address, city, region_id, type, status, price, sqft, bedrooms, bathrooms, year_built, description) VALUES
(11, 'P011', '3, Hill View Road, Hasthampatti', 'Salem', 201, 'Residential', 'Active', 8000000, 1400, 3, 2, 2010, 'Cozy 3BHK house in central Hasthampatti'),
(12, 'P012', 'Shop 7, Market Street, Hasthampatti', 'Salem', 201, 'Commercial', 'Active', 12000000, 2500, 0, 1, 2005, 'Retail shop space on busy Market Street, Hasthampatti'),
(13, 'P013', '45, Peace Street, Ammapet', 'Salem', 202, 'Residential', 'Active', 7500000, 1000, 2, 1, 2022, 'Modern 2BHK independent house in Ammapet'),
(14, 'P014', 'Commercial Plaza, Ammapet Main Rd', 'Salem', 202, 'Commercial', 'Active', 9000000, 1800, 0, 1, 2016, 'Prime office building in Ammapet commercial district'),
(15, 'P015', 'Plot 23, Green Acres, Sankar Nagar', 'Salem', 203, 'Residential', 'Active', 12000000, 2200, 4, 3, 2015, 'Spacious 4BHK villa in gated community in Sankar Nagar'),
(16, 'P016', 'Open Plot near Lake, Sankar Nagar', 'Salem', 203, 'Land', 'Active', 9000000, 5000, 0, 0, NULL, 'Open plot with development potential in Sankar Nagar'),
(17, 'P017', '12, Sunrise Apartments, Gorimedu', 'Salem', 204, 'Residential', 'Active', 7000000, 1500, 3, 2, 2018, 'New 3BHK home in Gorimedu'),
(18, 'P018', 'Sector 8, KSR Nagar Plot, Gorimedu', 'Salem', 204, 'Land', 'Active', 10000000, 6000, 0, 0, NULL, 'Large corner plot near Gorimedu outskirts'),
(19, 'P019', '8, Lake Road, Attur', 'Salem', 205, 'Residential', 'Active', 4000000, 1200, 2, 1, 2000, 'Semi-furnished 2BHK cottage in Attur town'),
(20, 'P020', 'Attur Trade Tower, Main Rd', 'Salem', 205, 'Commercial', 'Active', 15000000, 3000, 0, 2, 2012, 'Commercial complex in Attur town center');

-- TRANSACTIONS
INSERT INTO transactions (id, property_id, buyer_name, buyer_email, transaction_date, amount, status, notes) VALUES
(1, 1, 'Ramesh Kumar', 'ramesh.k@domain.com', '2025-05-11', 7000000, 'Completed', 'Full payment received'),
(2, 2, 'Priya Sharma', 'priya.s@domain.com', '2023-03-24', 20000000, 'Cancelled', 'Buyer withdrew'),
(3, 3, 'Arjun Patel', 'arjun.p@domain.com', '2024-06-14', 6000000, 'Completed', 'Full payment received'),
(4, 4, 'Suresh Nair', 'suresh.n@domain.com', '2025-11-13', 15000000, 'Pending', 'Awaiting bank approval'),
(5, 5, 'Kavita Singh', 'kavita.s@domain.com', '2025-09-22', 10000000, 'Completed', 'Full payment received'),
(6, 6, 'Rahul Roy', 'rahul.r@domain.com', '2025-04-09', 18000000, 'Completed', 'Full payment received'),
(7, 7, 'Deepa Menon', 'deepa.m@domain.com', '2024-09-13', 12000000, 'Pending', 'Loan processing'),
(8, 8, 'Ashok Jain', 'ashok.j@domain.com', '2025-09-03', 16000000, 'Completed', 'Full payment received'),
(9, 9, 'Manish Gupta', 'manish.g@domain.com', '2025-01-03', 10000000, 'Completed', 'Full payment received'),
(10, 10, 'Anjali Desai', 'anjali.d@domain.com', '2024-03-23', 50000000, 'Cancelled', 'Project delayed'),
(11, 11, 'Vikram Reddy', 'vikram.r@domain.com', '2025-10-30', 8000000, 'Completed', 'Full payment received'),
(12, 12, 'Meena Kulkarni', 'meena.k@domain.com', '2023-10-13', 12000000, 'Pending', 'Document verification'),
(13, 13, 'Hari Sharma', 'hari.s@domain.com', '2024-07-31', 7500000, 'Completed', 'Full payment received'),
(14, 14, 'Lakshmi Iyer', 'lakshmi.i@domain.com', '2023-10-14', 9000000, 'Completed', 'Full payment received'),
(15, 15, 'Anand Rao', 'anand.r@domain.com', '2023-07-14', 12000000, 'Pending', 'Awaiting registration'),
(16, 16, 'Sunita Yadav', 'sunita.y@domain.com', '2024-05-28', 9000000, 'Completed', 'Full payment received'),
(17, 17, 'Nikhil Tiwari', 'nikhil.t@domain.com', '2025-12-26', 7000000, 'Cancelled', 'Price negotiation failed'),
(18, 18, 'Karthik Rao', 'karthik.r@domain.com', '2023-10-28', 10000000, 'Completed', 'Full payment received'),
(19, 19, 'Neeta Bose', 'neeta.b@domain.com', '2024-09-27', 4000000, 'Completed', 'Full payment received'),
(20, 20, 'Abhishek Kumar', 'abhishek.k@domain.com', '2023-07-22', 15000000, 'Completed', 'Full payment received');

-- Verify data
SELECT 'Regions' as TableName, COUNT(*) as Count FROM regions
UNION ALL
SELECT 'Properties', COUNT(*) FROM properties
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;
