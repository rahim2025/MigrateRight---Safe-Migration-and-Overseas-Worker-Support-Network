const mongoose = require('mongoose');

const WorkRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    documentType: {
        type: String,
        enum: ['contract', 'visa', 'passport', 'work_permit', 'insurance', 'certificate', 'other'],
        default: 'other',
    },
    fileUrl: {
        type: String, // In a real app, this would be an S3 URL or similar
        required: true,
    },
    fileName: {
        type: String, // Original filename
    },
    notes: {
        type: String,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('WorkRecord', WorkRecordSchema);
