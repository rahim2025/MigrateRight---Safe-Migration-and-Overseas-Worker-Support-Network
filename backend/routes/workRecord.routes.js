const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
    uploadWorkRecord,
    getWorkRecords,
    deleteWorkRecord,
} = require('../controllers/workRecord.controller');

router.use(authenticate); // All routes are protected

router.route('/')
    .get(getWorkRecords)
    .post(upload.single('file'), uploadWorkRecord);

router.route('/:id')
    .delete(deleteWorkRecord);

module.exports = router;
