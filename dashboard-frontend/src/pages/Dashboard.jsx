import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';
import { useOrders } from '../contexts/OrdersContext';
import KPIWidget from '../widgets/KPIWidget';
import TableWidget from '../widgets/TableWidget';
import { BarChartWidget, LineChartWidget, AreaChartWidget, PieChartWidget, ScatterChartWidget, BubbleChartWidget, RadarChartWidget, FunnelChartWidget } from '../widgets/ChartWidgets';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import AIInsights from '../components/AIInsights';
import { toast } from 'react-toastify';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const API = '/api';

const TYPE_ICONS = {
    'kpi': 'bi-123', 'bar-chart': 'bi-bar-chart', 'line-chart': 'bi-graph-up',
    'area-chart': 'bi-reception-4', 'pie-chart': 'bi-pie-chart',
    'scatter-chart': 'bi-distribute-vertical', 'table': 'bi-table',
    'bubble-chart': 'bi-record-circle', 'radar-chart': 'bi-hexagon', 'funnel-chart': 'bi-filter-circle'
};

const DATE_OPTIONS = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Last 90 Days', value: 'last90' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const dashboardRef = useRef(null);
    const {
        widgets, layouts, loadDashboard, onLayoutChange, loading: dashLoading
    } = useDashboard();
    const { orders, loading: ordersLoading, fetchOrders, dateFilter, setDateFilter } = useOrders();
    const { width, containerRef, mounted } = useContainerWidth();

    useEffect(() => {
        loadDashboard();
        fetchOrders('all');
    }, [loadDashboard, fetchOrders]);

    const handleLayoutChange = (currentLayout, allLayouts) => {
        if (onLayoutChange) onLayoutChange(currentLayout, allLayouts);
    };

    const handleDateFilter = (val) => {
        setDateFilter(val);
        fetchOrders(val);
    };

    const handleDownloadWidget = async (id, title) => {
        const element = document.getElementById(`widget-${id}`);
        if (!element) return;

        try {
            const bodyStyle = window.getComputedStyle(document.body);
            const bgColor = bodyStyle.getPropertyValue('--bg-primary').trim() || '#ffffff';
            
            const canvas = await html2canvas(element, {
                backgroundColor: bgColor,
                scale: 2,
                logging: false,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success("Chart downloaded!");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download chart.");
        }
    };

    const handleDownloadCanvas = async () => {
        if (!dashboardRef.current) return;
        const toastId = toast.loading("Capturing dashboard...");

        try {
            const bodyStyle = window.getComputedStyle(document.body);
            const bgColor = bodyStyle.getPropertyValue('--bg-app').trim() || '#f4f6f9';

            const canvas = await html2canvas(dashboardRef.current, {
                backgroundColor: bgColor,
                scale: 1.5,
                logging: false,
                useCORS: true,
                ignoreElements: (el) => el.classList.contains('no-export')
            });
            const link = document.createElement('a');
            link.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.update(toastId, { render: "Dashboard exported!", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            console.error("Canvas export failed", error);
            toast.update(toastId, { render: "Failed to export dashboard.", type: "error", isLoading: false, autoClose: 2000 });
        }
    };

    const handleMailSummary = async () => {
        const email = prompt("Enter email address to send summary:");
        if (!email) return;

        const loadingToast = toast.loading("Preparing AI summary and sending email...");

        // Fetch AI insights specifically for the email
        let aiSummaryContent = "AI analysis not available.";
        try {
            const { data } = await axios.post(`${API}/ai/insights`, { orders });
            if (data.success && data.insights) {
                aiSummaryContent = data.insights.join('\n- ');
            }
        } catch (e) {
            console.error("AI Insight fetch failed for mail", e);
        }

        const statsText = `Total Orders: ${stats.total}\nRevenue: $${stats.revenue.toLocaleString()}\nCompleted: ${stats.completed}\nAvg Order Value: $${stats.avgOrder.toFixed(2)}`;

        // --- Trend Chart Generation for Email ---
        // Get last 10 data points for a mini trend chart
        const dailyData = {};
        orders.slice(-50).forEach(o => {
            const date = new Date(o.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyData[date] = (dailyData[date] || 0) + parseFloat(o.total_amount || 0);
        });
        const labels = Object.keys(dailyData).slice(-10);
        const values = labels.map(l => dailyData[l]);

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: values,
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    pointBackgroundColor: '#fff',
                    borderWidth: 3,
                    lineTension: 0.4,
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    xAxes: [{ gridLines: { color: 'rgba(255,255,255,0.05)' }, ticks: { fontColor: '#94a3b8' } }],
                    yAxes: [{ gridLines: { color: 'rgba(255,255,255,0.05)' }, ticks: { fontColor: '#94a3b8' } }]
                }
            }
        };
        const trendChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&bkg=%231e293b`;

        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_xoaguki';
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_d3n5nhj';
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

        try {
            const templateParams = {
                email: email,
                user_name: 'Dashboard User',
                orders_count: stats.total,
                total_revenue: stats.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                avg_value: stats.avgOrder.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                completed_orders: stats.completed,
                ai_insights: aiSummaryContent || "No AI insights available at this moment.",
                date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                prediction_text: "Based on current trends, your revenue is projected to maintain a steady growth of ~5-8% over the next 30 days.",
                trend_chart_url: trendChartUrl
            };

            emailjs.init(PUBLIC_KEY);
            const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);

            if (response.status === 200) {
                toast.update(loadingToast, { render: "AI Report sent successfully!", type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(loadingToast, { render: `Failed: ${response.text}`, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error('EmailJS Error Detail:', error);
            const msg = error?.text || error?.message || "Check console for details";
            toast.update(loadingToast, { render: `Email Error: ${msg}`, type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const stats = {
        total: orders.length,
        revenue: orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
        completed: orders.filter(o => o.status === 'Completed').length,
        avgOrder: orders.length ? (orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0) / orders.length) : 0,
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
            default: return null;
        }
    };

    if (dashLoading || ordersLoading) {
        return (
            <div className="page-content" style={{ animation: 'fadeIn 0.5s ease' }}>
                <div className="skeleton" style={{ height: 160, borderRadius: 12, marginBottom: 20 }} />
                <div className="stat-cards" style={{ padding: '0 0 20px 0' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card skeleton" style={{ height: 80 }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
                    <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'slideUp 0.3s ease' }}>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics Dashboard</h1>
                    <p className="page-subtitle">Personalized business metrics & insights</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Date Filter */}
                    <div className="no-export" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select className="form-select-custom" value={dateFilter}
                            onChange={e => handleDateFilter(e.target.value)}
                            style={{ width: 140 }}>
                            {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <button className="btn-secondary-custom no-export" onClick={handleDownloadCanvas} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: 8, fontWeight: 500 }}>
                        <i className="bi bi-download" /> Export Canvas
                    </button>
                    <button className="btn-secondary-custom no-export" onClick={handleMailSummary} style={{ background: 'var(--info-light)', color: 'var(--info)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, fontWeight: 500 }}>
                        Mail Summary
                    </button>
                    <button className="btn-primary-custom no-export" onClick={() => navigate('/configure')}>
                        Configure
                    </button>
                </div>
            </div>

            <div ref={dashboardRef}>
                {/* AI Insights Section */}
                <div className="page-content" style={{ paddingBottom: 0 }}>
                    <AIInsights orders={orders} />
                </div>

                {/* Summary Stat Cards */}
                <div className="stat-cards">
                    {[
                        { icon: 'bi-cart3', color: 'var(--accent)', label: 'Total Orders', value: stats.total },
                        { icon: 'bi-currency-dollar', color: 'var(--success)', label: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                        { icon: 'bi-check-circle-fill', color: 'var(--info)', label: 'Completed', value: stats.completed },
                        { icon: 'bi-graph-up-arrow', color: 'var(--warning)', label: 'Avg Order Value', value: `$${stats.avgOrder.toFixed(2)}` },
                    ].map((s, i) => (
                        <div className="stat-card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="stat-info">
                                <div className="stat-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <i className={`bi ${s.icon}`} style={{ color: s.color, opacity: 0.7, fontSize: '0.9rem' }} />
                                    {s.label}
                                </div>
                                <div className="stat-card-value">{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Content */}
                <div className="page-content">
                    {widgets.length === 0 ? (
                        <div className="dash-card">
                            <div className="empty-state">
                                <div className="empty-state-icon"><i className="bi bi-layout-wtf" /></div>
                                <h3>No Widgets Configured</h3>
                                <p>Click "Configure Dashboard" to add charts, tables, and KPI cards to your dashboard.</p>
                                <button className="btn-primary-custom" onClick={() => navigate('/configure')}>
                                    Configure Dashboard
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div ref={containerRef} style={{ width: '100%' }}>
                            {mounted && (
                                <ResponsiveGridLayout
                                    className="layout"
                                    layouts={layouts}
                                    width={width}
                                    breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                                    cols={{ lg: 12, md: 8, sm: 4 }}
                                    rowHeight={80}
                                    isDraggable={true}
                                    isResizable={true}
                                    margin={[12, 12]}
                                    onLayoutChange={handleLayoutChange}
                                >
                                    {widgets.map(widget => (
                                        <div key={widget.id}>
                                            <div id={`widget-${widget.id}`} className="widget-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <div className="widget-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="widget-card-title">
                                                        {widget.title}
                                                        {widget.description && (
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>{widget.description}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="no-export"
                                                        onClick={() => handleDownloadWidget(widget.id, widget.title)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                                                        title="Download as image"
                                                    >
                                                        <i className="bi bi-download" />
                                                    </button>
                                                </div>
                                                <div className="widget-card-body" style={{ flex: 1, padding: widget.type === 'table' ? 0 : 12, overflow: 'hidden' }}>
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
        </div>
    );
}
