// Data processor utility for widget computations

export function processChartData(orders, xAxis, yAxis) {
    if (!orders || orders.length === 0) return [];

    const grouped = {};
    orders.forEach(o => {
        const x = o[xAxis] || 'Unknown';
        const y = parseFloat(o[yAxis] || 0);
        if (!grouped[x]) grouped[x] = { x, y: 0, count: 0 };
        grouped[x].y += isNaN(y) ? 1 : y;
        grouped[x].count++;
    });

    return Object.values(grouped).slice(0, 10);
}

export function processKPIData(orders, metric, aggregation, decimals = 0, dataFormat = 'Number') {
    if (!orders || orders.length === 0) return 0;

    const NUMERIC_FIELDS = ['total_amount', 'unit_price', 'quantity'];
    const isNumeric = NUMERIC_FIELDS.includes(metric);

    let result;

    if (aggregation === 'Count' || !isNumeric) {
        result = orders.length;
    } else if (aggregation === 'Sum') {
        result = orders.reduce((s, o) => s + parseFloat(o[metric] || 0), 0);
    } else if (aggregation === 'Average') {
        result = orders.length ? orders.reduce((s, o) => s + parseFloat(o[metric] || 0), 0) / orders.length : 0;
    } else {
        result = orders.length;
    }

    const formatted = parseFloat(result).toFixed(decimals);
    if (dataFormat === 'Currency') return `$${Number(formatted).toLocaleString()}`;
    return Number(formatted).toLocaleString();
}

export function getAggregatedStat(orders, field, agg) {
    if (!orders || orders.length === 0) return 0;
    const vals = orders.map(o => parseFloat(o[field] || 0));
    if (agg === 'Sum') return vals.reduce((a, b) => a + b, 0);
    if (agg === 'Average') return vals.reduce((a, b) => a + b, 0) / vals.length;
    return orders.length;
}
