import { useState, useEffect, useRef } from 'react';
import { useOrders } from '../contexts/OrdersContext';
import { toast } from 'react-toastify';

const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];
const PRODUCTS = ['Fiber Internet 300 Mbps', '5G Unlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package'];
const STATUSES = ['Pending', 'In progress', 'Completed'];
const AGENTS = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];

const BLANK = {
    first_name: '', last_name: '', email: '', phone: '',
    street_address: '', city: '', state_province: '', postal_code: '', country: 'United States',
    product: 'Fiber Internet 300 Mbps', quantity: 1, unit_price: '', total_amount: '',
    status: 'Pending', created_by: 'Mr. Michael Harris',
};

export default function OrderForm({ order, onClose }) {
    const { createOrder, updateOrder } = useOrders();
    const [form, setForm] = useState(order ? { ...order } : { ...BLANK });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isEdit = !!order;

    useEffect(() => {
        const qty = parseFloat(form.quantity) || 0;
        const price = parseFloat(form.unit_price) || 0;
        setForm(f => ({ ...f, total_amount: (qty * price).toFixed(2) }));
    }, [form.quantity, form.unit_price]);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
    };

    const validate = () => {
        const required = ['first_name', 'last_name', 'email', 'phone', 'street_address', 'city', 'state_province', 'postal_code', 'country', 'product', 'unit_price'];
        const errs = {};
        required.forEach(k => { if (!form[k] || String(form[k]).trim() === '') errs[k] = 'Please fill the field'; });
        if (form.quantity < 1) errs.quantity = 'Cannot be less than 1';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (isEdit) {
                await updateOrder(order.id, form);
                toast.success('Order updated successfully!');
            } else {
                await createOrder(form);
                toast.success('Order created successfully!');
            }
            onClose();
        } catch (e) {
            toast.error('Failed to save order. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const F = ({ name, label, type = 'text', children, required = true }) => (
        <div className="form-group">
            <label className="form-label-custom">{label}{required && ' *'}</label>
            {children || (
                <input type={type} className="form-control-custom" value={form[name] || ''}
                    onChange={e => set(name, e.target.value)}
                    style={errors[name] ? { borderColor: 'var(--danger)' } : {}} />
            )}
            {errors[name] && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors[name]}</div>}
        </div>
    );

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 720 }}>
                <div className="modal-header-custom">
                    <h5 className="modal-title-custom">
                        <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'}`} style={{ color: 'var(--accent)', marginRight: 8 }} />
                        {isEdit ? 'Edit Order' : 'Create New Order'}
                    </h5>
                    <button className="btn-icon" onClick={onClose} style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>
                <div className="modal-body-custom">
                    <div className="form-section-title">Customer Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <F name="first_name" label="First Name" />
                        <F name="last_name" label="Last Name" />
                        <F name="email" label="Email ID" />
                        <F name="phone" label="Phone Number" />
                        <F name="street_address" label="Street Address" />
                        <F name="city" label="City" />
                        <F name="state_province" label="State / Province" />
                        <F name="postal_code" label="Postal Code" />
                    </div>
                    <F name="country" label="Country">
                        <select className="form-select-custom" value={form.country}
                            onChange={e => set('country', e.target.value)}
                            style={errors.country ? { borderColor: 'var(--danger)' } : {}}>
                            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </F>

                    <div className="form-section-title">Order Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <F name="product" label="Choose Product">
                            <select className="form-select-custom" value={form.product}
                                onChange={e => set('product', e.target.value)}>
                                {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </F>
                        <F name="quantity" label="Quantity">
                            <input type="number" className="form-control-custom" value={form.quantity} min={1}
                                onChange={e => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                style={errors.quantity ? { borderColor: 'var(--danger)' } : {}} />
                            {errors.quantity && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.quantity}</div>}
                        </F>
                        <F name="unit_price" label="Unit Price ($)">
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                                <input type="number" step="0.01" min={0} className="form-control-custom"
                                    value={form.unit_price} onChange={e => set('unit_price', e.target.value)}
                                    style={{ paddingLeft: 24, ...(errors.unit_price ? { borderColor: 'var(--danger)' } : {}) }} />
                            </div>
                            {errors.unit_price && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.unit_price}</div>}
                        </F>
                        <F name="total_amount" label="Total Amount">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="form-control-custom" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                                    ${parseFloat(form.total_amount || 0).toFixed(2)}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Auto-calculated</span>
                            </div>
                        </F>
                        <F name="status" label="Status">
                            <select className="form-select-custom" value={form.status}
                                onChange={e => set('status', e.target.value)}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </F>
                        <F name="created_by" label="Created By">
                            <select className="form-select-custom" value={form.created_by}
                                onChange={e => set('created_by', e.target.value)}>
                                {AGENTS.map(a => <option key={a}>{a}</option>)}
                            </select>
                        </F>
                    </div>
                </div>
                <div className="modal-footer-custom">
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn-primary-custom" onClick={handleSubmit} disabled={loading}>
                        {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8 }} />Saving...</> :
                            <><i className={`bi ${isEdit ? 'bi-check2-circle' : 'bi-plus-circle'}`} />{isEdit ? 'Update Order' : 'Create Order'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
