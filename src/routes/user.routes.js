// =============================================================================
// User Routes
// GET    /api/users/me          – get own profile (with courses)
// PATCH  /api/users/me          – update own profile
// DELETE /api/users/me          – deactivate own account
// GET    /api/users             – list all users (ADMIN only, ?role=STUDENT|TEACHER|ADMIN)
// GET    /api/users/:id         – get user by ID (ADMIN only)
// PATCH  /api/users/:id/role    – update user role (ADMIN only)
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { updateProfileValidator, updateRoleValidator } = require('../validators/user.validator');

// All user routes require authentication
router.use(authenticate);

// Self-service routes — any authenticated user
router.get('/me', controller.getMe);
router.patch('/me', updateProfileValidator, validate, controller.updateMe);
router.delete('/me', controller.deleteMe);

// Admin-only routes
router.get('/', authorize(['ADMIN']), controller.listUsers);
router.get('/:id', authorize(['ADMIN']), controller.getUserById);
router.patch('/:id/role', authorize(['ADMIN']), updateRoleValidator, validate, controller.updateUserRole);

module.exports = router;
