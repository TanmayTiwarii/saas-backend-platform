// =============================================================================
// Assignment Routes
// All assignment routes require authentication.
//
// GET    /api/assignments/course/:courseId         – list assignments for a course
// POST   /api/assignments/course/:courseId         – create assignment (TEACHER, ADMIN)
// PATCH  /api/assignments/:id                      – update assignment (TEACHER owner, ADMIN)
// DELETE /api/assignments/:id                      – delete assignment (TEACHER owner, ADMIN)
// POST   /api/assignments/:id/submit               – submit assignment (STUDENT)
// GET    /api/assignments/:id/my-submission        – view own submission (STUDENT)
// GET    /api/assignments/:id/submissions          – view all submissions (TEACHER, ADMIN)
// PATCH  /api/assignments/:id/submissions/:studentId/grade  – grade submission (TEACHER, ADMIN)
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/assignment.controller');
const { authenticate } = require('../middleware/auth');
const { requireMinRole, authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
    createAssignmentValidator,
    updateAssignmentValidator,
    submitAssignmentValidator,
    gradeSubmissionValidator,
} = require('../validators/assignment.validator');

// All assignment routes require a valid JWT
router.use(authenticate);

// ─── Course-scoped assignment routes ─────────────────────────────────────────
router.get('/course/:courseId', controller.listAssignments);
router.post('/course/:courseId', requireMinRole('TEACHER'), createAssignmentValidator, validate, controller.createAssignment);

// ─── Single-assignment operations ────────────────────────────────────────────
router.patch('/:id', requireMinRole('TEACHER'), updateAssignmentValidator, validate, controller.updateAssignment);
router.delete('/:id', requireMinRole('TEACHER'), controller.deleteAssignment);

// ─── Student submission ───────────────────────────────────────────────────────
router.post('/:id/submit', authorize(['STUDENT']), submitAssignmentValidator, validate, controller.submit);
router.get('/:id/my-submission', authorize(['STUDENT']), controller.getMySubmission);

// ─── Teacher / Admin — submissions + grading ──────────────────────────────────
router.get('/:id/submissions', requireMinRole('TEACHER'), controller.listSubmissions);
router.patch('/:id/submissions/:studentId/grade', requireMinRole('TEACHER'), gradeSubmissionValidator, validate, controller.gradeSubmission);

module.exports = router;
