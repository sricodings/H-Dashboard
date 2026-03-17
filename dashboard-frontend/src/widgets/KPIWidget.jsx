import { processKPIData } from '../utils/dataProcessor';

export default function KPIWidget({ config, orders }) {
    const value = processKPIData(orders, config.metric, config.aggregation, config.decimalPrecision, config.dataFormat);

    return (
        <div className="kpi-widget">
            <div style={{
                fontSize: '2.2rem',
                marginBottom: 8,
                opacity: 0.6,
            }}>
                {getMetricIcon(config.metric)}
            </div>
            <div className="kpi-value" style={{ fontSize: getValueFontSize(String(value).length) }}>
                {value}
            </div>
            <div className="kpi-label">{formatMetricLabel(config.metric)}</div>
            {config.description && <div className="kpi-desc">{config.description}</div>}
        </div>
    );
}

function getMetricIcon(metric) {
    const icons = {
        total_amount: '💰', quantity: '📦', unit_price: '💲',
        product: '🛍️', status: '📊', created_by: '👤',
        email: '📧', customer_name: '👥',
    };
    return icons[metric] || '📈';
}

function formatMetricLabel(metric) {
    const labels = {
        total_amount: 'Total Revenue', quantity: 'Total Quantity',
        unit_price: 'Avg Unit Price', product: 'Products',
        status: 'Status Count', created_by: 'Agents',
        email: 'Customers', customer_name: 'Customers',
    };
    return labels[metric] || metric.replace(/_/g, ' ');
}

function getValueFontSize(len) {
    if (len > 10) return '1.3rem';
    if (len > 7) return '1.6rem';
    return '2rem';
}
