import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  User,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

function Sidebar({
  currentView,
  onNavigate,
  user,
  onLogout,
  isOpen,
  onClose,
  taskStats = { total: 0, pending: 0 },
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badge: taskStats.pending > 0 ? taskStats.pending : null,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart2,
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  // User initials for avatar
  const initials = (user?.name || 'Student')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`saas-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Sparkles size={20} className="brand-icon" />
          </div>
          <div className="brand-text">
            <h2>TaskFlow</h2>
            <span className="brand-badge">STUDENT PRO</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onClose) onClose();
                    }}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== null && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout Section at Bottom */}
        <div className="sidebar-footer">
          <div
            className="user-card"
            onClick={() => {
              onNavigate('profile');
              if (onClose) onClose();
            }}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-email">{user?.email || 'student@task.app'}</span>
            </div>
          </div>
          <button
            type="button"
            className="logout-action-btn"
            onClick={onLogout}
            title="Log out of account"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
