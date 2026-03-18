import { useState, useMemo } from 'react';

const COLUMN_LABELS = {
    id: 'Order ID', customer_name: 'Customer Name', email: 'Email',
    phone: 'Phone', street_address: 'Address', city: 'City',
    state_province: 'State', postal_code: 'Postal Code', country: 'Country',
    product: 'Product', quantity: 'Qty', unit_price: 'Unit Price',
    total_amount: 'Total', status: 'Status', created_by: 'Created By',
    order_date: 'Order Date',
};

export default function TableWidget({ config, orders }) {
    const [page, setPage] = useState(0);
    const perPage = config.pagination || 5;
    const columns = config.columns || ['customer_name', 'product', 'total_amount', 'status'];

    const filtered = useMemo(() => {
        let data = [...orders];
        if (config.applyFilter && config.filters?.length) {
            config.filters.forEach(f => {
                if (f.field && f.value) {
                    data = data.filter(o =>
                        String(o[f.field] || '').toLowerCase().includes(f.value.toLowerCase())
                    );
                }
            });
        }
        if (config.sortBy === 'Ascending') {
            data.sort((a, b) => (a[columns[0]] || '').toString().localeCompare((b[columns[0]] || '').toString()));
        } else if (config.sortBy === 'Descending') {
            data.sort((a, b) => (b[columns[0]] || '').toString().localeCompare((a[columns[0]] || '').toString()));
        } else if (config.sortBy === 'Order date') {
            data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        }
        return data;
    }, [orders, config]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const pageData = filtered.slice(page * perPage, (page + 1) * perPage);

    function formatCell(col, val) {
        if (col === 'total_amount' || col === 'unit_price') return `$${parseFloat(val || 0).toFixed(2)}`;
        if (col === 'status') return (
            <span className={`status-badge ${val === 'Completed' ? 'status-completed' :
                    val === 'In progress' ? 'status-progress' : 'status-pending'
                }`}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', opacity: 0.8 }} />
                {val}
            </span>
        );
        if (col === 'order_date' && val) return new Date(val).toLocaleDateString();
        return val || '—';
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <table className="table-custom" style={{ fontSize: config.fontSize || 14 }}>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col} style={{ background: config.headerBg || '#54bd95', color: '#fff' }}>
                                    {COLUMN_LABELS[col] || col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length === 0 ? (
                            <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No data</td></tr>
                        ) : (
                            pageData.map(row => (
                                <tr key={row.id}>
                                    {columns.map(col => <td key={col}>{formatCell(col, row[col])}</td>)}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
                    </span>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                        <i className="bi bi-chevron-left" />
                    </button>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            )}
        </div>
    );
}
