import { useState, useEffect } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

const NUMERIC_FIELDS = ['quantity', 'unit_price', 'total_amount'];

const METRIC_OPTIONS = [
    'customer_name', 'email', 'product', 'created_by', 'status',
    'total_amount', 'unit_price', 'quantity', 'order_date',
];

const AXIS_OPTIONS = [
    'product', 'quantity', 'unit_price', 'total_amount',
    'status', 'created_by', 'order_date', 'customer_name', 'country', 'city', 'state_province',
];

const CHART_DATA_OPTIONS = [
    'product', 'quantity', 'unit_price', 'total_amount', 'status', 'created_by',
];

const ALL_COLUMNS = [
    'id', 'customer_name', 'email', 'phone', 'street_address', 'city',
    'state_province', 'postal_code', 'country', 'product', 'quantity',
    'unit_price', 'total_amount', 'status', 'created_by', 'order_date',
];

const COLUMN_LABELS = {
    id: 'Order ID', customer_name: 'Customer Name', email: 'Email', phone: 'Phone',
    street_address: 'Address', city: 'City', state_province: 'State', postal_code: 'Postal Code',
    country: 'Country', product: 'Product', quantity: 'Quantity', unit_price: 'Unit Price',
    total_amount: 'Total Amount', status: 'Status', created_by: 'Created By', order_date: 'Order Date',
};

