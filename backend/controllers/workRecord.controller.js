const asyncHandler = require('express-async-handler');
const WorkRecord = require('../models/WorkRecord.model');
const fileUploadService = require('../services/fileUpload.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/**
 * @desc    Upload a new work record/document
 * @route   POST /api/work-records
 * @access  Private
 */
const uploadWorkRecord = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new BadRequestError('Please upload a file');
    }

    const { title, documentType, notes } = req.body;

    // Save file to disk
    const fileData = await fileUploadService.saveFileToUploadDir(req.file);

    // Create database record
    const workRecord = await WorkRecord.create({
        user: req.user._id,
        title: title || fileData.originalFileName,
        documentType: documentType || fileData.documentType,
        fileUrl: `/${fileData.filePath}`, // Relative URL for frontend
        fileName: fileData.fileName,
        notes,
    });

    res.status(201).json({
        success: true,
        data: workRecord,
    });
});

/**
 * @desc    Get all work records for current user
 * @route   GET /api/work-records
 * @access  Private
 */
const getWorkRecords = asyncHandler(async (req, res) => {
    const records = await WorkRecord.find({ user: req.user._id }).sort({ uploadDate: -1 });

    res.status(200).json({
        success: true,
        count: records.length,
        data: records,
    });
});

/**
 * @desc    Delete a work record
 * @route   DELETE /api/work-records/:id
 * @access  Private
 */
const deleteWorkRecord = asyncHandler(async (req, res) => {
    const record = await WorkRecord.findById(req.params.id);

    if (!record) {
        throw new NotFoundError('Record not found');
    }

    // Ensure user owns the record
    if (record.user.toString() !== req.user._id.toString()) {
        throw new BadRequestError('Not authorized to delete this record');
    }

    // Delete file from disk
    // Construct the relative path from the stored fileUrl which includes /uploads/...
    const relativePath = record.fileUrl.startsWith('/') ? record.fileUrl.substring(1) : record.fileUrl;
    await fileUploadService.deleteFile(relativePath);

    // Delete from DB
    await record.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});

module.exports = {
    uploadWorkRecord,
    getWorkRecords,
    deleteWorkRecord,
};
