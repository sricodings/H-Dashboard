CREATE DATABASE IF NOT EXISTS datalens_dashboard;
USE datalens_dashboard;

CREATE TABLE IF NOT EXISTS customer_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) NOT NULL,
  product VARCHAR(150) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','In progress','Completed') DEFAULT 'Pending',
  created_by VARCHAR(100) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_config (
  id INT PRIMARY KEY DEFAULT 1,
  layout_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data for better demo experience
INSERT INTO customer_orders (first_name, last_name, email, phone, street_address, city, state_province, postal_code, country, product, quantity, unit_price, total_amount, status, created_by) VALUES
('John', 'Smith', 'john.smith@email.com', '555-0101', '123 Main St', 'New York', 'New York', '10001', 'United States', 'Fiber Internet 1 Gbps', 2, 89.99, 179.98, 'Completed', 'Mr. Michael Harris'),
('Sarah', 'Johnson', 'sarah.j@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'California', '90001', 'United States', '5G Unlimited Mobile Plan', 3, 45.00, 135.00, 'In progress', 'Ms. Olivia Carter'),
('Mike', 'Williams', 'mike.w@email.com', '555-0103', '789 Pine Rd', 'Toronto', 'Ontario', 'M5H 2N2', 'Canada', 'Fiber Internet 300 Mbps', 1, 59.99, 59.99, 'Pending', 'Mr. Ryan Cooper'),
('Emily', 'Davis', 'emily.d@email.com', '555-0104', '321 Elm St', 'Sydney', 'NSW', '2000', 'Australia', 'Business Internet 500 Mbps', 5, 129.99, 649.95, 'Completed', 'Mr. Lucas Martin'),
('David', 'Brown', 'david.b@email.com', '555-0105', '654 Maple Dr', 'Singapore', 'Central', '018956', 'Singapore', 'VoIP Corporate Package', 10, 199.99, 1999.90, 'In progress', 'Mr. Michael Harris'),
('Lisa', 'Miller', 'lisa.m@email.com', '555-0106', '987 Cedar Ln', 'Hong Kong', 'Kowloon', 'KLN', 'Hong Kong', 'Fiber Internet 1 Gbps', 2, 89.99, 179.98, 'Pending', 'Ms. Olivia Carter'),
('James', 'Wilson', 'james.w@email.com', '555-0107', '147 Birch Blvd', 'Chicago', 'Illinois', '60601', 'United States', '5G Unlimited Mobile Plan', 4, 45.00, 180.00, 'Completed', 'Mr. Ryan Cooper'),
('Emma', 'Moore', 'emma.m@email.com', '555-0108', '258 Spruce Way', 'Melbourne', 'Victoria', '3000', 'Australia', 'Fiber Internet 300 Mbps', 1, 59.99, 59.99, 'In progress', 'Mr. Lucas Martin'),
('Robert', 'Taylor', 'robert.t@email.com', '555-0109', '369 Willow Ave', 'Vancouver', 'BC', 'V6B 1A1', 'Canada', 'Business Internet 500 Mbps', 3, 129.99, 389.97, 'Completed', 'Mr. Michael Harris'),
('Jennifer', 'Anderson', 'jennifer.a@email.com', '555-0110', '741 Ash St', 'Houston', 'Texas', '77001', 'United States', 'VoIP Corporate Package', 2, 199.99, 399.98, 'Pending', 'Ms. Olivia Carter');
