import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@services/api';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    totalRemittance: '',
    household: '',
    education: '',
    healthcare: '',
    savings: '',
    investments: ''
  });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    category: 'household',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['household', 'education', 'healthcare', 'savings', 'investments'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    const month = monthNames[new Date().getMonth()];
    setCurrentMonth(month);
  }, []);

  useEffect(() => {
    if (currentMonth && currentYear) {
      fetchBudgetData();
      fetchExpenses();
    }
  }, [currentMonth, currentYear]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/budget?month=${currentMonth}&year=${currentYear}`);
      
      if (response.data && response.data.length > 0) {
        const budgetData = response.data[0];
        setBudget(budgetData);
        setBudgetForm({
          totalRemittance: budgetData.totalRemittance,
          household: budgetData.categories.household || 0,
          education: budgetData.categories.education || 0,
          healthcare: budgetData.categories.healthcare || 0,
          savings: budgetData.categories.savings || 0,
          investments: budgetData.categories.investments || 0
        });
      } else {
        setBudget(null);
      }
    } catch (err) {
      setError('Failed to fetch budget data');
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/budget/expenses?month=${currentMonth}&year=${currentYear}`);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const handleBudgetFormChange = (e) => {
    setBudgetForm({
      ...budgetForm,
      [e.target.name]: e.target.value
    });
  };

  const handleExpenseFormChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const totalAllocated = categories.reduce((sum, cat) => 
      sum + (parseFloat(budgetForm[cat]) || 0), 0
    );

    if (totalAllocated > parseFloat(budgetForm.totalRemittance)) {
      setError('Total allocated budget cannot exceed total remittance');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/budget', {
        month: currentMonth,
        year: currentYear,
        totalRemittance: parseFloat(budgetForm.totalRemittance),
        categories: {
          household: parseFloat(budgetForm.household) || 0,
          education: parseFloat(budgetForm.education) || 0,
          healthcare: parseFloat(budgetForm.healthcare) || 0,
          savings: parseFloat(budgetForm.savings) || 0,
          investments: parseFloat(budgetForm.investments) || 0
        }
      });

      setBudget(response.data);
      setSuccessMessage('Budget saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      setLoading(true);
      await api.post('/budget/expense', {
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date
      });

      setSuccessMessage('Expense added successfully!');
      setExpenseForm({
        category: 'household',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.delete(`/budget/expense/${expenseId}`);
      setSuccessMessage('Expense deleted successfully!');
      fetchExpenses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const calculateSpentByCategory = () => {
    const spent = {
      household: 0,
      education: 0,
      healthcare: 0,
      savings: 0,
      investments: 0
    };

    expenses.forEach(expense => {
      spent[expense.category] += expense.amount;
    });

    return spent;
  };

  const calculateTotals = () => {
    const spentByCategory = calculateSpentByCategory();
    const totalSpent = Object.values(spentByCategory).reduce((sum, val) => sum + val, 0);
    const totalBudget = budget ? budget.totalRemittance : 0;
    const totalRemaining = totalBudget - totalSpent;

    return { totalBudget, totalSpent, totalRemaining, spentByCategory };
  };

  const getProgressPercentage = (spent, allocated) => {
    if (allocated === 0) return 0;
    return Math.min((spent / allocated) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  const totals = calculateTotals();

  return (
    <div className="budget-planner">
      <div className="budget-header">
        <h1>{t('budget.title')}</h1>
        <div className="period-selector">
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-select"
          >
            {monthNames.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="year-input"
            min="2020"
            max="2030"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      
      {!budget && !loading && (
        <div className="alert" style={{backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd'}}>
          💡 <strong>Getting Started:</strong> Set your monthly budget below to start tracking expenses and see your spending overview.
        </div>
      )}

      <div className="budget-content">
        {/* Budget Setup Form */}
        <div className="card">
          <h2>{budget ? t('budget.updateBudget') : t('budget.createBudget')}</h2>
          <form onSubmit={handleBudgetSubmit} className="budget-form">
            <div className="form-group">
              <label>{t('budget.totalRemittance')} ({t('budget.currency')})</label>
              <input
                type="number"
                name="totalRemittance"
                value={budgetForm.totalRemittance}
                onChange={handleBudgetFormChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter total amount"
              />
            </div>

            <h3>{t('budget.categoryBreakdown')}</h3>
            {categories.map(category => (
              <div key={category} className="form-group">
                <label>{t(`budget.categories.${category}`)} ({t('budget.currency')})</label>
                <input
                  type="number"
                  name={category}
                  value={budgetForm[category]}
                  onChange={handleBudgetFormChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : (budget ? t('budget.updateBudget') : t('budget.createBudget'))}
            </button>
          </form>
        </div>

        {/* Budget Overview - Always show, with message if no budget */}
        <div className="card">
          <h2>{t('budget.budgetOverview')}</h2>
          {!budget ? (
            <div className="no-data" style={{padding: '40px 20px', textAlign: 'center'}}>
              <p style={{fontSize: '48px', margin: '0 0 10px 0'}}>📊</p>
              <p style={{color: '#6b7280', marginBottom: '10px'}}>{t('budget.noBudgetMessage')}</p>
            </div>
          ) : (
            <>
              <div className="budget-summary">
                <div className="summary-item">
                  <span className="label">{t('budget.totalBudget')}:</span>
                  <span className="value">{t('budget.currency')}{totals.totalBudget.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">{t('budget.totalSpent')}:</span>
                  <span className="value spent">{t('budget.currency')}{totals.totalSpent.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">{t('budget.remaining')}:</span>
                  <span className={`value ${totals.totalRemaining < 0 ? 'negative' : 'positive'}`}>
                    {t('budget.currency')}{totals.totalRemaining.toFixed(2)}
                  </span>
                </div>
              </div>

              <h3>{t('budget.categoryBreakdown')}</h3>
              <div className="category-progress">
                {categories.map(category => {
                  const allocated = budget.categories[category] || 0;
                  const spent = totals.spentByCategory[category] || 0;
                  const remaining = allocated - spent;
                  const percentage = getProgressPercentage(spent, allocated);
                  
                  return (
                    <div key={category} className="progress-item">
                      <div className="progress-header">
                        <span className="category-name">
                          {t(`budget.categories.${category}`)}
                        </span>
                        <span className="category-amounts">
                        {t('budget.currency')}{spent.toFixed(2)} / {t('budget.currency')}{allocated.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getProgressColor(percentage)
                          }}
                        ></div>
                      </div>
                      <div className="progress-footer">
                        <span className={remaining < 0 ? 'over-budget' : ''}>
                          {t('budget.remaining')}: {t('budget.currency')}{remaining.toFixed(2)}
                        </span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Add Expense Form */}
        <div className="card">
          <h2>{t('budget.addExpense')}</h2>
          <form onSubmit={handleExpenseSubmit} className="expense-form">
            <div className="form-group">
              <label>{t('budget.category')}</label>
              <select
                name="category"
                value={expenseForm.category}
                onChange={handleExpenseFormChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {t(`budget.categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('budget.amount')} ({t('budget.currency')})</label>
              <input
                type="number"
                name="amount"
                value={expenseForm.amount}
                onChange={handleExpenseFormChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>{t('budget.description')}</label>
              <input
                type="text"
                name="description"
                value={expenseForm.description}
                onChange={handleExpenseFormChange}
                required
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label>{t('budget.date')}</label>
              <input
                type="date"
                name="date"
                value={expenseForm.date}
                onChange={handleExpenseFormChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('budget.addExpense')}
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="card">
          <h2>{t('budget.expenseTracking')}</h2>
          {expenses.length === 0 ? (
            <p className="no-data">{t('budget.noExpenses')}</p>
          ) : (
            <div className="expenses-list">
              {expenses.map(expense => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-category">
                      <span className={`category-badge ${expense.category}`}>
                        {t(`budget.categories.${expense.category}`)}
                      </span>
                    </div>
                    <div className="expense-details">
                      <div className="expense-description">{expense.description}</div>
                      <div className="expense-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="expense-amount">{t('budget.currency')}{expense.amount.toFixed(2)}</div>
                  </div>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteExpense(expense._id)}
                    title="Delete expense"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
