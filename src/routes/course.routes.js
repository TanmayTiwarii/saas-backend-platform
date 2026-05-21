// =============================================================================
// Course Routes
// GET    /api/courses                  – list all courses (public)
// GET    /api/courses/my/enrolled      – student's enrolled courses (STUDENT)
// GET    /api/courses/my/teaching      – teacher's courses (TEACHER)
// POST   /api/courses                  – create course (TEACHER, ADMIN)
// GET    /api/courses/:id              – get course details (public)
// PATCH  /api/courses/:id              – update course (TEACHER owner, ADMIN)
// DELETE /api/courses/:id              – deactivate course (TEACHER owner, ADMIN)
// POST   /api/courses/:id/enroll       – enroll self (STUDENT, ADMIN)
// DELETE /api/courses/:id/enroll       – unenroll self (STUDENT, ADMIN)
// GET    /api/courses/:id/students     – list enrolled students (TEACHER owner, ADMIN)
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth');
const { requireMinRole, authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createCourseValidator, updateCourseValidator } = require('../validators/course.validator');

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', controller.listCourses);

// ─── Authenticated routes — specific paths BEFORE /:id ────────────────────────
// Student: view enrolled courses
router.get('/my/enrolled', authenticate, authorize(['STUDENT', 'ADMIN']), controller.getMyCourses);

// Teacher: view courses they teach
router.get('/my/teaching', authenticate, authorize(['TEACHER', 'ADMIN']), controller.getMyTaughtCourses);

// Create a course
router.post('/', authenticate, requireMinRole('TEACHER'), createCourseValidator, validate, controller.createCourse);

// ─── Routes with :id param ────────────────────────────────────────────────────
router.get('/:id', controller.getCourse);

router.patch('/:id', authenticate, requireMinRole('TEACHER'), updateCourseValidator, validate, controller.updateCourse);
router.delete('/:id', authenticate, requireMinRole('TEACHER'), controller.deleteCourse);

// Enrollment
router.post('/:id/enroll',   authenticate, authorize(['STUDENT', 'ADMIN']), controller.enroll);
router.delete('/:id/enroll', authenticate, authorize(['STUDENT', 'ADMIN']), controller.unenroll);

// Students list — teacher/admin only
router.get('/:id/students',  authenticate, requireMinRole('TEACHER'), controller.listStudents);

module.exports = router;
