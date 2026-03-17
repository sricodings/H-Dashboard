const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306,
};

const databaseName = process.env.DB_NAME || 'datalens_dashboard';

const pool = mysql.createPool({
  ...dbConfig,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Auto-initialize base schema
async function initializeDB() {
  try {
    // For remote DBs, we usually connect directly to the assigned database
    // instead of attempting to create it, as permissions are restricted.
    console.log(`Connecting to database: ${databaseName}...`);

    // Initialize tables
    await pool.query(`
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
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS dashboard_config (
                id INT AUTO_INCREMENT PRIMARY KEY,
                layout_json LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    console.log('✅ Database schema verified');
  } catch (err) {
    console.error('❌ Database Initialization Error:', err.message);
  }
}

initializeDB();

module.exports = pool;
