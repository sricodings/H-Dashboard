const express = require('express');
const router = express.Router();
const db = require('../db');

// GET dashboard config
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM dashboard_config WHERE id = 1');
        if (rows.length === 0) {
            return res.json({ success: true, data: null });
        }
        const config = JSON.parse(rows[0].layout_json);
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST save dashboard config
router.post('/', async (req, res) => {
    try {
        const { layout } = req.body;
        const layoutJson = JSON.stringify(layout);

        await db.query(
            `INSERT INTO dashboard_config (id, layout_json) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE layout_json = ?, updated_at = NOW()`,
            [layoutJson, layoutJson]
        );
        res.json({ success: true, message: 'Dashboard saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
