/**
 * Budget Controller
 * Handles budget and expense tracking operations
 */

const Budget = require('../models/Budget.model');
const Expense = require('../models/Expense.model');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Create or update a budget
 * @route POST /api/budget
 */
exports.createBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year, totalRemittance, categories, currency } = req.body;

    // Validate required fields
    if (!month || !year || totalRemittance === undefined) {
      throw new BadRequestError('Month, year, and total remittance are required');
    }

    // Validate that total allocated doesn't exceed total remittance
    const totalAllocated = Object.values(categories || {}).reduce((sum, val) => sum + (val || 0), 0);
    if (totalAllocated > totalRemittance) {
      throw new BadRequestError('Total allocated budget cannot exceed total remittance');
    }

    // Check if budget already exists for this user/month/year
    let budget = await Budget.findOne({ userId, month, year });

    if (budget) {
      // Update existing budget
      budget.totalRemittance = totalRemittance;
      budget.categories = categories || {};
      budget.currency = currency || budget.currency;
      await budget.save();

      logger.info(`Budget updated for user ${userId}, ${month} ${year}`);
      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget
      });
    } else {
      // Create new budget
      budget = await Budget.create({
        userId,
        month,
        year,
        totalRemittance,
        categories: categories || {},
        currency: currency || 'USD'
      });

      logger.info(`Budget created for user ${userId}, ${month} ${year}`);
      return res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });
    }
  } catch (error) {
    logger.error('Error creating/updating budget:', error);
    next(error);
  }
};

/**
 * Get budget by userId
 * @route GET /api/budget/:userId
 */
exports.getBudgetByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    // Build query
    const query = { userId };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).sort({ year: -1, createdAt: -1 });

    logger.info(`Retrieved ${budgets.length} budget(s) for user ${userId}`);
    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    logger.error('Error fetching budget:', error);
    next(error);
  }
};

/**
 * Get current user's budgets
 * @route GET /api/budget
 */
exports.getMyBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    // Build query
    const query = { userId };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).sort({ year: -1, createdAt: -1 });

    logger.info(`Retrieved ${budgets.length} budget(s) for user ${userId}`);
    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    logger.error('Error fetching budgets:', error);
    next(error);
  }
};

/**
 * Create an expense
 * @route POST /api/expense
 */
exports.createExpense = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, amount, description, date, currency } = req.body;

    // Validate required fields
    if (!category || amount === undefined || !description) {
      throw new BadRequestError('Category, amount, and description are required');
    }

    // Extract month and year from date
    const expenseDate = date ? new Date(date) : new Date();
    const month = expenseDate.toLocaleString('default', { month: 'long' });
    const year = expenseDate.getFullYear();

    // Create expense
    const expense = await Expense.create({
      userId,
      category,
      amount: parseFloat(amount),
      description,
      date: expenseDate,
      month,
      year,
      currency: currency || 'USD'
    });

    logger.info(`Expense created for user ${userId}, category: ${category}`);
    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    logger.error('Error creating expense:', error);
    next(error);
  }
};

/**
 * Get expenses by userId
 * @route GET /api/expenses/:userId
 */
exports.getExpensesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { month, year, category } = req.query;

    // Build query
    const query = { userId };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (category) query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 });

    logger.info(`Retrieved ${expenses.length} expense(s) for user ${userId}`);
    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    next(error);
  }
};

/**
 * Get current user's expenses
 * @route GET /api/expenses
 */
exports.getMyExpenses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year, category } = req.query;

    // Build query
    const query = { userId };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (category) query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 });

    logger.info(`Retrieved ${expenses.length} expense(s) for user ${userId}`);
    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    next(error);
  }
};

/**
 * Get budget summary with expenses
 * @route GET /api/budget/summary
 */
exports.getBudgetSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    if (!month || !year) {
      throw new BadRequestError('Month and year are required');
    }

    // Get budget
    const budget = await Budget.findOne({ userId, month, year });
    if (!budget) {
      throw new NotFoundError('Budget not found for the specified month and year');
    }

    // Get expenses for the same period
    const expenses = await Expense.find({ userId, month, year });

    // Calculate spent per category
    const spentByCategory = {
      household: 0,
      education: 0,
      healthcare: 0,
      savings: 0,
      investments: 0
    };

    expenses.forEach(expense => {
      spentByCategory[expense.category] += expense.amount;
    });

    // Calculate totals
    const totalBudget = budget.totalRemittance;
    const totalAllocated = budget.totalAllocated;
    const totalSpent = Object.values(spentByCategory).reduce((sum, val) => sum + val, 0);
    const totalRemaining = totalBudget - totalSpent;

    // Calculate per-category remaining
    const remainingByCategory = {};
    Object.keys(budget.categories).forEach(cat => {
      remainingByCategory[cat] = budget.categories[cat] - spentByCategory[cat];
    });

    logger.info(`Retrieved budget summary for user ${userId}, ${month} ${year}`);
    return res.status(200).json({
      success: true,
      data: {
        budget: budget,
        expenses: expenses,
        summary: {
          totalBudget,
          totalAllocated,
          totalSpent,
          totalRemaining,
          spentByCategory,
          remainingByCategory
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching budget summary:', error);
    next(error);
  }
};

/**
 * Delete an expense
 * @route DELETE /api/expense/:id
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    await expense.deleteOne();

    logger.info(`Expense deleted: ${id} by user ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    next(error);
  }
};

module.exports = exports;
