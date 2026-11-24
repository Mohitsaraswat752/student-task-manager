import { Sun, Moon, Palette, Server, Database, Code, ShieldCheck } from 'lucide-react';

function SettingsView({ darkMode, onToggleDarkMode }) {
  return (
    <div className="settings-view-container">
      {/* 1. Theme Preferences */}
      <div className="saas-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <Palette size={18} className="text-primary" />
            <h3>Appearance & Theme</h3>
          </div>
        </div>

        <div className="setting-item-row">
          <div>
            <h4 className="setting-title">Workspace Color Mode</h4>
            <p className="setting-desc">
              Choose between clean Light Mode or modern SaaS Dark Mode (persists across sessions)
            </p>
          </div>
          <button
            type="button"
            className="topbar-quick-add-btn"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. System Architecture & Placement Portfolio Stack */}
      <div className="saas-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <Code size={18} className="text-primary" />
            <h3>Application Architecture</h3>
          </div>
          <span className="badge badge-due">MERN Stack 2026</span>
        </div>

        <div className="stack-grid">
          <div className="stack-card">
            <div className="stack-icon-box">⚛️</div>
            <div className="stack-info">
              <span className="stack-title">React 19 & Vite</span>
              <span className="stack-desc">Frontend SPA with Recharts & Lucide Icons</span>
            </div>
          </div>

          <div className="stack-card">
            <div className="stack-icon-box">🚀</div>
            <div className="stack-info">
              <span className="stack-title">Node.js & Express</span>
              <span className="stack-desc">RESTful backend with MongoDB Aggregation</span>
            </div>
          </div>

          <div className="stack-card">
            <div className="stack-icon-box">🍃</div>
            <div className="stack-info">
              <span className="stack-title">MongoDB Atlas</span>
              <span className="stack-desc">Cloud NoSQL database with user schemas</span>
            </div>
          </div>

          <div className="stack-card">
            <div className="stack-icon-box">🔒</div>
            <div className="stack-info">
              <span className="stack-title">JWT & Bcrypt</span>
              <span className="stack-desc">Cryptographic password hashing & auth tokens</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
