import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard } from '../contexts/DashboardContext';
import { useOrders } from '../contexts/OrdersContext';
import SettingsPanel from '../components/SettingsPanel';
import KPIWidget from '../widgets/KPIWidget';
import TableWidget from '../widgets/TableWidget';
import { BarChartWidget, LineChartWidget, AreaChartWidget, PieChartWidget, ScatterChartWidget, BubbleChartWidget, RadarChartWidget, FunnelChartWidget } from '../widgets/ChartWidgets';
import { toast } from 'react-toastify';

const PALETTE_ITEMS = [
    {
        group: 'Charts', icon: 'bi-bar-chart-fill', items: [
            { type: 'bar-chart', label: 'Bar Chart', icon: 'bi-bar-chart' },
            { type: 'line-chart', label: 'Line Chart', icon: 'bi-graph-up' },
            { type: 'pie-chart', label: 'Pie Chart', icon: 'bi-pie-chart' },
            { type: 'area-chart', label: 'Area Chart', icon: 'bi-reception-4' },
            { type: 'scatter-chart', label: 'Scatter Plot', icon: 'bi-distribute-vertical' },
            { type: 'bubble-chart', label: 'Bubble Chart', icon: 'bi-record-circle' },
            { type: 'radar-chart', label: 'Radar Chart', icon: 'bi-hexagon' },
            { type: 'funnel-chart', label: 'Funnel Chart', icon: 'bi-filter-circle' },
        ]
    },
    {
        group: 'Tables', icon: 'bi-table', items: [
            { type: 'table', label: 'Table', icon: 'bi-table' },
        ]
    },
    {
        group: 'KPIs', icon: 'bi-speedometer2', items: [
            { type: 'kpi', label: 'KPI Card', icon: 'bi-123' },
        ]
    },
];

const TYPE_ICONS = {
    'kpi': 'bi-123', 'bar-chart': 'bi-bar-chart', 'line-chart': 'bi-graph-up',
    'area-chart': 'bi-reception-4', 'pie-chart': 'bi-pie-chart',
    'scatter-chart': 'bi-distribute-vertical', 'table': 'bi-table',
    'bubble-chart': 'bi-record-circle', 'radar-chart': 'bi-hexagon', 'funnel-chart': 'bi-filter-circle'
};

