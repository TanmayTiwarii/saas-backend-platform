// =============================================================================
// Organization Routes
// POST   /api/organizations                        – create org
// GET    /api/organizations/me                     – get caller's org
// PATCH  /api/organizations/me                     – update caller's org (ADMIN+)
// DELETE /api/organizations/me                     – deactivate org (ADMIN+)
// GET    /api/organizations/:id/members            – list members (MEMBER+)
// POST   /api/organizations/:id/members            – invite member (ADMIN+)
// DELETE /api/organizations/:id/members/:userId    – remove member (ADMIN+)
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/org.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
    createOrgValidator,
    updateOrgValidator,
    inviteMemberValidator,
} = require('../validators/org.validator');

router.use(authenticate);

router.post('/', createOrgValidator, validate, controller.createOrganization);
router.get('/me', controller.getMyOrganization);
router.patch('/me', authorize(['ADMIN', 'SUPER_ADMIN']), updateOrgValidator, validate, controller.updateOrganization);
router.delete('/me', authorize(['ADMIN', 'SUPER_ADMIN']), controller.deleteOrganization);

// Member management
router.get('/:id/members', controller.listMembers);
router.post('/:id/members', authorize(['ADMIN', 'SUPER_ADMIN']), inviteMemberValidator, validate, controller.inviteMember);
router.delete('/:id/members/:userId', authorize(['ADMIN', 'SUPER_ADMIN']), controller.removeMember);

module.exports = router;
