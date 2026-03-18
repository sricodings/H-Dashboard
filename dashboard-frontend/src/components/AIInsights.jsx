import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = '/api';

export default function AIInsights({ orders }) {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);

    const toggleAudio = () => {
        if (!insights.length) return;

        if (playing) {
            window.speechSynthesis.cancel();
            setPlaying(false);
        } else {
            const fullText = "Dashboard Analysis. " + insights.join(". ");
            const utterance = new SpeechSynthesisUtterance(fullText);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Google') || v.name.includes('Siri'))) || voices[0];
            
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            utterance.onend = () => setPlaying(false);
            utterance.onerror = () => setPlaying(false);
            
            window.speechSynthesis.speak(utterance);
            setPlaying(true);
        }
    };

    const fetchInsights = async () => {
        if (!orders || orders.length === 0) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/ai/insights`, { orders });
            if (data.success) {
                setInsights(data.insights || []);
            }
        } catch (err) {
            console.error('Failed to fetch AI insights', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
        return () => window.speechSynthesis.cancel(); // Cleanup
    }, [orders]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.info('Insight copied to clipboard');
    };

    if (orders.length === 0) return null;

    return (
        <div className="dash-card ai-insights-container glass-effect" style={{ marginBottom: 20 }}>
            <div className="card-header-custom" style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}>
                <div className="card-title">
                    <span className="status-live-dot" />
                    <i className="bi bi-robot" style={{ marginRight: 8, color: 'var(--accent)' }} />
                    AI Intelligence Agent
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {loading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', animation: 'pulse 1.5s infinite' }}>Analyzing...</span>}
                    {insights.length > 0 && (
                        <button className="btn-icon" onClick={toggleAudio} title={playing ? "Stop Audio" : "Listen to Analysis"}
                            style={{ background: playing ? 'var(--accent)' : 'var(--bg-active)', color: playing ? '#fff' : 'var(--accent)', borderRadius: '50%', width: 32, height: 32 }}>
                            <i className={`bi ${playing ? 'bi-stop-fill' : 'bi-headphones'}`} />
                        </button>
                    )}
                    <button className="btn-icon" onClick={fetchInsights} title="Refresh Insights"
                        style={{ background: 'var(--bg-active)', color: 'var(--accent)', borderRadius: '50%', width: 32, height: 32 }}>
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="card-body" style={{ padding: 16 }}>
                {loading && !insights.length ? (
                    <div style={{ padding: '4px 0' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton skeleton-text"
                                style={{ width: i === 3 ? '70%' : '100%', marginBottom: 15, height: 20, borderRadius: 6 }} />
                        ))}
                    </div>
                ) : (
                    <ul className="ai-insights-list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {insights.map((insight, i) => (
                            <li key={i} className="ai-insight-item" style={{
                                animation: `fadeInRight 0.4s ease forwards ${i * 0.1}s`,
                                opacity: 0
                            }}>
                                <div className="ai-insight-icon">
                                    <i className="bi bi-lightning-charge-fill" />
                                </div>
                                <div className="ai-insight-text">{insight}</div>
                                <button className="copy-insight-btn" onClick={() => handleCopy(insight)} title="Copy Insight">
                                    <i className="bi bi-clipboard" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
