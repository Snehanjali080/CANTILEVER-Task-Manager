const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const {
  getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);


const taskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'done']).withMessage('Status must be todo, inprogress, or done'),
  body('priority')
    .optional()
    .isIn(['high', 'med', 'low']).withMessage('Priority must be high, med, or low'),
  body('due')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Due must be a valid date'),
];


router.get( '/stats', getTaskStats);
router.get( '/',      getTasks);
router.get( '/:id',   getTaskById);
router.post('/',      taskRules, createTask);
router.put( '/:id',   updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
