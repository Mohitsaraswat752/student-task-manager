import {
  Plus,
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

function TaskManager({
  tasks,
  newTaskTitle,
  setNewTaskTitle,
  newPriority,
  setNewPriority,
  newDueDate,
  setNewDueDate,
  handleAddTask,
  handleToggleComplete,
  handleDeleteTask,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  editingTaskId,
  editTitle,
  setEditTitle,
  editPriority,
  setEditPriority,
  editDueDate,
  setEditDueDate,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  handleResetFilters,
  displayedTasks,
  loading,
  completedCount,
  pendingCount,
  overdueCount,
  isOverdue,
  formatDate,
}) {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sortBy !== 'default';

  return (
    <div className="task-manager-container">
      {/* 1. Header with Title & Stats Overview */}
      <div className="task-manager-header">
        <div>
          <h2>📝 My Study Tasks & Goals</h2>
          <p className="task-manager-sub">
            Organize, prioritize, and manage all your academic assignments in one place
          </p>
        </div>
        <div className="task-count-pill">
          <span>{tasks.length} Total</span>
          <span className="dot-sep">•</span>
          <span className="text-success">{completedCount} Done</span>
          <span className="dot-sep">•</span>
          <span className="text-amber">{pendingCount} Pending</span>
        </div>
      </div>

      {/* 2. Modern Quick Add Task Bar */}
      <form onSubmit={handleAddTask} className="saas-card modern-task-form">
        <div className="task-input-primary-row">
          <input
            type="text"
            className="modern-task-input"
            placeholder="What study task or assignment do you need to do?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit" className="topbar-quick-add-btn add-task-submit-btn">
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="task-options-secondary-row">
          <div className="option-field">
            <span className="option-label">Priority:</span>
            <select
              className="modern-select"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            >
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🔵 Low Priority</option>
            </select>
          </div>

          <div className="option-field">
            <span className="option-label">Due Date:</span>
            <input
              type="date"
              className="modern-date-input"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* 3. Search & Filter SaaS Controls */}
      <div className="saas-card filter-toolbar-card">
        {/* Search input with vector icon */}
        <div className="search-box-wrapper">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-box-clear"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="filter-controls-bar">
          {/* Status Pills */}
          <div className="status-pills">
            <button
              type="button"
              className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={`status-pill ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`status-pill ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Done ({completedCount})
            </button>
          </div>

          <div className="dropdowns-group">
            {/* Priority Filter */}
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🔵 Low Priority</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Newest First</option>
                <option value="dueDate">Sort: Earliest Due Date</option>
                <option value="priority">Sort: Highest Priority</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
                title="Reset all search and filter conditions"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Task List */}
      <div className="saas-card task-list-card">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p>Loading your study tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={36} className="empty-icon" />
            <p className="empty-title">No tasks registered yet!</p>
            <p className="empty-desc">
              Create your first student task above to get started organizing your studies.
            </p>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="empty-state">
            <Filter size={32} className="empty-icon" />
            <p className="empty-title">No matching tasks found</p>
            <p className="empty-desc">
              Try adjusting your search query, priority filter, or status selection.
            </p>
            <button
              type="button"
              className="topbar-quick-add-btn"
              style={{ margin: '14px auto 0' }}
              onClick={handleResetFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <ul className="task-list">
            {displayedTasks.map((task) => {
              const taskIsOverdue = isOverdue(task);
              const priorityClass = `badge-priority-${(
                task.priority || 'medium'
              ).toLowerCase()}`;

              return (
                <li
                  key={task._id}
                  className={`task-item ${taskIsOverdue ? 'item-overdue' : ''}`}
                >
                  {editingTaskId === task._id ? (
                    /* INLINE EDIT MODE */
                    <div className="task-edit-container">
                      <input
                        type="text"
                        className="edit-title-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title..."
                        autoFocus
                      />
                      <div className="edit-controls-row">
                        <div className="edit-fields-group">
                          <select
                            className="edit-select"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                          >
                            <option value="High">🔴 High Priority</option>
                            <option value="Medium">🟡 Medium Priority</option>
                            <option value="Low">🔵 Low Priority</option>
                          </select>

                          <input
                            type="date"
                            className="edit-date-input"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                          />
                        </div>

                        <div className="edit-buttons-group">
                          <button
                            type="button"
                            className="save-btn"
                            onClick={() => handleSaveEdit(task._id)}
                          >
                            <Check size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* NORMAL TASK DISPLAY */
                    <>
                      <div className="task-left">
                        <input
                          type="checkbox"
                          className="task-checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                        />
                        <div
                          className="task-content"
                          onClick={() => handleToggleComplete(task)}
                        >
                          <span
                            className={`task-text ${
                              task.completed ? 'task-completed' : ''
                            }`}
                          >
                            {task.title}
                          </span>

                          <div className="task-meta">
                            <span className={`badge ${priorityClass}`}>
                              {task.priority || 'Medium'}
                            </span>

                            {task.dueDate && (
                              <span className="badge badge-due">
                                📅 Due: {formatDate(task.dueDate)}
                              </span>
                            )}

                            {taskIsOverdue && (
                              <span className="badge badge-overdue">
                                ⚠️ Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="task-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleStartEdit(task)}
                          title="Edit this task"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete this task"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Summary Footer */}
        <div className="stats-bar">
          <span>
            Showing <strong>{displayedTasks.length}</strong> of{' '}
            <strong>{tasks.length}</strong> tasks
          </span>
          <span>Completed: {completedCount}</span>
          <span>Pending: {pendingCount}</span>
          {overdueCount > 0 && (
            <span className="stat-overdue">Overdue: {overdueCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskManager;
