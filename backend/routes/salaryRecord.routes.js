const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    addSalaryRecord,
    getSalaryRecords,
    updateSalaryRecord,
    deleteSalaryRecord,
} = require('../controllers/salaryRecord.controller');

router.use(authenticate);

router.route('/')
    .get(getSalaryRecords)
    .post(addSalaryRecord);

router.route('/:id')
    .put(updateSalaryRecord)
    .delete(deleteSalaryRecord);

module.exports = router;
