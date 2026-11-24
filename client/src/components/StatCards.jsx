import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

function StatCards({ tasks = [], onCardClick }) {
  // Calculate real metrics directly from user tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < today
  ).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Tasks',
      value: totalTasks,
      icon: Layers,
      colorClass: 'card-blue',
      badgeText: `${completionPercentage}% Done`,
      badgeType: 'neutral',
      subtitle: 'All created academic tasks',
      filterParam: 'all',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      colorClass: 'card-green',
      badgeText: `${completionPercentage}% Rate`,
      badgeType: 'success',
      subtitle: 'Finished study milestones',
      filterParam: 'completed',
    },
    {
      id: 'pending',
      title: 'Pending',
      value: pendingTasks,
      icon: Clock,
      colorClass: 'card-amber',
      badgeText: pendingTasks > 0 ? 'In Progress' : 'Caught Up',
      badgeType: 'warning',
      subtitle: 'Tasks awaiting completion',
      filterParam: 'pending',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertCircle,
      colorClass: 'card-red',
      badgeText: overdueTasks > 0 ? 'Needs Attention' : 'Zero Overdue',
      badgeType: overdueTasks > 0 ? 'danger' : 'success',
      subtitle: 'Passed assignment deadlines',
      filterParam: 'all',
    },
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`stat-card ${card.colorClass}`}
            onClick={() => onCardClick && onCardClick(card.filterParam)}
            title={`View ${card.title}`}
          >
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">
                <Icon size={20} className="stat-icon" />
              </div>
              <span className={`stat-trend-badge badge-${card.badgeType}`}>
                {card.badgeText}
              </span>
            </div>

            <div className="stat-card-body">
              <span className="stat-card-value">{card.value}</span>
              <h4 className="stat-card-title">{card.title}</h4>
            </div>

            <div className="stat-card-footer">
              <span className="stat-card-subtitle">{card.subtitle}</span>
              <ArrowUpRight size={14} className="stat-card-arrow" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;
