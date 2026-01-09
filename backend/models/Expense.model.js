const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['household', 'education', 'healthcare', 'savings', 'investments'],
      message: '{VALUE} is not a valid category'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries by user and date
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
