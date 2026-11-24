// Use public DNS to ensure SRV record resolution across all network providers
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported
}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./models/Task');
const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'student_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:');
    console.error(err.message);
    console.log('\n👉 Tip: Ensure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access.');
  });

// ============================================================
// 1. AUTHENTICATION APIS
// ============================================================

// Helper to escape regex special characters for safe search queries
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Register a new student
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide valid name, email, and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login an existing student
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide valid email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 2. PROTECTED TASK APIS (With Priority, Due Date & Sorting)
// ============================================================

// 1. GET ALL TASKS FOR THE LOGGED-IN USER (With optional sorting)
// Route: GET http://localhost:5000/tasks?search=...&status=...&priority=...&sortBy=...
app.get('/tasks', auth, async (req, res) => {
  try {
    const { search, status, priority, sortBy } = req.query;

    // Base query: Always restrict to the logged-in user's tasks
    const filter = { user: req.user.id };

    // 1. Search by title (case-insensitive substring match with safe regex escaping)
    if (search && typeof search === 'string' && search.trim()) {
      filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // 2. Filter by status (Pending vs Completed)
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'pending') {
      filter.completed = false;
    }

    // 3. Filter by priority (High, Medium, Low)
    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      filter.priority = priority;
    }

    // Start building query
    let query = Task.find(filter);

    // 4. Sort by due date or creation date
    if (sortBy === 'dueDate') {
      // Earliest due date first, tasks without due date at the bottom
      query = query.sort({ dueDate: 1, createdAt: -1 });
    } else {
      // Default: Most recently created first
      query = query.sort({ createdAt: -1 });
    }

    const tasks = await query;
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// ANALYTICS DASHBOARD API (MongoDB Aggregation)
// Route: GET http://localhost:5000/tasks/analytics?range=7|30
// ============================================================
app.get('/tasks/analytics', auth, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const rangeDays = parseInt(req.query.range, 10) === 30 ? 30 : 7;

    // Calculate beginning of today for accurate overdue comparison
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Summary Metrics Aggregation Pipeline
    const summaryStats = await Task.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$completed', false] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', startOfToday] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const summary = summaryStats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0
    };

    const completionPercentage =
      summary.totalTasks > 0
        ? Math.round((summary.completedTasks / summary.totalTasks) * 100)
        : 0;

    // 2. Priority Distribution Aggregation Pipeline
    const priorityAgg = await Task.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          }
        }
      }
    ]);

    const priorityMap = {
      High: { total: 0, completed: 0 },
      Medium: { total: 0, completed: 0 },
      Low: { total: 0, completed: 0 }
    };

    priorityAgg.forEach((item) => {
      if (priorityMap[item._id]) {
        priorityMap[item._id] = { total: item.total, completed: item.completed };
      }
    });

    const priorityDistribution = [
      {
        priority: 'High',
        total: priorityMap.High.total,
        completed: priorityMap.High.completed,
        pending: priorityMap.High.total - priorityMap.High.completed,
        color: '#ef4444'
      },
      {
        priority: 'Medium',
        total: priorityMap.Medium.total,
        completed: priorityMap.Medium.completed,
        pending: priorityMap.Medium.total - priorityMap.Medium.completed,
        color: '#f59e0b'
      },
      {
        priority: 'Low',
        total: priorityMap.Low.total,
        completed: priorityMap.Low.completed,
        pending: priorityMap.Low.total - priorityMap.Low.completed,
        color: '#3b82f6'
      }
    ];

    // 3. Status Distribution (for Doughnut Chart)
    const statusDistribution = [
      { name: 'Completed', value: summary.completedTasks, color: '#10b981' },
      { name: 'Pending', value: summary.pendingTasks, color: '#f59e0b' }
    ];

    // 4. Productivity Timeline Aggregation (Dynamic: 7 or 30 Days)
    const rangeStartDate = new Date();
    rangeStartDate.setDate(rangeStartDate.getDate() - (rangeDays - 1));
    rangeStartDate.setHours(0, 0, 0, 0);

    const timelineStats = await Task.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: rangeStartDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build timeline dates (filling gap days with 0)
    const daysMap = {};
    const timelineDates = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel =
        rangeDays === 7
          ? d.toLocaleDateString(undefined, { weekday: 'short' })
          : d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
      daysMap[dateStr] = { date: dateStr, day: dayLabel, created: 0, completed: 0 };
      timelineDates.push(dateStr);
    }

    timelineStats.forEach((entry) => {
      if (daysMap[entry._id]) {
        daysMap[entry._id].created = entry.created;
        daysMap[entry._id].completed = entry.completed;
      }
    });

    const productivity = timelineDates.map((dateStr) => daysMap[dateStr]);

    // Return combined analytics only for the logged-in user
    res.json({
      range: rangeDays,
      totalTasks: summary.totalTasks,
      completedTasks: summary.completedTasks,
      pendingTasks: summary.pendingTasks,
      overdueTasks: summary.overdueTasks,
      completionPercentage,
      priorityDistribution,
      statusDistribution,
      productivity,
      weeklyProductivity: productivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ADD A NEW TASK (With Priority & Due Date)
// Route: POST http://localhost:5000/tasks
app.post('/tasks', auth, async (req, res) => {
  try {
    const { title, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Validate priority (defaults to Medium if omitted or invalid)
    const validPriorities = ['High', 'Medium', 'Low'];
    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const newTask = await Task.create({
      title: title.trim(),
      priority: taskPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
      user: req.user.id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. UPDATE TASK (Toggle complete, or update priority/dueDate)
// Route: PUT http://localhost:5000/tasks/:id
app.put('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Update optional fields if sent
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({ error: 'Task title cannot be empty' });
      }
      task.title = req.body.title.trim();
    }

    if (req.body.priority !== undefined) {
      const validPriorities = ['High', 'Medium', 'Low'];
      if (validPriorities.includes(req.body.priority)) {
        task.priority = req.body.priority;
      }
    }

    if (req.body.dueDate !== undefined) {
      task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    } else if (
      req.body.title === undefined &&
      req.body.priority === undefined &&
      req.body.dueDate === undefined
    ) {
      // Default: Toggle completed if no other fields specified
      task.completed = !task.completed;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE A TASK (User-specific)
// Route: DELETE http://localhost:5000/tasks/:id
app.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('Student Task Manager Server is running with Priority & Deadlines!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
