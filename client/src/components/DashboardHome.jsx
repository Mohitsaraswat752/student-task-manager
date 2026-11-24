import {
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  Calendar as CalendarIcon,
  AlertCircle,
  Activity,
  CheckCheck,
  CalendarClock,
} from 'lucide-react';
import StatCards from './StatCards';

function DashboardHome({
  user,
  tasks = [],
  onNavigate,
  onQuickAddTask,
  onToggleComplete,
  loading,
}) {
  // Determine dynamic time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted current date: "Tuesday, November 24, 2026"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Task metric calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Helper: check if a task is overdue
  const isOverdue = (task) =>
    !task.completed && task.dueDate && new Date(task.dueDate) < todayStart;

  // Helper: filter tasks due today
  const isDueToday = (task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return taskDate === today;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper: friendly relative time for recent activity
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // 1. Today's Tasks List
  const todayTasksList = tasks.filter((t) => isDueToday(t));

  // 2. Upcoming Deadlines List (sorted chronologically earliest first)
  const upcomingDeadlinesList = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  // 3. Recent Activity Stream (based on updatedAt / createdAt)
  const recentActivities = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5)
    .map((task) => {
      const isCompleted = task.completed;
      const isUpdated =
        task.updatedAt && task.createdAt && task.updatedAt !== task.createdAt;
      return {
        _id: task._id,
        task,
        type: isCompleted ? 'completed' : isUpdated ? 'updated' : 'created',
        time: formatRelativeTime(task.updatedAt || task.createdAt),
      };
    });

  return (
    <div className="dashboard-home-container">
      {/* 1. Welcome Hero Banner */}
      <section className="dashboard-hero-banner">
        <div className="hero-content">
          <div className="hero-date-badge">
            <CalendarIcon size={14} />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="hero-title">
            {getGreeting()}, <span className="hero-highlight">{user?.name || 'Student'}</span>! 👋
          </h1>
          <p className="hero-subtitle">
            {pendingTasks === 0 && totalTasks > 0
              ? '🎉 All caught up! You have completed all your tasks.'
              : `You have ${pendingTasks} pending study task${pendingTasks === 1 ? '' : 's'} remaining. Stay focused and productive today!`}
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => onNavigate('tasks')}
            >
              <Plus size={16} />
              <span>Create New Task</span>
            </button>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => onNavigate('analytics')}
            >
              <TrendingUp size={16} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* Hero Progress Gauge Card */}
        <div className="hero-gauge-card">
          <div className="gauge-header">
            <span className="gauge-label">Study Completion</span>
            <span className="gauge-value">{completionPercentage}%</span>
          </div>
          <div className="hero-progress-bar-bg">
            <div
              className="hero-progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="gauge-footer">
            <span>{completedTasks} completed</span>
            <span>{totalTasks} total</span>
          </div>
        </div>
      </section>

      {/* 2. Four KPI Statistics Cards */}
      <StatCards
        tasks={tasks}
        onCardClick={(filterParam) => {
          if (onNavigate) {
            onNavigate('tasks');
          }
        }}
      />

      {/* 3. Dashboard Two-Column Grid Layout */}
      <div className="dashboard-grid-layout">
        {/* ========================================================
            LEFT COLUMN: TODAY'S TASKS & UPCOMING DEADLINES
            ======================================================== */}
        <div className="dashboard-grid-column main-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* WIDGET 1: TODAY'S TASKS */}
          <div className="saas-card-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <Clock size={18} className="widget-icon text-primary" />
                <h3>Today's Tasks</h3>
                <span className="widget-counter">{todayTasksList.length}</span>
              </div>
              <button
                type="button"
                className="widget-link-btn"
                onClick={() => onNavigate('tasks')}
              >
                <span>Manage all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="widget-body">
              {todayTasksList.length === 0 ? (
                <div className="widget-empty">
                  <CheckCircle2 size={32} className="empty-icon" />
                  <p>No tasks scheduled for today. Great time to get ahead!</p>
                  <button
                    type="button"
                    className="widget-action-btn"
                    onClick={() => onNavigate('tasks')}
                  >
                    + Add a Task for Today
                  </button>
                </div>
              ) : (
                <ul className="widget-task-list">
                  {todayTasksList.map((task) => (
                    <li key={task._id} className="widget-task-row">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleComplete(task)}
                        className="task-checkbox"
                        title="Quick complete"
                      />
                      <div className="widget-task-details">
                        <span
                          className={`widget-task-name ${
                            task.completed ? 'task-completed' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="widget-task-meta">
                          <span
                            className={`badge badge-priority-${(
                              task.priority || 'medium'
                            ).toLowerCase()}`}
                          >
                            {task.priority || 'Medium'}
                          </span>
                          <span className="badge badge-due">Due Today</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* WIDGET 2: UPCOMING DEADLINES */}
          <div className="saas-card-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <CalendarClock size={18} className="widget-icon text-primary" />
                <h3>Upcoming Deadlines</h3>
                <span className="widget-counter">{upcomingDeadlinesList.length}</span>
              </div>
              <button
                type="button"
                className="widget-link-btn"
                onClick={() => onNavigate('tasks')}
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="widget-body">
              {upcomingDeadlinesList.length === 0 ? (
                <div className="widget-empty">
                  <CalendarIcon size={32} className="empty-icon" />
                  <p>No upcoming task deadlines found. Set a due date on your tasks!</p>
                </div>
              ) : (
                <ul className="widget-task-list">
                  {upcomingDeadlinesList.map((task) => {
                    const taskOverdue = isOverdue(task);
                    return (
                      <li
                        key={task._id}
                        className={`widget-task-row ${
                          taskOverdue ? 'row-overdue' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleComplete(task)}
                          className="task-checkbox"
                          title="Quick complete"
                        />
                        <div className="widget-task-details">
                          <span
                            className={`widget-task-name ${
                              task.completed ? 'task-completed' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="widget-task-meta">
                            <span
                              className={`badge badge-priority-${(
                                task.priority || 'medium'
                              ).toLowerCase()}`}
                            >
                              {task.priority || 'Medium'}
                            </span>
                            <span className="badge badge-due">
                              📅 {formatDate(task.dueDate)}
                            </span>
                            {taskOverdue && (
                              <span className="badge badge-overdue">
                                ⚠️ Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: QUICK OVERVIEW & RECENT ACTIVITY
            ======================================================== */}
        <div className="dashboard-grid-column side-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* WIDGET 3: QUICK ACADEMIC OVERVIEW */}
          <div className="saas-card-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <Sparkles size={18} className="widget-icon text-amber" />
                <h3>Study Snapshot</h3>
              </div>
            </div>

            <div className="widget-body">
              <div className="quick-summary-list">
                <div className="summary-row">
                  <span className="summary-label">Total Goals</span>
                  <span className="summary-num font-bold">{totalTasks}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Completed Tasks</span>
                  <span className="summary-num text-success font-bold">
                    {completedTasks}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Pending Deadlines</span>
                  <span className="summary-num text-primary font-bold">
                    {pendingTasks}
                  </span>
                </div>
              </div>

              <div className="widget-callout-box">
                <ListTodo size={18} />
                <p>
                  Tip: Tasks marked as <strong>High Priority</strong> carry the greatest academic weight. Tackle those early in your day!
                </p>
              </div>
            </div>
          </div>

          {/* WIDGET 4: RECENT ACTIVITY FEED */}
          <div className="saas-card-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <Activity size={18} className="widget-icon text-primary" />
                <h3>Recent Activity</h3>
              </div>
            </div>

            <div className="widget-body">
              {recentActivities.length === 0 ? (
                <div className="widget-empty">
                  <p>No activity logged yet.</p>
                </div>
              ) : (
                <ul className="activity-timeline-list">
                  {recentActivities.map((act) => (
                    <li key={act._id} className="activity-timeline-item">
                      <div className={`activity-icon-dot dot-${act.type}`}>
                        {act.type === 'completed' ? (
                          <CheckCheck size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">
                          <strong className="activity-action">
                            {act.type === 'completed'
                              ? 'Finished'
                              : act.type === 'updated'
                              ? 'Updated'
                              : 'Added'}
                          </strong>{' '}
                          <span className="activity-task-title">
                            "{act.task.title}"
                          </span>
                        </p>
                        <span className="activity-timestamp">{act.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
