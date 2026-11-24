import { Menu, Sun, Moon, Plus, Bell, Calendar as CalendarIcon } from 'lucide-react';

function Topbar({
  currentView,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  onQuickNewTask,
  user,
}) {
  // Format current date: e.g. "Tuesday, Nov 24, 2026"
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // View titles map
  const viewTitles = {
    dashboard: 'Dashboard Overview',
    tasks: 'My Tasks & Study Goals',
    calendar: 'Schedule & Deadlines',
    analytics: 'Performance & Analytics',
    profile: 'Student Profile',
    settings: 'Workspace Settings',
  };

  const initials = (user?.name || 'Student')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="saas-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumbs">
          <span className="crumb-root">TaskFlow</span>
          <span className="crumb-separator">/</span>
          <h1 className="crumb-current">{viewTitles[currentView] || 'Dashboard'}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live Date Pill */}
        <div className="topbar-date-pill">
          <CalendarIcon size={14} className="date-icon" />
          <span>{todayStr}</span>
        </div>

        {/* Quick Add Task Button */}
        <button
          type="button"
          className="topbar-quick-add-btn"
          onClick={onQuickNewTask}
          title="Create a new task"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          className="topbar-icon-btn theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Mini Chip */}
        <div className="topbar-user-chip">
          <div className="user-avatar-small">{initials}</div>
          <span className="user-name-small">{user?.name || 'Student'}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
