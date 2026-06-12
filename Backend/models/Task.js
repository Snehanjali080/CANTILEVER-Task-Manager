const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    title: {
      type:      String, 
      required:  [true, 'Task title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    desc: {
      type:    String,
      trim:    true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type:    String,
      enum:    ['todo', 'inprogress', 'done'],
      default: 'todo',
      index:   true,
    },
    priority: {
      type:    String,
      enum:    ['high', 'med', 'low'],
      default: 'med',
      index:   true,
    },
    category: {
      type:    String,
      trim:    true,
      default: '',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    due: {
      type: Date,
    },
  },
  { timestamps: true }  
);

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
