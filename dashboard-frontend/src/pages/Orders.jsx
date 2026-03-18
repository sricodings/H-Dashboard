import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useOrders } from '../contexts/OrdersContext';
import OrderForm from '../components/OrderForm';
import { toast } from 'react-toastify';

const STATUS_CLASS = {
    'Pending': 'status-pending', 'In progress': 'status-progress', 'Completed': 'status-completed'
};

export default function Orders() {
    const { orders, loading, fetchOrders, deleteOrder } = useOrders();
    const [showForm, setShowForm] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const menuRef = useRef(null);

    const handleSeed = async () => {
        try {
            const API = '/api';
            const { data } = await axios.post(`${API}/ai/seed`);
            if (data.success) {
                toast.success(data.message);
                fetchOrders('all');
            }
        } catch (err) {
            toast.error('Failed to seed data');
        }
    };

    useEffect(() => { fetchOrders('all'); }, []);

    useEffect(() => {
        const close = () => setContextMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const handleContextMenu = (e, order) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, order });
    };

    const handleDelete = async (id) => {
        try {
            await deleteOrder(id);
            toast.success('Order deleted');
            setDeleteConfirm(null);
        } catch {
            toast.error('Failed to delete order');
        }
    };

    const filtered = orders.filter(o => {
        if (!search) return true;
        const s = search.toLowerCase();
        return [o.first_name, o.last_name, o.email, o.product, o.status, o.created_by]
            .some(v => String(v || '').toLowerCase().includes(s));
    });

    const stats = {
        total: orders.length,
        revenue: orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
        completed: orders.filter(o => o.status === 'Completed').length,
        pending: orders.filter(o => o.status === 'Pending').length,
    };

    return (
        <div style={{ animation: 'slideUp 0.3s ease' }}>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customer Orders</h1>
                    <p className="page-subtitle">Manage and track all customer orders</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-ghost" onClick={handleSeed} disabled={loading} title="Seed database with 20 sample orders">
                        <i className={`bi bi-database-add ${loading ? 'spin' : ''}`} /> Seed Sample Data
                    </button>
                    <button className="btn-primary-custom" onClick={() => { setEditOrder(null); setShowForm(true); }}>
                        <i className="bi bi-plus-lg" /> Create Order
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
                {[
                    { icon: 'bi-cart3', color: 'var(--accent)', bg: 'var(--accent-light)', label: 'Total Orders', value: stats.total },
                    { icon: 'bi-currency-dollar', color: 'var(--success)', bg: 'var(--success-light)', label: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { icon: 'bi-check-circle', color: 'var(--info)', bg: 'var(--info-light)', label: 'Completed', value: stats.completed },
                    { icon: 'bi-clock', color: 'var(--warning)', bg: 'var(--warning-light)', label: 'Pending', value: stats.pending },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                            <i className={`bi ${s.icon}`} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="page-content">
                <div className="dash-card">
                    <div className="card-header-custom">
                        <h6 className="card-title">
                            <i className="bi bi-table" style={{ color: 'var(--accent)', marginRight: 8 }} />
                            All Orders
                            <span style={{ marginLeft: 8, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600 }}>
                                {filtered.length}
                            </span>
                        </h6>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <i className="bi bi-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                                <input className="form-control-custom" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search orders..." style={{ paddingLeft: 32, width: 220 }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div className="loading-spinner"><div className="spinner" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon"><i className="bi bi-inbox" /></div>
                                <h3>No Orders Yet</h3>
                                <p>Click "Create Order" to add your first customer order.</p>
                                <button className="btn-primary-custom" onClick={() => setShowForm(true)}>
                                    <i className="bi bi-plus-lg" /> Create Order
                                </button>
                            </div>
                        ) : (
                            <table className="table-custom">
                                <thead>
                                    <tr>
                                        <th>#</th><th>Customer</th><th>Email</th><th>Product</th>
                                        <th>Qty</th><th>Total</th><th>Status</th><th>Created By</th><th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((o, i) => (
                                        <tr key={o.id} onContextMenu={e => handleContextMenu(e, o)}
                                            style={{ cursor: 'context-menu' }}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{o.id}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{o.first_name} {o.last_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.city}, {o.country}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{o.email}</td>
                                            <td style={{ fontSize: '0.85rem', maxWidth: 160 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</div>
                                            </td>
                                            <td style={{ fontWeight: 600, textAlign: 'center' }}>{o.quantity}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                                                ${parseFloat(o.total_amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${STATUS_CLASS[o.status] || ''}`}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{o.created_by?.replace('Mr. ', '').replace('Ms. ', '')}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div className="context-menu" ref={menuRef}
                    style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 160) }}>
                    <button className="context-menu-item" onClick={() => { setEditOrder(contextMenu.order); setShowForm(true); setContextMenu(null); }}>
                        <i className="bi bi-pencil" /> Edit
                    </button>
                    <button className="context-menu-item danger" onClick={() => { setDeleteConfirm(contextMenu.order); setContextMenu(null); }}>
                        <i className="bi bi-trash" /> Delete
                    </button>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h5 className="modal-title-custom" style={{ color: 'var(--danger)' }}>
                                <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} /> Confirm Delete
                            </h5>
                        </div>
                        <div className="modal-body-custom">
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Are you sure you want to delete the order for <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer-custom">
                            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-danger-custom" onClick={() => handleDelete(deleteConfirm.id)}>
                                <i className="bi bi-trash" /> Delete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Form Modal */}
            {showForm && <OrderForm order={editOrder} onClose={() => { setShowForm(false); setEditOrder(null); }} />}
        </div>
    );
}
