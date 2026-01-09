const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  totalRemittance: {
    type: Number,
    required: [true, 'Total remittance is required'],
    min: [0, 'Total remittance cannot be negative']
  },
  categories: {
    household: {
      type: Number,
      default: 0,
      min: [0, 'Household budget cannot be negative']
    },
    education: {
      type: Number,
      default: 0,
      min: [0, 'Education budget cannot be negative']
    },
    healthcare: {
      type: Number,
      default: 0,
      min: [0, 'Healthcare budget cannot be negative']
    },
    savings: {
      type: Number,
      default: 0,
      min: [0, 'Savings budget cannot be negative']
    },
    investments: {
      type: Number,
      default: 0,
      min: [0, 'Investments budget cannot be negative']
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate budgets for same user/month/year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
budgetSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Virtual to calculate total allocated budget
budgetSchema.virtual('totalAllocated').get(function() {
  return (
    this.categories.household +
    this.categories.education +
    this.categories.healthcare +
    this.categories.savings +
    this.categories.investments
  );
});

// Ensure virtuals are included in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
