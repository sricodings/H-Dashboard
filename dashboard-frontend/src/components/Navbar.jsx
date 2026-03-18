import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="app-navbar">
            <Link to="/" className="navbar-brand-logo">⚡ Datalens</Link>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'var(--nav-text-muted)',
                }}>Dashboard Builder</span>
            </div>

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
                <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--success)',
                    boxShadow: '0 0 8px var(--success)',
                    animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: 500 }}>Live</span>
            </div>



            {/* Theme Toggle */}
            <button
                className={`theme-toggle-btn ${theme}`}
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <i className={`bi ${theme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
                <span>{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </button>
        </nav>
    );
}
