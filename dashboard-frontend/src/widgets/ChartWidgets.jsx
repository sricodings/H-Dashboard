import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
    Tooltip, Legend, ResponsiveContainer, LabelList,
    PieChart, Pie, Cell, ComposedChart,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Funnel, FunnelChart
} from 'recharts';
import { processChartData } from '../utils/dataProcessor';
import ChartAIExplainer from '../components/ChartAIExplainer';
import { calculateLinearTrend, predictFuturePoints } from '../utils/predictions';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

function processPieData(orders, field) {
    if (!orders || orders.length === 0) return [];
    const grouped = {};
    orders.forEach(o => {
        const key = String(o[field] || 'Unknown').slice(0, 25);
        grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([k, v]) => ({ name: k, value: v }));
}

const TOOLTIP_STYLE = {
    contentStyle: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text-primary)',
        fontSize: '0.82rem',
    }
};

const AXIS_TICK = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-main)' };

export function BarChartWidget({ config, orders }) {
    let data = processChartData(orders, config.xAxis, config.yAxis);
    if (config.showPrediction) data = predictFuturePoints(data, 3, 'y');
    const trendData = config.showTrend ? calculateLinearTrend(data, 'y') : [];

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Bar Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={config.showTrend ? trendData : data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />}
                    <XAxis dataKey="x" tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'var(--bg-hover)', opacity: 0.4 }} />
                    {config.showLegend !== false && <Legend verticalAlign={config.legendPos || 'top'} align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />}
                    <Bar dataKey="y" name={config.yAxisLabel || config.yAxis} fill={config.color || 'var(--accent)'} radius={[4, 4, 0, 0]} animationDuration={config.animationDur || 1500}>
                        {config.showDataLabel && <LabelList dataKey="y" position="top" style={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }} />}
                    </Bar>
                    {config.showPrediction && <Bar dataKey="prediction" name="Predicted" fill="var(--warning)" opacity={0.5} radius={[4, 4, 0, 0]} />}
                    {config.showTrend && <Line type="monotone" dataKey="trend" stroke="var(--danger)" strokeWidth={2} dot={false} name="Trend Line" strokeDasharray="5 5" />}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export function LineChartWidget({ config, orders }) {
    let data = processChartData(orders, config.xAxis, config.yAxis);
    if (config.showPrediction) data = predictFuturePoints(data, 3, 'y');
    const trendData = config.showTrend ? calculateLinearTrend(data, 'y') : [];

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Line Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={config.showTrend ? trendData : data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />}
                    <XAxis dataKey="x" tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    {config.showLegend !== false && <Legend verticalAlign={config.legendPos || 'top'} align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />}
                    <Line type="monotone" dataKey="y" name={config.yAxisLabel || config.yAxis}
                        stroke={config.color || 'var(--accent)'} strokeWidth={3}
                        dot={{ r: 4, fill: config.color || 'var(--accent)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={config.animationDur || 1500}>
                        {config.showDataLabel && <LabelList dataKey="y" position="top" style={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }} />}
                    </Line>
                    {config.showPrediction && <Line type="monotone" dataKey="prediction" name="Predicted" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 5" />}
                    {config.showTrend && <Line type="monotone" dataKey="trend" stroke="var(--danger)" strokeWidth={2} dot={false} name="Trend Line" strokeDasharray="5 5" />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AreaChartWidget({ config, orders }) {
    let data = processChartData(orders, config.xAxis, config.yAxis);
    if (config.showPrediction) data = predictFuturePoints(data, 3, 'y');
    const trendData = config.showTrend ? calculateLinearTrend(data, 'y') : [];
    const gradId = `area-grad-${(config.color || '#6366f1').toString().replace('#', '')}`;

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Area Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={config.showTrend ? trendData : data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.color || 'var(--accent)'} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={config.color || 'var(--accent)'} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />}
                    <XAxis dataKey="x" tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <YAxis tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    {config.showLegend !== false && <Legend verticalAlign={config.legendPos || 'top'} align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />}
                    <Area type="monotone" dataKey="y" name={config.yAxisLabel || config.yAxis}
                        stroke={config.color || 'var(--accent)'} strokeWidth={3}
                        fill={`url(#${gradId})`}
                        animationDuration={config.animationDur || 1500} />
                    {config.showPrediction && <Area type="monotone" dataKey="prediction" name="Predicted" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} strokeDasharray="5 5" />}
                    {config.showTrend && <Line type="monotone" dataKey="trend" stroke="var(--danger)" strokeWidth={2} dot={false} name="Trend Line" strokeDasharray="5 5" />}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PieChartWidget({ config, orders }) {
    const data = processPieData(orders, config.chartData);
    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Pie Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={config.innerRadius || "0%"}
                        outerRadius="80%"
                        label={config.showDataLabel ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                        labelLine={false}
                        animationDuration={config.animationDur || 1500}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                    {config.showLegend !== false && <Legend verticalAlign={config.legendPos || 'bottom'} align="center" iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ScatterChartWidget({ config, orders }) {
    const data = processChartData(orders, config.xAxis, config.yAxis);
    const scatterData = data.map((d, i) => ({
        x: i,
        y: typeof d.y === 'number' ? d.y : 0,
        label: d.x,
    }));
    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Scatter Chart' }} data={scatterData} />
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
                    <XAxis type="number" dataKey="x" name="Index" tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} />
                    <YAxis type="number" dataKey="y" name={config.yAxis} tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={scatterData} fill={config.color || 'var(--accent)'} animationDuration={config.animationDur || 1500} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

export function BubbleChartWidget({ config, orders }) {
    // We need 3 dimensions for a bubble chart: x (e.g., product), y (e.g., revenue), z (e.g., quantity)
    // Here we'll map category to x index, just like in the scatter chart, but use zAxis for bubble size based on a secondary metric or data count.

    // Default to using the exact same mapping, but sizing bubbles by the yAxis value for demonstration if zAxis isn't explicitly set.
    const data = processChartData(orders, config.xAxis, config.yAxis);

    const bubbleData = data.map((d, i) => ({
        x: i,
        y: typeof d.y === 'number' ? d.y : 0,
        z: typeof d.y === 'number' ? Math.abs(d.y * 1.5) : 50, // Using generated Z for depth
        label: d.x,
    }));

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Bubble Chart' }} data={bubbleData} />
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
                    <XAxis type="number" dataKey="x" name={config.xAxis} tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }}
                        tickFormatter={(val) => {
                            const item = bubbleData.find(d => d.x === val);
                            return item ? item.label : val;
                        }} />
                    <YAxis type="number" dataKey="y" name={config.yAxis} tick={AXIS_TICK} axisLine={{ stroke: 'var(--border)' }} />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Volume" />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} formatter={(val, name, props) => {
                        return [val, name];
                    }} />
                    {config.showLegend !== false && <Legend verticalAlign={config.legendPos || 'top'} align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />}
                    <Scatter name={config.yAxisLabel || config.yAxis} data={bubbleData} fill={config.color || 'var(--accent)'} animationDuration={config.animationDur || 1500} opacity={0.7} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

// Radar Chart Widget
export function RadarChartWidget({ config, orders }) {
    const data = processChartData(orders, config.xAxis, config.yAxis);
    
    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Radar Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="x" tick={AXIS_TICK} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={AXIS_TICK} />
                    <Radar
                        name={config.yAxisLabel || config.yAxis}
                        dataKey="y"
                        stroke={config.color || 'var(--accent)'}
                        fill={config.color || 'var(--accent)'}
                        fillOpacity={0.6}
                        animationDuration={config.animationDur || 1500}
                    />
                    <Tooltip {...TOOLTIP_STYLE} />
                    {config.showLegend !== false && <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Funnel Chart Widget
export function FunnelChartWidget({ config, orders }) {
    const data = processPieData(orders, config.chartData || config.xAxis).sort((a, b) => b.value - a.value);
    
    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <ChartAIExplainer config={{ ...config, type: 'Funnel Chart' }} data={data} />
            <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Funnel
                        dataKey="value"
                        data={data}
                        isAnimationActive
                        animationDuration={config.animationDur || 1500}
                    >
                        <LabelList position="right" fill="var(--text-muted)" stroke="none" dataKey="name" style={{ fontSize: 10 }} />
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </div>
    );
}
