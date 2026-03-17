const express = require('express');
const router = express.Router();
const db = require('../db');
require('dotenv').config();

// AI widget generation endpoint
// Uses OpenAI if API key is set and valid, otherwise uses rule-based fallback
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        let widgetConfig = null;

        // Try OpenAI if API key exists
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            try {
                const OpenAI = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const systemPrompt = `You are a strict data visualization assistant. Based on the user's request, generate a VERY STRICT JSON configuration. Do not hallucinate fields or values.
Available widget types: bar-chart, line-chart, pie-chart, area-chart, scatter-chart, bubble-chart, table, kpi
Available data fields: product, quantity, unit_price, total_amount, status, created_by, order_date, customer_name

RESPOND ONLY WITH VALID JSON IN THIS EXACT FORMAT:
{
  "type": "bar-chart",
  "title": "Widget Title",
  "description": "Brief description",
  "xAxis": "product",
  "yAxis": "total_amount",
  "chartData": "product",
  "metric": "total_amount",
  "aggregation": "Sum",
  "columns": ["customer_name", "product", "total_amount", "status"],
  "color": "#0ea5e9",
  "showDataLabel": false,
  "showLegend": true,
  "width": 6,
  "height": 4
}

Critical Instructions:
- If asked for a bubble chart, set "type" to "bubble-chart".
- Only output the raw JSON object, no markdown formatting like \`\`\`json.`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                });

                const content = completion.choices[0].message.content.trim();
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    widgetConfig = JSON.parse(jsonMatch[0]);
                }
            } catch (openaiErr) {
                // If quota exceeded or other API error, we log and fallback silently
                console.warn('OpenAI API issue (fallback triggered):', openaiErr.status === 429 ? 'Quota Exceeded' : openaiErr.message);
            }
        }

        // Fallback: rule-based parser
        if (!widgetConfig) {
            widgetConfig = parsePromptFallback(prompt);
        }

        res.json({ success: true, data: widgetConfig, message: `Widget generated: ${widgetConfig.title}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// AI Insights endpoint
router.post('/insights', async (req, res) => {
    try {
        const { orders } = req.body;

        if (!orders || orders.length === 0) {
            return res.json({ success: true, insights: ['No data available for analysis. Start by adding some orders!'] });
        }

        let insights = [];

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            try {
                const OpenAI = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const summary = {
                    totalOrders: orders.length,
                    totalRevenue: orders.reduce((s, o) => s + parseFloat(o.total_amount), 0).toFixed(2),
                    avgOrderValue: (orders.reduce((s, o) => s + parseFloat(o.total_amount), 0) / orders.length).toFixed(2),
                    statusBreakdown: orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}),
                    topProduct: Object.entries(orders.reduce((acc, o) => { acc[o.product] = (acc[o.product] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                };

                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { 
                            role: 'system', 
                            content: 'You are a predictive business analyst. Generate 3 concise, highly professional insights. One must be a PREDICTION about future performance based on current trends. One should highlight an optimization opportunity. Return as a JSON array of 3 strings.' 
                        },
                        { role: 'user', content: `Analyze this summary and predict next month: ${JSON.stringify(summary)}` }
                    ],
                    temperature: 0.7,
                    max_tokens: 400,
                });

                const content = completion.choices[0].message.content.trim();
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
            } catch (e) {
                insights = generateLocalInsights(orders);
            }
        } else {
            insights = generateLocalInsights(orders);
        }

        res.json({ success: true, insights });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Data Seeding endpoint
router.post('/seed', async (req, res) => {
    try {
        const sampleProducts = ['Ultra Laptop Pro', 'Smart Watch Series 5', 'Noise Cancelling Headphones', '4K Desktop Monitor', 'Mechanical Keyboard RGB', 'Wireless Gaming Mouse', 'Portable SSD 2TB', 'Smart Home Hub'];
        const sampleNames = [
            { f: 'Alex', l: 'Rivers' }, { f: 'Jordan', l: 'Smith' }, { f: 'Casey', l: 'Johnson' },
            { f: 'Morgan', l: 'Lee' }, { f: 'Taylor', l: 'Brown' }, { f: 'Riley', l: 'Davis' },
            { f: 'Quinn', l: 'Miller' }, { f: 'Skyler', l: 'Wilson' }
        ];
        const statuses = ['Pending', 'In progress', 'Completed'];
        const agents = ['AI Assistant', 'System Bot', 'Admin Panel'];

        // Clear existing data? Uncomment if preferred
        // await db.query('DELETE FROM customer_orders');

        const values = [];
        for (let i = 0; i < 20; i++) {
            const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
            const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
            const qty = Math.floor(Math.random() * 5) + 1;
            const price = (Math.random() * 500 + 50).toFixed(2);
            const total = (qty * price).toFixed(2);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const agent = agents[Math.floor(Math.random() * agents.length)];
            const email = `${name.f.toLowerCase()}@example.com`;

            values.push([
                name.f, name.l, email, '555-0100', '123 Tech Lane', 'Silicon Valley', 'CA', '94025', 'USA',
                product, qty, price, total, status, agent
            ]);
        }

        await db.query(
            `INSERT INTO customer_orders 
            (first_name, last_name, email, phone, street_address, city, state_province, postal_code, country, product, quantity, unit_price, total_amount, status, created_by)
            VALUES ?`,
            [values]
        );

        res.json({ success: true, message: '20 sample orders seeded successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

function generateLocalInsights(orders) {
    const total = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
    const avg = (total / orders.length).toFixed(2);
    const completed = orders.filter(o => o.status === 'Completed').length;
    
    // Simple predictive logic: compare first half vs second half if possible
    let trendMsg = "Steady performance observed.";
    if (orders.length >= 4) {
        const mid = Math.floor(orders.length / 2);
        const firstHalf = orders.slice(0, mid).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        const secondHalf = orders.slice(mid).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        if (secondHalf > firstHalf) trendMsg = "📈 Upside Trend: Sales are accelerating. Expect 10-15% growth if current momentum persists.";
        else trendMsg = "📉 Predictive Alert: Recent volume is cooling. Strategy adjustment recommended to maintain targets.";
    }

    const topProduct = Object.entries(orders.reduce((acc, o) => { acc[o.product] = (acc[o.product] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return [
        `📊 Overview: Total revenue is $${total.toLocaleString()} across ${orders.length} transactions.`,
        trendMsg,
        `🏆 Asset Focus: "${topProduct}" remains your primary driver. Consider cross-selling to boost Average Order Value ($${avg}).`
    ];
}

function parsePromptFallback(prompt) {
    const p = prompt.toLowerCase();

    // Detect chart type
    let type = 'bar-chart';
    if (p.includes('bubble')) type = 'bubble-chart';
    else if (p.includes('line')) type = 'line-chart';
    else if (p.includes('pie') || p.includes('donut')) type = 'pie-chart';
    else if (p.includes('area')) type = 'area-chart';
    else if (p.includes('scatter')) type = 'scatter-chart';
    else if (p.includes('table') || p.includes('list')) type = 'table';
    else if (p.includes('kpi') || p.includes('total') || p.includes('count') || p.includes('sum') || p.includes('average')) type = 'kpi';

    // Detect metrics
    let metric = 'total_amount';
    if (p.includes('quantity')) metric = 'quantity';
    else if (p.includes('revenue') || p.includes('amount') || p.includes('sales')) metric = 'total_amount';
    else if (p.includes('price') || p.includes('unit')) metric = 'unit_price';

    // Detect x-axis
    let xAxis = 'product';
    if (p.includes('status')) xAxis = 'status';
    else if (p.includes('agent') || p.includes('created by') || p.includes('sales person')) xAxis = 'created_by';
    else if (p.includes('country')) xAxis = 'country';
    else if (p.includes('date') || p.includes('time') || p.includes('month')) xAxis = 'order_date';
    else if (p.includes('customer')) xAxis = 'customer_name';

    // Generate title
    const titles = {
        'bar-chart': `${capitalize(metric.replace('_', ' '))} by ${capitalize(xAxis.replace('_', ' '))} (Bar)`,
        'line-chart': `${capitalize(metric.replace('_', ' '))} Trend over ${capitalize(xAxis.replace('_', ' '))}`,
        'pie-chart': `${capitalize(xAxis.replace('_', ' '))} Distribution`,
        'area-chart': `${capitalize(metric.replace('_', ' '))} Growth`,
        'scatter-chart': `${capitalize(metric.replace('_', ' '))} Correlation`,
        'bubble-chart': `${capitalize(metric.replace('_', ' '))} Bubble Analysis`,
        'table': 'Order Details Grid',
        'kpi': `Total ${capitalize(metric.replace('_', ' '))}`,
    };

    return {
        type,
        title: titles[type] || 'Intelligent Widget',
        description: `Generated based on: "${prompt}"`,
        xAxis,
        yAxis: metric,
        chartData: xAxis,
        metric,
        aggregation: metric === 'total_amount' || metric === 'quantity' || metric === 'unit_price' ? 'Sum' : 'Count',
        columns: ['customer_name', 'product', 'quantity', 'total_amount', 'status'],
        color: '#6366f1',
        showDataLabel: false,
        showLegend: true,
        width: type === 'kpi' ? 3 : 6,
        height: type === 'kpi' ? 2 : 4,
    };
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// AI Chart Explainer endpoint
router.post('/explain-chart', async (req, res) => {
    try {
        const { config, data } = req.body;

        if (!data || data.length === 0) {
            return res.json({ success: true, data: 'No data available to explain.' });
        }

        let explanation = 'This chart displays the relationship between the selected metrics, showing trends and distributions based on your data.';

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            try {
                const OpenAI = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const systemPrompt = 'You are an expert data analyst. The user will provide chart configuration and a sample of the data. Provide a single, concise paragraph explaining what the chart shows, highlighting any obvious trends or outliers. Keep it under 50 words.';
                const userPrompt = `Chart type: ${config?.type}. Data: ${JSON.stringify(data.slice(0, 10))}`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 150,
                });

                explanation = completion.choices[0].message.content.trim();
            } catch (err) {
                console.warn('OpenAI error during explanation:', err.message);
            }
        } else {
            // Simple rule-based explanation if no AI
            const topItem = [...data].sort((a,b) => b.value - a.value)[0];
            if (topItem && topItem.label) {
                explanation = `This ${config?.type || 'chart'} indicates that ${topItem.label} is a significant contributor with a value of ${topItem.value}. The dataset shows variance across different categories.`;
            }
        }

        res.json({ success: true, data: explanation });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