export default function SettingsPanel({ widget, onClose }) {
    const { updateWidget, updateWidgetConfig, datasets } = useDashboard();
    const [localConfig, setLocalConfig] = useState(widget.config);
    const [localTitle, setLocalTitle] = useState(widget.title);
    const [localDesc, setLocalDesc] = useState(widget.description || '');
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        setLocalConfig(widget.config);
        setLocalTitle(widget.title);
        setLocalDesc(widget.description || '');
    }, [widget.id]);

    const update = (key, val) => setLocalConfig(prev => ({ ...prev, [key]: val }));

    const handleSave = () => {
        updateWidget(widget.id, { title: localTitle, description: localDesc });
        updateWidgetConfig(widget.id, localConfig);
        onClose();
    };

    const isChart = ['bar-chart', 'line-chart', 'area-chart', 'scatter-chart', 'radar-chart', 'bubble-chart'].includes(widget.type);
    const isPie = widget.type === 'pie-chart';
    const isKPI = widget.type === 'kpi';
    const isTable = widget.type === 'table';

    const TYPE_LABELS = {
        'kpi': 'KPI Card', 'bar-chart': 'Bar Chart', 'line-chart': 'Line Chart',
        'area-chart': 'Area Chart', 'pie-chart': 'Pie Chart', 'scatter-chart': 'Scatter Plot', 
        'table': 'Table', 'radar-chart': 'Radar Chart', 'funnel-chart': 'Funnel Chart', 'bubble-chart': 'Bubble Chart'
    };

    return (
        <div className={`settings-panel open`}>
            <div className="settings-panel-header">
                <div>
                    <h6 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Widget Settings
                    </h6>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{TYPE_LABELS[widget.type]}</span>
                </div>
                <button className="btn-icon" onClick={onClose}
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    <i className="bi bi-x-lg" />
                </button>
            </div>

            <div className="settings-panel-body">
                {/* General */}
                <div className="settings-section">
                    <div className="settings-section-title">General</div>
                    <div className="form-group">
                        <label className="form-label-custom">Widget Title *</label>
                        <input className="form-control-custom" value={localTitle}
                            onChange={e => setLocalTitle(e.target.value)} placeholder="Untitled" />
                    </div>
                    <div className="form-group">
                        <label className="form-label-custom">Widget Type</label>
                        <input className="form-control-custom" value={TYPE_LABELS[widget.type]} readOnly
                            style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label-custom">Description</label>
                        <textarea className="form-control-custom" value={localDesc}
                            onChange={e => setLocalDesc(e.target.value)} rows={2} placeholder="Optional description..." />
                    </div>
                </div>

                {/* Widget Size */}
                <div className="settings-section">
                    <div className="settings-section-title">Widget Size</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label-custom">Width (Cols)</label>
                            <input type="number" className="form-control-custom"
                                value={localConfig.width} min={1} max={12}
                                onChange={e => update('width', Math.max(1, parseInt(e.target.value) || 1))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label-custom">Height (Rows)</label>
                            <input type="number" className="form-control-custom"
                                value={localConfig.height} min={1}
                                onChange={e => update('height', Math.max(1, parseInt(e.target.value) || 1))} />
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="settings-section-title">Data Source</div>
                    <div className="form-group">
                        <label className="form-label-custom">Select Dataset (Tableau-like)</label>
                        <select className="form-select-custom" value={localConfig.datasetId || 'default'}
                            onChange={e => update('datasetId', e.target.value)}>
                            {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Data Settings */}
                <div className="settings-section">
                    <div className="settings-section-title">Data Mapping</div>

                    {isKPI && (
                        <>
                            <div className="form-group">
                                <label className="form-label-custom">Select Metric *</label>
                                <select className="form-select-custom" value={localConfig.metric}
                                    onChange={e => update('metric', e.target.value)}>
                                    {METRIC_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Aggregation *</label>
                                <select className="form-select-custom" value={localConfig.aggregation}
                                    onChange={e => update('aggregation', e.target.value)}
                                    disabled={!NUMERIC_FIELDS.includes(localConfig.metric)}>
                                    <option>Sum</option><option>Average</option><option>Count</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Data Format</label>
                                <select className="form-select-custom" value={localConfig.dataFormat}
                                    onChange={e => update('dataFormat', e.target.value)}>
                                    <option>Number</option><option>Currency</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Decimal Precision</label>
                                <input type="number" className="form-control-custom" min={0}
                                    value={localConfig.decimalPrecision}
                                    onChange={e => update('decimalPrecision', Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                        </>
                    )}

                    {isChart && (
                        <>
                            <div className="form-group">
                                <label className="form-label-custom">X-Axis Data *</label>
                                <select className="form-select-custom" value={localConfig.xAxis}
                                    onChange={e => update('xAxis', e.target.value)}>
                                    {AXIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Y-Axis Data *</label>
                                <select className="form-select-custom" value={localConfig.yAxis}
                                    onChange={e => update('yAxis', e.target.value)}>
                                    {AXIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <button className="btn-ghost w-100" style={{ justifyContent: 'center', border: '1px solid var(--border)' }}
                                    onClick={() => {
                                        const temp = localConfig.xAxis;
                                        setLocalConfig(prev => ({ ...prev, xAxis: prev.yAxis, yAxis: temp }));
                                    }}>
                                    <i className="bi bi-arrow-down-up" style={{ marginRight: 8 }} /> Swap Row / Column (X/Y)
                                </button>
                            </div>
                        </>
                    )}

                    {isPie && (
                        <div className="form-group">
                            <label className="form-label-custom">Chart Data *</label>
                            <select className="form-select-custom" value={localConfig.chartData}
                                onChange={e => update('chartData', e.target.value)}>
                                {CHART_DATA_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    )}

                    {isTable && (
                        <>
                            <div className="form-group">
                                <label className="form-label-custom">Choose Columns *</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 140, overflowY: 'auto', padding: 4 }}>
                                    {ALL_COLUMNS.map(col => (
                                        <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', cursor: 'pointer' }}>
                                            <input type="checkbox"
                                                checked={(localConfig.columns || []).includes(col)}
                                                onChange={e => {
                                                    const cols = localConfig.columns || [];
                                                    update('columns', e.target.checked ? [...cols, col] : cols.filter(c => c !== col));
                                                }}
                                            />
                                            {COLUMN_LABELS[col]}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Sort By</label>
                                <select className="form-select-custom" value={localConfig.sortBy || ''}
                                    onChange={e => update('sortBy', e.target.value)}>
                                    <option value="">None</option>
                                    <option>Ascending</option><option>Descending</option><option>Order date</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label-custom">Pagination</label>
                                <select className="form-select-custom" value={localConfig.pagination || 5}
                                    onChange={e => update('pagination', parseInt(e.target.value))}>
                                    <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="checkbox" id="apply-filter" checked={localConfig.applyFilter || false}
                                    onChange={e => update('applyFilter', e.target.checked)} />
                                <label htmlFor="apply-filter" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                    Apply Filter
                                </label>
                            </div>
                            {localConfig.applyFilter && (
                                <div style={{ marginTop: 8 }}>
                                    {(localConfig.filters || []).map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                            <select className="form-select-custom" style={{ flex: 1 }} value={f.field}
                                                onChange={e => {
                                                    const filters = [...(localConfig.filters || [])];
                                                    filters[i] = { ...filters[i], field: e.target.value };
                                                    update('filters', filters);
                                                }}>
                                                {AXIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                            <input className="form-control-custom" style={{ flex: 1 }} placeholder="Value" value={f.value}
                                                onChange={e => {
                                                    const filters = [...(localConfig.filters || [])];
                                                    filters[i] = { ...filters[i], value: e.target.value };
                                                    update('filters', filters);
                                                }} />
                                            <button className="btn-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                                                onClick={() => update('filters', (localConfig.filters || []).filter((_, j) => j !== i))}>
                                                <i className="bi bi-trash" />
                                            </button>
                                        </div>
                                    ))}
                                    <button className="btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                                        onClick={() => update('filters', [...(localConfig.filters || []), { field: 'product', value: '' }])}>
                                        <i className="bi bi-plus" /> Add Filter
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Styling */}
                <div className="settings-section">
                    <div className="settings-section-title">Styling</div>
                    {!isTable && (
                        <div className="form-group">
                            <label className="form-label-custom">Main Color</label>
                            <div className="color-picker-wrapper">
                                <div className="color-swatch" style={{ background: localConfig.color || 'var(--accent)' }}
                                    onClick={() => setShowColorPicker(!showColorPicker)} />
                                <input className="form-control-custom" value={localConfig.color || ''}
                                    onChange={e => update('color', e.target.value)}
                                    placeholder="Theme default" style={{ flex: 1 }} />
                            </div>
                            {showColorPicker && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                    {['var(--accent)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)', '#146c43', '#06404b', '#0d192b', '#1e3a5f', '#f8fafc'].map(c => (
                                        <div key={c} style={{
                                            width: 24, height: 24, borderRadius: 4, background: c, cursor: 'pointer',
                                            border: localConfig.color === c ? '2px solid var(--border-focus)' : '2px solid transparent'
                                        }}
                                            onClick={() => { update('color', c); setShowColorPicker(false); }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                            <input type="checkbox" id="show-label" checked={localConfig.showDataLabel || false}
                                onChange={e => update('showDataLabel', e.target.checked)} />
                            <label htmlFor="show-label" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                Data Labels
                            </label>
                        </div>
                        {!isTable && !isKPI && (
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                                <input type="checkbox" id="show-grid" checked={localConfig.showGrid !== false}
                                    onChange={e => update('showGrid', e.target.checked)} />
                                <label htmlFor="show-grid" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                    Show Grid
                                </label>
                            </div>
                        )}
                    </div>

                    {(isChart || isPie) && (
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                            <input type="checkbox" id="show-legend" checked={localConfig.showLegend !== false}
                                onChange={e => update('showLegend', e.target.checked)} />
                            <label htmlFor="show-legend" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                Show Legend
                            </label>
                        </div>
                    )}
                </div>

                {/* Advanced */}
                {!isTable && !isKPI && (
                    <div className="settings-section">
                        <div className="settings-section-title">Advanced</div>

                        {localConfig.showLegend !== false && (
                            <div className="form-group">
                                <label className="form-label-custom">Legend Position</label>
                                <select className="form-select-custom" value={localConfig.legendPos || 'top'}
                                    onChange={e => update('legendPos', e.target.value)}>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                </select>
                            </div>
                        )}

                        {isChart && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                                        <input type="checkbox" id="show-trend" checked={localConfig.showTrend || false}
                                            onChange={e => update('showTrend', e.target.checked)} />
                                        <label htmlFor="show-trend" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                            Trend Line
                                        </label>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                                        <input type="checkbox" id="show-pred" checked={localConfig.showPrediction || false}
                                            onChange={e => update('showPrediction', e.target.checked)} />
                                        <label htmlFor="show-pred" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                            Predictions
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label-custom">X-Axis Label</label>
                                    <input className="form-control-custom" value={localConfig.xAxisLabel || ''}
                                        onChange={e => update('xAxisLabel', e.target.value)} placeholder="None" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label-custom">Y-Axis Label</label>
                                    <input className="form-control-custom" value={localConfig.yAxisLabel || ''}
                                        onChange={e => update('yAxisLabel', e.target.value)} placeholder="None" />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label-custom">Animation Duration (ms)</label>
                            <input type="number" className="form-control-custom" step={500} min={0} max={5000}
                                value={localConfig.animationDur || 1500}
                                onChange={e => update('animationDur', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                )}

                {isPie && (
                    <div className="settings-section">
                        <div className="settings-section-title">Pie Settings</div>
                        <div className="form-group">
                            <label className="form-label-custom">Donut Size (Inner Radius %)</label>
                            <input type="number" className="form-control-custom" min={0} max={80}
                                value={parseInt(localConfig.innerRadius) || 0}
                                onChange={e => update('innerRadius', `${Math.min(80, Math.max(0, parseInt(e.target.value) || 0))}%`)} />
                        </div>
                    </div>
                )}

                {isTable && (
                    <div className="settings-section">
                        <div className="settings-section-title">Table Style</div>
                        <div className="form-group">
                            <label className="form-label-custom">Font Size</label>
                            <input type="number" className="form-control-custom" min={12} max={18}
                                value={localConfig.fontSize || 14}
                                onChange={e => update('fontSize', Math.min(18, Math.max(12, parseInt(e.target.value) || 14)))} />
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                    <button className="btn-primary-custom" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
                        <i className="bi bi-check2-circle" /> Apply Settings
                    </button>
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
