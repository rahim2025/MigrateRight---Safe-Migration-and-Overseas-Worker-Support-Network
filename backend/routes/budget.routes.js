const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/budget
 * @desc    Create or update a budget
 * @access  Private (authenticated users)
 */
router.post('/', authenticate, budgetController.createBudget);

/**
 * @route   GET /api/budget
 * @desc    Get current user's budgets
 * @access  Private
 * @query   month, year (optional filters)
 */
router.get('/', authenticate, budgetController.getMyBudgets);

/**
 * @route   GET /api/budget/summary
 * @desc    Get budget summary with expenses for a specific month/year
 * @access  Private
 * @query   month, year (required)
 */
router.get('/summary', authenticate, budgetController.getBudgetSummary);

/**
 * @route   POST /api/budget/expense
 * @desc    Create an expense
 * @access  Private (authenticated users)
 */
router.post('/expense', authenticate, budgetController.createExpense);

/**
 * @route   DELETE /api/budget/expense/:id
 * @desc    Delete an expense
 * @access  Private (authenticated users, own expenses only)
 */
router.delete('/expense/:id', authenticate, budgetController.deleteExpense);

/**
 * @route   GET /api/budget/expenses
 * @desc    Get current user's expenses
 * @access  Private
 * @query   month, year, category (optional filters)
 */
router.get('/expenses', authenticate, budgetController.getMyExpenses);

/**
 * @route   GET /api/budget/expenses/:userId
 * @desc    Get expenses by userId (for admin or authorized users)
 * @access  Private
 * @query   month, year, category (optional filters)
 */
router.get('/expenses/:userId', authenticate, budgetController.getExpensesByUserId);

/**
 * @route   GET /api/budget/:userId
 * @desc    Get budgets by userId (for admin or authorized users)
 * @access  Private
 * @query   month, year (optional filters)
 */
router.get('/:userId', authenticate, budgetController.getBudgetByUserId);

module.exports = router;
