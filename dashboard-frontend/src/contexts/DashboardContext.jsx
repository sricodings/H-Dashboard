import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API = '/api';

const DashboardContext = createContext();

const TYPE_LABELS = {
    'kpi': 'KPI Card', 
    'bar-chart': 'Bar Chart', 
    'line-chart': 'Line Chart',
    'area-chart': 'Area Chart', 
    'pie-chart': 'Pie Chart', 
    'scatter-chart': 'Scatter Plot', 
    'table': 'Table',
    'bubble-chart': 'Bubble Chart',
    'radar-chart': 'Radar Chart',
    'funnel-chart': 'Funnel Chart'
};

const DEFAULT_WIDGET_SIZES = {
    'kpi': { w: 3, h: 2 },
    'bar-chart': { w: 6, h: 4 },
    'line-chart': { w: 6, h: 4 },
    'area-chart': { w: 6, h: 4 },
    'pie-chart': { w: 4, h: 4 },
    'scatter-chart': { w: 6, h: 4 },
    'table': { w: 8, h: 4 },
    'bubble-chart': { w: 6, h: 4 },
    'radar-chart': { w: 6, h: 4 },
    'funnel-chart': { w: 6, h: 4 },
};

export function DashboardProvider({ children }) {
    const [widgets, setWidgets] = useState([]);
    const [layouts, setLayouts] = useState({ lg: [], md: [], sm: [] });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [datasets, setDatasets] = useState([
        { id: 'default', name: 'Orders Data (Main)', source: 'api/orders' },
        { id: 'marketing', name: 'Marketing Campaign', source: 'internal' },
        { id: 'inventory', name: 'Inventory Levels', source: 'internal' },
    ]);
    const [currentDatasetId, setCurrentDatasetId] = useState('default');

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/dashboard`);
            if (data.success && data.data) {
                setWidgets(data.data.widgets || []);
                setLayouts(data.data.layouts || { lg: [], md: [], sm: [] });
                setSaved(true);
            }
        } catch (e) {
            console.error('Failed to load dashboard', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveDashboard = async () => {
        try {
            const { data } = await axios.post(`${API}/dashboard`, {
                layout: { widgets, layouts }
            });
            if (data.success) setSaved(true);
            return data;
        } catch (e) {
            console.error('Failed to save dashboard', e);
            throw e;
        }
    };

    const addWidget = (type, config = {}, position = null) => {
        const id = uuidv4();
        const sizes = DEFAULT_WIDGET_SIZES[type] || DEFAULT_WIDGET_SIZES['bar-chart'];

        const newWidget = {
            id, type, title: TYPE_LABELS[type] || 'New Widget',
            config: {
                metric: 'total_amount',
                aggregation: 'Sum',
                dataFormat: 'Number',
                decimalPrecision: 0,
                xAxis: 'product',
                yAxis: 'total_amount',
                chartData: 'product',
                color: 'var(--accent)',
                showDataLabel: false,
                showLegend: true,
                columns: ['customer_name', 'product', 'total_amount', 'status'],
                sortBy: '',
                pagination: 5,
                applyFilter: false,
                filters: [],
                fontSize: 14,
                headerBg: 'var(--bg-secondary)',
                isAI: false, // Default
                showTrend: true, // Default on
                showPrediction: true, // Default on
                width: sizes.w,
                height: sizes.h,
                ...config,
            }
        };
        setWidgets(prev => [...prev, newWidget]);

        // Add to layout
        const newLayoutItem = {
            i: id,
            x: position?.x !== undefined ? position.x : (widgets.length * 3) % 12,
            y: position?.y !== undefined ? position.y : Infinity,
            w: position?.w !== undefined ? position.w : sizes.w,
            h: position?.h !== undefined ? position.h : sizes.h,
            minW: 2,
            minH: 2,
        };

        setLayouts(prev => ({
            lg: [...(prev.lg || []), { ...newLayoutItem }],
            md: [...(prev.md || []), { ...newLayoutItem, w: Math.min(newLayoutItem.w, 8) }],
            sm: [...(prev.sm || []), { ...newLayoutItem, w: Math.min(newLayoutItem.w, 4) }],
        }));

        setSaved(false);
        return id;
    };

    const updateWidget = (id, updates) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
        setSaved(false);
    };

    const updateWidgetConfig = (id, configUpdates) => {
        setWidgets(prev => prev.map(w =>
            w.id === id ? { ...w, config: { ...w.config, ...configUpdates } } : w
        ));
        setSaved(false);
    };

    const removeWidget = (id) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        setLayouts(prev => ({
            lg: prev.lg.filter(l => l.i !== id),
            md: prev.md.filter(l => l.i !== id),
            sm: prev.sm.filter(l => l.i !== id),
        }));
        setSaved(false);
    };

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        setSaved(false);
    };

    const clearDashboard = () => {
        setWidgets([]);
        setLayouts({ lg: [], md: [], sm: [] });
        setSaved(false);
    };

    return (
        <DashboardContext.Provider value={{
            widgets, layouts, saved, loading,
            datasets, currentDatasetId, setCurrentDatasetId, setDatasets,
            loadDashboard, saveDashboard,
            addWidget, updateWidget, updateWidgetConfig, removeWidget,
            onLayoutChange, setWidgets, setLayouts, clearDashboard
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export const useDashboard = () => useContext(DashboardContext);