export default function Configure() {
    const navigate = useNavigate();
    const {
        widgets, layouts, addWidget, removeWidget, onLayoutChange,
        saveDashboard, saved, loadDashboard, clearDashboard
    } = useDashboard();
    const { orders, fetchOrders } = useOrders();
    const { width, containerRef, mounted } = useContainerWidth();
    const [activeWidget, setActiveWidget] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [openGroups, setOpenGroups] = useState({ Charts: true, Tables: true, KPIs: true });
    const [dragOver, setDragOver] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draggingType, setDraggingType] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        loadDashboard();
        fetchOrders('all');
    }, [loadDashboard, fetchOrders]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveDashboard();
            toast.success('Dashboard saved successfully!');
            setTimeout(() => navigate('/'), 800);
        } catch {
            toast.error('Failed to save. Check backend connection.');
        } finally {
            setSaving(false);
        }
    };

    const handleLayoutDrop = (layout, item, e) => {
        const type = e.dataTransfer.getData('widgetType') || draggingType;
        if (type) {
            addWidget(type, {}, { x: item.x, y: item.y });
            toast.info(`${type.replace('-', ' ')} added to canvas`, { autoClose: 1500 });
        }
        setDragOver(false);
    };

    const renderWidget = (widget) => {
        const props = { config: widget.config, orders };
        switch (widget.type) {
            case 'kpi': return <KPIWidget {...props} />;
            case 'bar-chart': return <BarChartWidget {...props} />;
            case 'line-chart': return <LineChartWidget {...props} />;
            case 'area-chart': return <AreaChartWidget {...props} />;
            case 'pie-chart': return <PieChartWidget {...props} />;
            case 'scatter-chart': return <ScatterChartWidget {...props} />;
            case 'bubble-chart': return <BubbleChartWidget {...props} />;
            case 'radar-chart': return <RadarChartWidget {...props} />;
            case 'funnel-chart': return <FunnelChartWidget {...props} />;
            case 'table': return <TableWidget {...props} />;
            default: return <div style={{ padding: 20, color: 'var(--text-muted)' }}>Unknown widget</div>;
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Widget Palette Sidebar */}
            <div className="widget-palette" style={{ width: 260, flexShrink: 0 }}>
                <div style={{ marginBottom: 16 }}>
                    <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Widget Library</h6>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Drag widgets to the canvas</p>
                </div>
                {PALETTE_ITEMS.map(group => (
                    <div className="palette-group" key={group.group}>
                        <button className="palette-group-header"
                            onClick={() => setOpenGroups(g => ({ ...g, [group.group]: !g[group.group] }))}>
                            <i className={`bi ${group.icon}`} />
                            {group.group}
                            <i className={`bi bi-chevron-${openGroups[group.group] ? 'down' : 'right'} ms-auto`} />
                        </button>
                        {openGroups[group.group] && (
                            <div style={{ paddingLeft: 8, marginTop: 4 }}>
                                {group.items.map(item => (
                                    <div key={item.type}
                                        className="palette-item"
                                        draggable
                                        onDragStart={e => { e.dataTransfer.setData('widgetType', item.type); setDraggingType(item.type); }}
                                        onDragEnd={() => setDraggingType(null)}
                                        onClick={() => { addWidget(item.type, {}); toast.info(`${item.label} added`, { autoClose: 1500 }); }}
                                    >
                                        <div className="palette-item-icon">
                                            <i className={`bi ${item.icon}`} />
                                        </div>
                                        {item.label}
                                    </div>
                                ))}                </div>
                        )}
                    </div>
                ))}

                {/* Drag hint */}
                <div style={{
                    marginTop: 20, padding: '12px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)',
                    fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
                }}>
                    <i className="bi bi-info-circle" style={{ color: 'var(--accent)', marginRight: 4 }} />
                    Drag any widget to the canvas, or click to add it. Hover over a widget to configure or delete.
                </div>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Canvas Toolbar */}
                <div style={{
                    padding: '12px 20px',
                    background: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <i className="bi bi-layout-wtf" style={{ color: 'var(--accent)', marginRight: 8 }} />
                            Dashboard Canvas
                        </span>
                        <span style={{
                            background: widgets.length > 0 ? 'var(--success-light)' : 'var(--bg-badge)',
                            color: widgets.length > 0 ? 'var(--success)' : 'var(--text-muted)',
                            padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600,
                        }}>
                            {widgets.length} widget{widgets.length !== 1 ? 's' : ''} placed
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {!saved && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }} /> Unsaved changes
                            </span>
                        )}
                        <button className="btn-ghost" onClick={() => setShowClearConfirm(true)} disabled={widgets.length === 0}>
                            <i className="bi bi-trash3" /> Clear Canvas
                        </button>
                        <button className="btn-ghost" onClick={() => navigate('/')}>
                            <i className="bi bi-arrow-left" /> Back
                        </button>
                        <button className="btn-success-custom" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : <><i className="bi bi-save" /> Save Configuration</>}
                        </button>
                    </div>
                </div>

                {/* Drop Canvas */}
                <div
                    ref={canvasRef}
                    className={`canvas-area ${dragOver ? 'drag-over' : ''}`}
                    style={{ flex: 1, margin: 16, minHeight: 500, padding: 8, position: 'relative' }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                >
                    {widgets.length === 0 ? (
                        <div className="canvas-empty">
                            <i className="bi bi-grid-3x3-gap" />
                            <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Empty Canvas</h5>
                            <p style={{ fontSize: '0.875rem' }}>Drag widgets from the left panel or click them to add to your dashboard.</p>
                            <button className="btn-primary-custom"
                                onClick={() => { addWidget('kpi', {}); addWidget('bar-chart', {}); }}>
                                <i className="bi bi-plus-lg" /> Add Sample Widgets
                            </button>
                        </div>
                    ) : (
                        <div ref={containerRef} style={{ width: '100%', minHeight: '100%' }}>
                            {mounted && (
                                <ResponsiveGridLayout
                                    className="layout"
                                    layouts={layouts}
                                    width={width}
                                    breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                                    cols={{ lg: 12, md: 8, sm: 4 }}
                                    rowHeight={80}
                                    onLayoutChange={onLayoutChange}
                                    draggableHandle=".widget-drag-handle"
                                    margin={[12, 12]}
                                    isResizable
                                    isDraggable
                                    isDroppable
                                    onDrop={handleLayoutDrop}
                                >
                                    {widgets.map(widget => (
                                        <div key={widget.id}>
                                            <div className={`widget-card ${widget.config?.isAI ? 'ai-widget-glitter' : ''}`} style={{ height: '100%' }}>
                                                <div className="widget-card-header">
                                                    <div className="widget-card-title widget-drag-handle" style={{ cursor: 'grab', flex: 1 }}>
                                                        <i className={`bi ${TYPE_ICONS[widget.type]} me-2`} style={{ color: 'var(--accent)', fontSize: '0.85rem' }} />
                                                        {widget.title}
                                                    </div>
                                                    <div className="widget-actions" style={{ display: 'flex' }}>
                                                        <button className="widget-action-btn widget-action-settings"
                                                            onClick={() => setActiveWidget(w => w?.id === widget.id ? null : widget)}
                                                            title="Configure">
                                                            <i className="bi bi-gear" />
                                                        </button>
                                                        <button className="widget-action-btn widget-action-delete"
                                                            onClick={() => setDeleteConfirm(widget)}
                                                            title="Delete">
                                                            <i className="bi bi-trash" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="widget-card-body">
                                                    {renderWidget(widget)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ResponsiveGridLayout>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Side Panel */}
            {
                activeWidget && (
                    <SettingsPanel widget={activeWidget} onClose={() => setActiveWidget(null)} />
                )
            }

            {/* Delete Confirm */}
            {
                deleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-box" style={{ maxWidth: 380 }}>
                            <div className="modal-header-custom">
                                <h5 className="modal-title-custom" style={{ color: 'var(--danger)' }}>
                                    <i className="bi bi-trash" style={{ marginRight: 8 }} /> Remove Widget
                                </h5>
                            </div>
                            <div className="modal-body-custom">
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Remove <strong>"{deleteConfirm.title}"</strong> from the dashboard?
                                </p>
                            </div>
                            <div className="modal-footer-custom">
                                <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="btn-danger-custom" onClick={() => { removeWidget(deleteConfirm.id); setDeleteConfirm(null); setActiveWidget(null); toast.info('Widget removed'); }}>
                                    <i className="bi bi-trash" /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Clear Confirm */}
            {
                showClearConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-box" style={{ maxWidth: 400 }}>
                            <div className="modal-header-custom">
                                <h5 className="modal-title-custom" style={{ color: 'var(--danger)' }}>
                                    <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }} /> Clear Dashboard
                                </h5>
                            </div>
                            <div className="modal-body-custom">
                                <p>Are you sure you want to <strong>remove all widgets</strong> from the canvas? This action cannot be undone unless you refresh without saving.</p>
                            </div>
                            <div className="modal-footer-custom">
                                <button className="btn-ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                                <button className="btn-danger-custom" onClick={() => { clearDashboard(); setShowClearConfirm(false); toast.info('Canvas cleared'); }}>
                                    <i className="bi bi-trash3" /> Clear Everything
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
