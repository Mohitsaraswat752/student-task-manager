import { useState, useEffect } from 'react';
import {
  RotateCcw,
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ANALYTICS_URL = `${API_BASE_URL}/tasks/analytics`;

// Custom Recharts Tooltip for Bar Chart
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload;
    return (
      <div className="recharts-custom-tooltip">
        <p className="tooltip-date">
          {dayData.date ? `Date: ${dayData.date}` : label}
        </p>
        <div className="tooltip-item text-primary">
          <span>Created Tasks:</span>
          <strong>{dayData.created || 0}</strong>
        </div>
        <div className="tooltip-item text-success">
          <span>Completed Tasks:</span>
          <strong>{dayData.completed || 0}</strong>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Recharts Tooltip for Doughnut Chart
function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="recharts-custom-tooltip">
        <p className="tooltip-date" style={{ color: item.payload.color || item.color }}>
          {item.name}
        </p>
        <div className="tooltip-item">
          <span>Tasks:</span>
          <strong>{item.value}</strong>
        </div>
      </div>
    );
  }
  return null;
}

function Analytics({ token, onBack, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(7); // 7 or 30 days

  const fetchAnalytics = async (selectedRange = range) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${ANALYTICS_URL}?range=${selectedRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        if (onLogout) {
          onLogout();
        }
        throw new Error('Your login session expired. Please log in again.');
      }

      const contentType = response.headers.get('content-type') || '';
      let result;
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned ${response.status} (${response.statusText || 'Not JSON'}). Is backend running at ${API_BASE_URL}?`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load analytics data.');
      }

      setData(result);
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      setError(err.message || 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics(range);
    }
  }, [token, range]);

  if (loading && !data) {
    return (
      <div className="analytics-loading-box">
        <div className="spinner"></div>
        <p>Gathering your study analytics from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error-box">
        <AlertCircle size={32} className="text-danger" />
        <p className="error-message">⚠️ {error}</p>
        <button
          type="button"
          className="topbar-quick-add-btn"
          onClick={() => fetchAnalytics(range)}
        >
          <RotateCcw size={14} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const productivityData = data.productivity || data.weeklyProductivity || [];

  // Data for Doughnut Chart (Completed vs Pending)
  const doughnutData =
    data.totalTasks > 0
      ? [
          { name: 'Completed', value: data.completedTasks, color: '#10b981' },
          { name: 'Pending', value: data.pendingTasks, color: '#f59e0b' },
        ]
      : [
          { name: 'No Tasks', value: 1, color: '#e2e8f0' },
        ];

  // Data for Priority Distribution Bar Chart
  const priorityChartData = (data.priorityDistribution || []).map((p) => ({
    priority: `${p.priority} Priority`,
    total: p.total,
    completed: p.completed,
    pending: p.pending,
    fillColor: p.color,
  }));

  return (
    <div className="analytics-page-wrapper">
      {/* 1. Header & Range Controls */}
      <div className="analytics-page-header">
        <div>
          <h2>📊 Performance & Study Analytics</h2>
          <p className="analytics-subtitle">
            Interactive visual charts generated in real time from your database
          </p>
        </div>

        <div className="analytics-header-controls">
          {/* 7 Days vs 30 Days Toggle */}
          <div className="range-toggle-group">
            <button
              type="button"
              className={`range-pill ${range === 7 ? 'active' : ''}`}
              onClick={() => setRange(7)}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`range-pill ${range === 30 ? 'active' : ''}`}
              onClick={() => setRange(30)}
            >
              Last 30 Days
            </button>
          </div>

          <button
            type="button"
            className="analytics-icon-btn"
            onClick={() => fetchAnalytics(range)}
            title="Refresh analytics data"
          >
            <RotateCcw size={15} />
          </button>

          {onBack && (
            <button
              type="button"
              className="analytics-back-btn"
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary 4 KPI Stats Grid */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card card-total">
          <div className="kpi-icon-box">
            <Layers size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Tasks</span>
            <span className="kpi-val">{data.totalTasks}</span>
          </div>
        </div>

        <div className="analytics-kpi-card card-completed">
          <div className="kpi-icon-box">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Completed</span>
            <span className="kpi-val text-success">{data.completedTasks}</span>
          </div>
        </div>

        <div className="analytics-kpi-card card-pending">
          <div className="kpi-icon-box">
            <Clock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pending</span>
            <span className="kpi-val text-amber">{data.pendingTasks}</span>
          </div>
        </div>

        <div className="analytics-kpi-card card-overdue">
          <div className="kpi-icon-box">
            <AlertCircle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Overdue</span>
            <span className="kpi-val text-danger">{data.overdueTasks}</span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Dual-Bar Productivity Chart */}
      <div className="saas-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <BarChart3 size={18} className="text-primary" />
            <h3>Productivity Activity ({range === 7 ? 'Last 7 Days' : 'Last 30 Days'})</h3>
          </div>
          <span className="badge badge-due">
            {range === 7 ? 'Daily Trend' : 'Monthly Trend'}
          </span>
        </div>

        <div className="recharts-wrapper-container" style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productivityData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 14, fontSize: 13 }}
                formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
              />
              <Bar
                dataKey="created"
                name="Tasks Created"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={range === 30 ? 12 : 24}
              />
              <Bar
                dataKey="completed"
                name="Tasks Completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={range === 30 ? 12 : 24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Two-Column Row: Doughnut Chart & Priority Distribution */}
      <div className="analytics-two-col-grid">
        {/* Doughnut Chart: Completed vs Pending */}
        <div className="saas-card" style={{ marginBottom: 0 }}>
          <div className="widget-header">
            <div className="widget-title-group">
              <PieChartIcon size={18} className="text-primary" />
              <h3>Completed vs Pending</h3>
            </div>
            <span className="badge badge-due">{data.completionPercentage}% Done</span>
          </div>

          <div style={{ width: '100%', height: 240, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doughnutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={data.totalTasks > 0 ? 4 : 0}
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value, entry) => (
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Percentage Display */}
            <div className="doughnut-center-label">
              <span className="doughnut-percent">{data.completionPercentage}%</span>
              <span className="doughnut-subtext">Completion</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Chart & Stats */}
        <div className="saas-card" style={{ marginBottom: 0 }}>
          <div className="widget-header">
            <div className="widget-title-group">
              <Calendar size={18} className="text-primary" />
              <h3>Priority Distribution</h3>
            </div>
            <span className="badge badge-due">{data.totalTasks} Tasks</span>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            {data.totalTasks === 0 ? (
              <div className="widget-empty">
                <CheckCircle2 size={32} className="empty-icon" />
                <p>No tasks found to calculate priority distribution.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityChartData}
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-color)' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="priority"
                    tick={{ fontSize: 12, fill: 'var(--text-primary)', fontWeight: 600 }}
                    axisLine={{ stroke: 'var(--border-color)' }}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'completed' ? 'Completed' : 'Pending']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="pending"
                    name="Pending"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
