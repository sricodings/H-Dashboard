import { NavLink } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { path: '/configure', label: 'Configure', icon: 'bi-sliders2' },
    { path: '/orders', label: 'Customer Orders', icon: 'bi-cart3' },
];

export default function Sidebar() {
    return (
        <aside className="app-sidebar">
            <div className="sidebar-section-title">Navigation</div>
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                </NavLink>
            ))}

            <div style={{ marginTop: 'auto', marginBottom: 60 }}>
                <div className="sidebar-section-title">Help</div>
                <a href="https://www.youtube.com/watch?v=9kqDcKqfn6k" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <i className="bi bi-question-circle" />
                    Documentation
                </a>
                <a href="https://github.com/sricodings/H-Dashboard" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <i className="bi bi-github" />
                    GitHub
                </a>
            </div>

            {/* Bottom version badge */}
            <div style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
            }}>
                Datalens Dashboard v1.0.0
            </div>
        </aside>
    );
}
