import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = '/api';

const QUICK_PROMPTS = [
    'Add sample data',
    'Bar chart: revenue by product',
    'KPI: total revenue',
    'Pie chart: order status',
    'Table with all orders',
    'Line chart: quantity trend',
];

const WELCOME_MSG = {
    role: 'bot',
    content: '👋 Hi! I\'m your AI Dashboard Assistant. Describe a chart, KPI, or table and I\'ll add it to your dashboard instantly!\n\nTry: "Show me revenue by product as a bar chart"'
};

export default function AIPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { addWidget } = useDashboard();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return;

        if (text === 'Add sample data ✨') {
            setLoading(true);
            try {
                const { data } = await axios.post(`${API}/ai/seed`);
                if (data.success) {
                    setMessages(prev => [...prev,
                    { role: 'user', content: text },
                    { role: 'bot', content: `✅ **Success!** ${data.message}\n\nYou now have live data to build dashboards with.` },
                    { role: 'bot', content: '💡 **Suggestion:** Try asking "Show me revenue by product" or "Create a line chart of trends"' }
                    ]);
                    toast.success(data.message);
                }
            } catch (err) {
                toast.error('Failed to seed data');
            } finally {
                setLoading(false);
            }
            return;
        }

        const userMsg = { role: 'user', content: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post(`${API}/ai/generate`, { prompt: text.trim() });

            if (data.success && data.data) {
                const cfg = data.data;
                addWidget(cfg.type, {
                    title: cfg.title || 'AI Widget',
                    description: cfg.description || '',
                    xAxis: cfg.xAxis || 'product',
                    yAxis: cfg.yAxis || 'total_amount',
                    chartData: cfg.chartData || 'product',
                    metric: cfg.metric || 'total_amount',
                    aggregation: cfg.aggregation || 'Sum',
                    isAI: true,
                    columns: cfg.columns || ['customer_name', 'product', 'total_amount', 'status'],
                    color: cfg.color || 'var(--accent)',
                    showDataLabel: cfg.showDataLabel || false,
                    showLegend: cfg.showLegend !== undefined ? cfg.showLegend : true,
                    width: cfg.width || 6,
                    height: cfg.height || 4,
                });

                const botMsg = {
                    role: 'bot',
                    content: `✅ **${cfg.title}** has been added to your dashboard!\n\nWidget type: ${cfg.type.replace('-', ' ')}\n\nGo to [Configure](/configure) to see it.`,
                    action: { label: '⚙️ Configure Dashboard', path: '/configure' }
                };
                setMessages(prev => [...prev, botMsg]);

                // Smart Suggestion
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'bot',
                        content: `💡 **Next Step:** You could also try: "Group this by status" or "Change color to green"`
                    }]);
                }, 1000);

                toast.success(`AI created: ${cfg.title}`);
            }
        } catch (err) {
            const errMsg = { role: 'bot', content: '⚠️ Could not connect to the AI backend. Check if the server is running on port 5000.' };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <>
            {/* FAB Button */}
            <button className="ai-fab" onClick={() => setOpen(o => !o)} title="AI Dashboard Assistant" id="ai-fab-btn">
                <div className="ai-pulse" />
                <span>{open ? '✕' : '✨'}</span>
            </button>

            {/* AI Chat Panel */}
            {open && (
                <div className="ai-panel" id="ai-chat-panel">
                    <div className="ai-panel-header">
                        <div className="ai-avatar-icon">
                            🤖
                        </div>
                        <div>
                            <h5>AI Assistant</h5>
                            <div className="ai-status-tag">Online • Adaptive</div>
                        </div>
                        <button className="ai-clear-btn" onClick={() => setMessages([WELCOME_MSG])} title="Clear chat">
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="ai-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-message ${msg.role}`}>
                                <div className={`ai-message-avatar ${msg.role === 'bot' ? 'ai-avatar-bot' : 'ai-avatar-user'}`}>
                                    {msg.role === 'bot' ? '🤖' : '👤'}
                                </div>
                                <div>
                                    <div className="ai-message-bubble">
                                        {msg.content.split('\n').map((line, j) => (
                                            <div key={j}>{line.replace(/\*\*/g, '')}</div>
                                        ))}
                                    </div>
                                    {msg.action && (
                                        <button
                                            onClick={() => { navigate(msg.action.path); setOpen(false); }}
                                            style={{
                                                marginTop: 6, background: 'var(--accent-gradient)', color: 'white',
                                                border: 'none', borderRadius: 8, padding: '5px 10px',
                                                fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
                                            }}>
                                            {msg.action.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-message bot">
                                <div className="ai-message-avatar ai-avatar-bot">🤖</div>
                                <div className="ai-message-bubble">
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                                                animation: `pulse 1.2s ${i * 0.2}s ease infinite`,
                                            }} />
                                        ))}
                                        <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generating...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompt Chips */}
                    <div className="ai-quick-prompts">
                        {QUICK_PROMPTS.map((p, i) => (
                            <button key={i} className="ai-quick-chip" onClick={() => sendMessage(p)}>
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="ai-input-area">
                        <input
                            ref={inputRef}
                            className="ai-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe a chart or KPI..."
                            disabled={loading}
                        />
                        <button className="ai-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            title="Send">
                            <i className="bi bi-send-fill" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
