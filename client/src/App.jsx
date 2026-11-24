import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardHome from './components/DashboardHome';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import './App.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/tasks`;

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

  // Navigation View State: 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'profile' | 'settings'
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskflow_theme') === 'dark';
  });

  // Task Data State
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Editing State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDueDate, setEditDueDate] = useState('');

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

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('taskflow_theme', next ? 'dark' : 'light');
      return next;
    });
  };

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

  // 5. Start editing a task
  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditPriority(task.priority || 'Medium');
    setEditDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
  };

  // 6. Cancel editing
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditPriority('Medium');
    setEditDueDate('');
  };

  // 7. Save edited task (PUT)
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          priority: editPriority,
          dueDate: editDueDate || null,
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t._id === id ? updatedTask : t)));
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // 8. Logout handler
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

  // 9. COMBINED SEARCH, FILTER, AND SORT LOGIC
  const getFilteredAndSortedTasks = () => {
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };

    // Step A: Apply Search & Filters
    const filtered = tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? task.completed
          : !task.completed;

      const matchesPriority =
        priorityFilter === 'all' ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Step B: Apply Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const weightA = priorityWeights[a.priority] || 2;
        const weightB = priorityWeights[b.priority] || 2;
        return weightB - weightA;
      }

      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      return 0;
    });
  };

  // Render Auth component if not logged in
  if (!token) {
    return (
      <div className="auth-page-wrapper">
        <Auth
          onAuthSuccess={(newToken, newUser) => {
            setToken(newToken);
            setUser(newUser);
          }}
        />
      </div>
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
    <div className="dashboard-app" data-theme={darkMode ? 'dark' : 'light'}>
      {/* 1. Left SaaS Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        taskStats={{ total: tasks.length, pending: pendingCount }}
      />

      {/* 2. Main Workspace Area */}
      <div className="dashboard-main-area">
        {/* SaaS Top Navigation Bar */}
        <Topbar
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onQuickNewTask={() => setCurrentView('tasks')}
          user={user}
        />

        {/* Dynamic Main Content Views */}
        <main className="dashboard-content-scroll">
          <div className="saas-page-container">
            {/* VIEW 1: DASHBOARD HOME */}
            {currentView === 'dashboard' && (
              <DashboardHome
                user={user}
                tasks={tasks}
                onNavigate={(view) => setCurrentView(view)}
                onQuickAddTask={() => setCurrentView('tasks')}
                onToggleComplete={handleToggleComplete}
                loading={loading}
              />
            )}

            {/* VIEW 2: MY TASKS */}
            {currentView === 'tasks' && (
              <TaskManager
                tasks={tasks}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newPriority={newPriority}
                setNewPriority={setNewPriority}
                newDueDate={newDueDate}
                setNewDueDate={setNewDueDate}
                handleAddTask={handleAddTask}
                handleToggleComplete={handleToggleComplete}
                handleDeleteTask={handleDeleteTask}
                handleStartEdit={handleStartEdit}
                handleCancelEdit={handleCancelEdit}
                handleSaveEdit={handleSaveEdit}
                editingTaskId={editingTaskId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editPriority={editPriority}
                setEditPriority={setEditPriority}
                editDueDate={editDueDate}
                setEditDueDate={setEditDueDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                handleResetFilters={handleResetFilters}
                displayedTasks={displayedTasks}
                loading={loading}
                completedCount={completedCount}
                pendingCount={pendingCount}
                overdueCount={overdueCount}
                isOverdue={isOverdue}
                formatDate={formatDate}
              />
            )}

            {/* VIEW 3: ANALYTICS DASHBOARD */}
            {currentView === 'analytics' && (
              <Analytics
                token={token}
                onBack={() => setCurrentView('dashboard')}
                onLogout={handleLogout}
              />
            )}

            {/* VIEW 4: CALENDAR VIEW */}
            {currentView === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onNavigateToTasks={() => setCurrentView('tasks')}
              />
            )}

            {/* VIEW 5: PROFILE VIEW */}
            {currentView === 'profile' && (
              <ProfileView
                user={user}
                tasks={tasks}
                onLogout={handleLogout}
              />
            )}

            {/* VIEW 6: SETTINGS VIEW */}
            {currentView === 'settings' && (
              <SettingsView
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
