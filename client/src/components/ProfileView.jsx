import { User, Mail, Shield, Award, Calendar, LogOut, CheckCircle2 } from 'lucide-react';

function ProfileView({ user, tasks = [], onLogout }) {
  const initials = (user?.name || 'Student')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="profile-view-container">
      <div className="profile-header-card saas-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-details">
            <h2>{user?.name || 'Student User'}</h2>
            <p className="profile-email">
              <Mail size={14} />
              <span>{user?.email || 'student@task.app'}</span>
            </p>
            <div className="profile-badges-row">
              <span className="profile-badge badge-role">🎓 Student Account</span>
              <span className="profile-badge badge-auth">🔒 JWT Authenticated</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="delete-btn profile-logout-btn"
          onClick={onLogout}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>

      {/* Academic Milestone Stats */}
      <div className="saas-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <Award size={18} className="text-primary" />
            <h3>Academic Milestone Records</h3>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span className="profile-stat-num text-primary">{totalTasks}</span>
            <span className="profile-stat-label">Total Registered Tasks</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-num text-success">{completedTasks}</span>
            <span className="profile-stat-label">Finished Goals</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-num text-amber">{completionRate}%</span>
            <span className="profile-stat-label">Overall Completion Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
