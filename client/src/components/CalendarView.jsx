import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { toDateInputString, getTodayInputString } from '../utils/dateUtils';

function CalendarView({ tasks = [], onToggleComplete, onNavigateToTasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayTasks(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayTasks(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayTasks(null);
  };

  // Month and Day calculations
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map tasks to their YYYY-MM-DD date key
  const tasksByDate = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dateKey = toDateInputString(task.dueDate);
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    }
  });

  const todayStr = getTodayInputString();

  return (
    <div className="calendar-view-container">
      {/* 1. Header Toolbar */}
      <div className="calendar-header-toolbar">
        <div>
          <h2>📅 Academic Calendar & Schedule</h2>
          <p className="calendar-sub">
            Visualize your assignment deadlines and exam schedules mapped onto a monthly calendar
          </p>
        </div>

        <div className="calendar-nav-controls">
          <button
            type="button"
            className="calendar-today-btn"
            onClick={handleToday}
          >
            Today
          </button>
          <div className="month-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={handlePrevMonth}
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="current-month-label">
              {monthName} {year}
            </span>
            <button
              type="button"
              className="stepper-btn"
              onClick={handleNextMonth}
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Grid Layout */}
      <div className="saas-card calendar-card">
        {/* Days of week header */}
        <div className="calendar-weekdays-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="weekday-header-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="calendar-days-grid">
          {/* Empty padding cells for start of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day-cell cell-empty" />
          ))}

          {/* Real days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;

            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = dateKey === todayStr;

            return (
              <div
                key={dateKey}
                className={`calendar-day-cell ${isToday ? 'cell-today' : ''} ${
                  dayTasks.length > 0 ? 'has-tasks' : ''
                }`}
                onClick={() => {
                  if (dayTasks.length > 0) {
                    setSelectedDayTasks({ date: dateKey, tasks: dayTasks });
                  }
                }}
              >
                <div className="cell-header">
                  <span className={`day-number ${isToday ? 'badge-today' : ''}`}>
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="day-task-count">{dayTasks.length}</span>
                  )}
                </div>

                <div className="cell-tasks-list">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      className={`calendar-task-pill pill-${(
                        task.priority || 'medium'
                      ).toLowerCase()} ${task.completed ? 'task-done' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task);
                      }}
                      title={`${task.title} (Click to toggle complete)`}
                    >
                      <span className="pill-dot" />
                      <span className="pill-title">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="more-tasks-indicator">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Date Task Preview Modal / Drawer */}
      {selectedDayTasks && (
        <div className="saas-card selected-date-drawer">
          <div className="widget-header">
            <div className="widget-title-group">
              <CalendarIcon size={18} className="text-primary" />
              <h3>Tasks Due on {selectedDayTasks.date}</h3>
            </div>
            <button
              type="button"
              className="widget-link-btn"
              onClick={() => setSelectedDayTasks(null)}
            >
              Close
            </button>
          </div>

          <ul className="widget-task-list">
            {selectedDayTasks.tasks.map((task) => (
              <li key={task._id} className="widget-task-row">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    onToggleComplete(task);
                    // Update local preview state
                    setSelectedDayTasks((prev) => ({
                      ...prev,
                      tasks: prev.tasks.map((t) =>
                        t._id === task._id ? { ...t, completed: !t.completed } : t
                      ),
                    }));
                  }}
                  className="task-checkbox"
                />
                <div className="widget-task-details">
                  <span
                    className={`widget-task-name ${
                      task.completed ? 'task-completed' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`badge badge-priority-${(
                      task.priority || 'medium'
                    ).toLowerCase()}`}
                  >
                    {task.priority || 'Medium'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
