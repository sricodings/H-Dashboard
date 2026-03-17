const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRouter = require('./routes/orders');
const dashboardRouter = require('./routes/dashboard');
const aiRouter = require('./routes/ai');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database connection test
db.getConnection()
    .then(conn => {
        console.log('✅ Connected to MySQL Database');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed. Please ensure MySQL is running and credentials in .env are correct.');
        console.error('Error Details:', err.message);
    });

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Export app for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Datalens Dashboard Backend running on port ${PORT}`);
    });
}
