const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// ─────────────────────────────────────────────────────────────
// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
// ─────────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, sortBy, order } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = new RegExp(category, 'i');
    if (search)   filter.$or = [
      { title: new RegExp(search, 'i') },
      { desc:  new RegExp(search, 'i') },
    ];

    // Build sort object
    const sortField = ['createdAt', 'due', 'title', 'priority'].includes(sortBy)
      ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const tasks = await Task.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      count:   tasks.length,
      data:    tasks,
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching tasks' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching task' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// ─────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, desc, status, priority, category, due } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      desc,
      status,
      priority,
      category,
      due: due ? new Date(due) : undefined,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ success: false, message: 'Server error while creating task' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const allowedFields = ['title', 'desc', 'status', 'priority', 'category', 'due'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = field === 'due' && req.body[field]
          ? new Date(req.body[field])
          : req.body[field];
      }
    });

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating task' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting task' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get task stats for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
// ─────────────────────────────────────────────────────────────
const getTaskStats = async (req, res) => {
  try {
    const [statusStats, priorityStats, total] = await Promise.all([
      Task.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({ user: req.user._id }),
    ]);

    // Overdue count
    const overdue = await Task.countDocuments({
      user:   req.user._id,
      status: { $ne: 'done' },
      due:    { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        overdue,
        byStatus:   Object.fromEntries(statusStats.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(priorityStats.map((p) => [p._id, p.count])),
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching stats' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskStats };
