import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import './App.css';

const API_URL = 'http://localhost:5000/tasks';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Task & Form State
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'High' | 'Medium' | 'Low'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'dueDate' | 'priority'

  // Load user tasks when authenticated
  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [token]);

  // 1. Fetch user's tasks with JWT Bearer Token
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks from server:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Add a new task (POST with Title, Priority, Due Date)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate || null,
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([createdTask, ...tasks]);
        setNewTaskTitle('');
        setNewPriority('Medium');
        setNewDueDate('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // 3. Toggle completed status (PUT)
  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((t) => (t._id === task._id ? updatedTask : t))
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // 4. Delete a task (DELETE)
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        setTasks(tasks.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // 5. Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setTasks([]);
  };

  // Helper: check if a task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  };

  // Helper: format due date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Reset all search and filter controls
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('default');
  };

  // 6. COMBINED SEARCH, FILTER, AND SORT LOGIC
  const getFilteredAndSortedTasks = () => {
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };

    // Step A: Apply Search & Filters
    const filtered = tasks.filter((task) => {
      // 1. Search filter (title matching)
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      // 2. Status filter (All, Pending, Completed)
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? task.completed
          : !task.completed;

      // 3. Priority filter (All, High, Medium, Low)
      const matchesPriority =
        priorityFilter === 'all' ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Step B: Apply Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const weightA = priorityWeights[a.priority] || 2;
        const weightB = priorityWeights[b.priority] || 2;
        return weightB - weightA; // High -> Medium -> Low
      }

      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;  // Tasks without date pushed to end
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate); // Earliest first
      }

      // Default: Original creation order (most recent first)
      return 0;
    });
  };

  // Render Auth component if not logged in
  if (!token) {
    return (
      <Auth
        onAuthSuccess={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
        }}
      />
    );
  }

  const displayedTasks = getFilteredAndSortedTasks();
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sortBy !== 'default';

  return (
    <div className="app-container">
      {/* User Greeting & Logout Bar */}
      <div className="user-bar">
        <span>
          Welcome, <strong className="user-name">{user?.name || 'Student'}</strong>! 🎓
        </span>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Header */}
      <div className="header">
        <h1>Student Task Manager</h1>
        <p>Search, filter, and prioritize your study goals</p>
      </div>

      {/* Add Task Form with Priority & Due Date */}
      <form onSubmit={handleAddTask} className="task-form">
        <div className="task-form-main">
          <input
            type="text"
            className="task-input"
            placeholder="Enter a new student task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit" className="add-btn">
            Add Task
          </button>
        </div>

        <div className="task-form-options">
          <div className="form-option-group">
            <label htmlFor="priority">Priority:</label>
            <select
              id="priority"
              className="form-select"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            >
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🔵 Low</option>
            </select>
          </div>

          <div className="form-option-group">
            <label htmlFor="dueDate">Due Date:</label>
            <input
              id="dueDate"
              type="date"
              className="form-date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="search-filter-section">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="filter-row">
          {/* Status Filter Pills */}
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

          {/* Priority & Sorting Dropdowns */}
          <div className="filter-dropdowns">
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

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Newest First</option>
              <option value="dueDate">Sort: Due Date (Earliest)</option>
              <option value="priority">Sort: Priority (High to Low)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Task List */}
      {loading ? (
        <div className="empty-state">⏳ Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          🎉 No tasks yet! Add your first study task above.
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="empty-state">
          🔍 No tasks match your search and filter criteria.
          <div>
            <button
              type="button"
              className="empty-filter-btn"
              onClick={handleResetFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <ul className="task-list">
          {displayedTasks.map((task) => {
            const taskIsOverdue = isOverdue(task);
            const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

            return (
              <li
                key={task._id}
                className={`task-item ${taskIsOverdue ? 'item-overdue' : ''}`}
              >
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
                      className={`task-text ${task.completed ? 'task-completed' : ''}`}
                    >
                      {task.title}
                    </span>

                    {/* Meta Badges */}
                    <div className="task-meta">
                      <span className={`badge ${priorityClass}`}>
                        {task.priority === 'High' && '🔴'}
                        {task.priority === 'Medium' && '🟡'}
                        {task.priority === 'Low' && '🔵'}
                        {' '}{task.priority || 'Medium'}
                      </span>

                      {task.dueDate && (
                        <span className="badge badge-due">
                          📅 {formatDate(task.dueDate)}
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

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Summary Footer */}
      <div className="stats-bar">
        <span>Showing: {displayedTasks.length} of {tasks.length}</span>
        <span>Completed: {completedCount}</span>
        <span>Pending: {pendingCount}</span>
        {overdueCount > 0 && (
          <span className="stat-overdue">⚠️ Overdue: {overdueCount}</span>
        )}
      </div>
    </div>
  );
}

export default App;
