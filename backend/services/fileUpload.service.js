/**
 * File Upload Service
 * Handles file uploads for salary proof documents with validation and storage
 */

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

// Configuration
const UPLOAD_DIR = path.join(__dirname, '../uploads/salary-proofs');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

/**
 * Validate file before upload
 */
const validateFile = (file) => {
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestError(`File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new BadRequestError(`File extension not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  return true;
};

/**
 * Generate unique filename
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);

  // Clean the name
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 30);

  return `${cleanName}_${timestamp}_${random}${ext}`;
};

/**
 * Determine document type from filename or MIME type
 */
const getDocumentType = (mimeType, originalName) => {
  if (mimeType.startsWith('image/')) {
    return 'photo_evidence';
  }

  const nameLower = originalName.toLowerCase();
  if (nameLower.includes('payslip') || nameLower.includes('pay')) {
    return 'payslip';
  }
  if (nameLower.includes('bank') || nameLower.includes('statement')) {
    return 'bank_statement';
  }
  if (nameLower.includes('contract')) {
    return 'contract';
  }
  if (nameLower.includes('receipt')) {
    return 'receipt';
  }

  return 'other';
};

/**
 * Determine file type category
 */
const getFileTypeCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  return 'document';
};

/**
 * Save uploaded file to disk
 */
const saveFileToUploadDir = async (file) => {
  try {
    // Create upload directory if it doesn't exist
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Validate file
    validateFile(file);

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.originalname);
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);

    // Check if file already exists (shouldn't happen with unique names, but be safe)
    try {
      await fs.access(filePath);
      throw new BadRequestError('File already exists on server');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    logger.info(`File saved successfully: ${uniqueFileName}`);

    // Return file metadata
    return {
      fileName: uniqueFileName,
      originalFileName: file.originalname,
      filePath: `uploads/salary-proofs/${uniqueFileName}`,
      fileSize: file.size,
      fileType: getFileTypeCategory(file.mimetype),
      mimeType: file.mimetype,
      documentType: getDocumentType(file.mimetype, file.originalname),
      uploadDate: new Date(),
    };
  } catch (error) {
    logger.error('Error saving file:', error);
    throw error;
  }
};

/**
 * Delete file from disk
 */
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);

    // Security check - ensure file is in upload directory
    if (!fullPath.startsWith(UPLOAD_DIR)) {
      throw new BadRequestError('Invalid file path');
    }

    await fs.unlink(fullPath);
    logger.info(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    }
    logger.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file stats (for validation before deletion)
 */
const getFileStats = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);

    // Security check
    if (!fullPath.startsWith(UPLOAD_DIR)) {
      throw new BadRequestError('Invalid file path');
    }

    const stats = await fs.stat(fullPath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    logger.error('Error getting file stats:', error);
    throw error;
  }
};

/**
 * Cleanup old uploaded files (optional maintenance task)
 */
const cleanupOldFiles = async (olderThanDays = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const files = await fs.readdir(UPLOAD_DIR);

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
        logger.info(`Cleaned up old file: ${file}`);
      }
    }

    logger.info(`Cleanup complete: ${deletedCount} files deleted`);
    return deletedCount;
  } catch (error) {
    logger.error('Error during file cleanup:', error);
    throw error;
  }
};

module.exports = {
  saveFileToUploadDir,
  deleteFile,
  getFileStats,
  cleanupOldFiles,
  validateFile,
  generateUniqueFileName,
  getDocumentType,
  getFileTypeCategory,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
