const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all orders with optional date filter
router.get('/', async (req, res) => {
    try {
        const { dateFilter } = req.query;
        let whereClause = '';

        if (dateFilter === 'today') {
            whereClause = "WHERE DATE(order_date) = CURDATE()";
        } else if (dateFilter === 'last7') {
            whereClause = "WHERE order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } else if (dateFilter === 'last30') {
            whereClause = "WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } else if (dateFilter === 'last90') {
            whereClause = "WHERE order_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
        }

        const [rows] = await db.query(
            `SELECT *, CONCAT(first_name, ' ', last_name) AS customer_name FROM customer_orders ${whereClause} ORDER BY order_date DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create order
router.post('/', async (req, res) => {
    try {
        const {
            first_name, last_name, email, phone, street_address,
            city, state_province, postal_code, country,
            product, quantity, unit_price, total_amount, status, created_by
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO customer_orders 
       (first_name, last_name, email, phone, street_address, city, state_province, postal_code, country, product, quantity, unit_price, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, phone, street_address, city, state_province, postal_code, country, product, quantity, unit_price, total_amount, status, created_by]
        );

        const [newOrder] = await db.query(
            'SELECT *, CONCAT(first_name, " ", last_name) AS customer_name FROM customer_orders WHERE id = ?',
            [result.insertId]
        );
        res.status(201).json({ success: true, data: newOrder[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT update order
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, phone, street_address,
            city, state_province, postal_code, country,
            product, quantity, unit_price, total_amount, status, created_by
        } = req.body;

        await db.query(
            `UPDATE customer_orders SET 
       first_name=?, last_name=?, email=?, phone=?, street_address=?,
       city=?, state_province=?, postal_code=?, country=?,
       product=?, quantity=?, unit_price=?, total_amount=?, status=?, created_by=?
       WHERE id=?`,
            [first_name, last_name, email, phone, street_address, city, state_province, postal_code, country, product, quantity, unit_price, total_amount, status, created_by, id]
        );

        const [updated] = await db.query(
            'SELECT *, CONCAT(first_name, " ", last_name) AS customer_name FROM customer_orders WHERE id = ?',
            [id]
        );
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM customer_orders WHERE id = ?', [id]);
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
