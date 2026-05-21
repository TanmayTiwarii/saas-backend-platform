// =============================================================================
// Course Validators
// =============================================================================
const { body, param } = require('express-validator');

const createCourseValidator = [
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Course code is required')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Course code must be uppercase alphanumeric (e.g. CS101, MATH201)'),
    body('description').optional().trim(),
];

const updateCourseValidator = [
    param('id').isUUID().withMessage('Invalid course ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
];

module.exports = { createCourseValidator, updateCourseValidator };
