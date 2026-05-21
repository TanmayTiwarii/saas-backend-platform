// =============================================================================
// Assignment Validators
// =============================================================================
const { body, param } = require('express-validator');

const createAssignmentValidator = [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    body('title').trim().notEmpty().withMessage('Assignment title is required'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date (e.g. 2025-12-31T23:59:00Z)'),
    body('maxMarks').optional().isInt({ min: 1 }).withMessage('Max marks must be a positive integer'),
];

const updateAssignmentValidator = [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
    body('maxMarks').optional().isInt({ min: 1 }).withMessage('Max marks must be a positive integer'),
];

const submitAssignmentValidator = [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('content').optional().trim(),
    body('fileUrl').optional().isURL().withMessage('File URL must be a valid URL'),
];

const gradeSubmissionValidator = [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    param('studentId').isUUID().withMessage('Invalid student ID'),
    body('grade').isInt({ min: 0 }).withMessage('Grade must be a non-negative integer'),
    body('feedback').optional().trim(),
];

module.exports = {
    createAssignmentValidator,
    updateAssignmentValidator,
    submitAssignmentValidator,
    gradeSubmissionValidator,
};
