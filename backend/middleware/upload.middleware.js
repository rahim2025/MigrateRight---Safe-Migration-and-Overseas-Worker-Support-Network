const multer = require('multer');
const { BadRequestError } = require('../utils/errors');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } = require('../services/fileUpload.service');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequestError(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: fileFilter,
});

module.exports = upload;
