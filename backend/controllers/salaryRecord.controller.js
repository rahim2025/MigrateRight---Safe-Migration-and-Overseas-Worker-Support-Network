const asyncHandler = require('express-async-handler');
const SalaryRecord = require('../models/SalaryRecord.model');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/**
 * @desc    Add a salary record
 * @route   POST /api/salary-records
 * @access  Private
 */
const addSalaryRecord = asyncHandler(async (req, res) => {
    const { month, year, promisedAmount, promisedCurrency, receivedAmount, receivedCurrency, receivedDate, status, notes } = req.body;

    // Check for existing record for same month/year
    const existingRecord = await SalaryRecord.findOne({
        user: req.user._id,
        month,
        year,
    });

    if (existingRecord) {
        throw new BadRequestError(`Salary record for ${month} ${year} already exists`);
    }

    const salaryRecord = await SalaryRecord.create({
        user: req.user._id,
        month,
        year,
        promisedAmount,
        promisedCurrency,
        receivedAmount,
        receivedCurrency,
        receivedDate,
        status,
        notes,
    });

    res.status(201).json({
        success: true,
        data: salaryRecord,
    });
});

/**
 * @desc    Get all salary records
 * @route   GET /api/salary-records
 * @access  Private
 */
const getSalaryRecords = asyncHandler(async (req, res) => {
    const records = await SalaryRecord.find({ user: req.user._id }).sort({ year: -1, receivedDate: -1 });

    res.status(200).json({
        success: true,
        count: records.length,
        data: records,
    });
});

/**
 * @desc    Update a salary record
 * @route   PUT /api/salary-records/:id
 * @access  Private
 */
const updateSalaryRecord = asyncHandler(async (req, res) => {
    let record = await SalaryRecord.findById(req.params.id);

    if (!record) {
        throw new NotFoundError('Salary record not found');
    }

    if (record.user.toString() !== req.user._id.toString()) {
        throw new BadRequestError('Not authorized to update this record');
    }

    record = await SalaryRecord.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: record,
    });
});

/**
 * @desc    Delete a salary record
 * @route   DELETE /api/salary-records/:id
 * @access  Private
 */
const deleteSalaryRecord = asyncHandler(async (req, res) => {
    const record = await SalaryRecord.findById(req.params.id);

    if (!record) {
        throw new NotFoundError('Salary record not found');
    }

    if (record.user.toString() !== req.user._id.toString()) {
        throw new BadRequestError('Not authorized to delete this record');
    }

    await record.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});

module.exports = {
    addSalaryRecord,
    getSalaryRecords,
    updateSalaryRecord,
    deleteSalaryRecord,
};
