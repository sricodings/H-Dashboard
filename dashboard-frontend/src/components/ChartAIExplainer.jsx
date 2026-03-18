import React, { useState } from 'react';
import axios from 'axios';

const API = '/api';

export default function ChartAIExplainer({ config, data }) {
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');
    const [playing, setPlaying] = useState(false);

    const getExplanation = async () => {
        if (explanation) return; // Already have it
        setLoading(true);
        setError('');
        try {
            // Simplify data to send to backend to save tokens
            const simplifiedData = data.slice(0, 15).map(d => ({
                label: d.x || d.name,
                value: d.y || d.value
            }));

            const { data: res } = await axios.post(`${API}/ai/explain-chart`, {
                config,
                data: simplifiedData
            });

            if (res.success) {
                setExplanation(res.data);
            } else {
                setError('Failed to generate explanation.');
            }
        } catch (err) {
            console.error(err);
            setError('Error reaching AI service.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAudio = () => {
        if (!explanation) return;

        if (playing) {
            window.speechSynthesis.cancel();
            setPlaying(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(explanation);
            // Try to find a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Google') || v.name.includes('Siri')));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            utterance.rate = 1.0;
            utterance.onend = () => setPlaying(false);
            window.speechSynthesis.speak(utterance);
            setPlaying(true);
        }
    };

    return (
        <div style={{ position: 'absolute', top: 5, right: 10, zIndex: 10 }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 5, alignSelf: 'flex-end' }}>
                    {explanation && (
                        <button 
                            className="btn-icon-custom" 
                            onClick={toggleAudio}
                            style={{ background: playing ? 'var(--accent)' : 'var(--bg-secondary)', color: playing ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem' }}
                            title="Play Audio"
                        >
                            <i className={`bi ${playing ? 'bi-stop-fill' : 'bi-play-fill'}`} />
                        </button>
                    )}
                    <button 
                        className="btn-icon-custom" 
                        onClick={getExplanation}
                        disabled={loading}
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', color: 'var(--text-primary)' }}
                        title="AI AI Explainer"
                    >
                        {loading ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-robot" />}
                    </button>
                </div>
                
                {explanation && (
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.95)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--border)', 
                        borderRadius: 8, 
                        padding: 10, 
                        marginTop: 5,
                        width: 250,
                        maxHeight: 200,
                        overflowY: 'auto',
                        fontSize: '0.75rem',
                        color: '#333',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--accent)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>AI Insights</span>
                            <i className="bi bi-x" style={{ cursor: 'pointer' }} onClick={() => { setExplanation(''); window.speechSynthesis.cancel(); setPlaying(false); }} />
                        </div>
                        {explanation}
                    </div>
                )}
                {error && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'var(--danger-light)', padding: '4px 8px', borderRadius: 4, marginTop: 5 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
