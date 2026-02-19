// =============================================================================
// Organization Controller
// =============================================================================
const orgService = require('../services/org.service');
const { sendSuccess } = require('../utils/response');

const createOrganization = async (req, res, next) => {
    try {
        const org = await orgService.createOrganization(req.user.userId, req.body);
        return sendSuccess(res, 201, org, 'Organization created successfully');
    } catch (err) {
        next(err);
    }
};

const getMyOrganization = async (req, res, next) => {
    try {
        const org = await orgService.getMyOrganization(req.user.userId);
        return sendSuccess(res, 200, org);
    } catch (err) {
        next(err);
    }
};

const updateOrganization = async (req, res, next) => {
    try {
        const { name, description, website, logoUrl } = req.body;
        const org = await orgService.updateOrganization(req.user.organizationId, {
            name, description, website, logoUrl,
        });
        return sendSuccess(res, 200, org, 'Organization updated');
    } catch (err) {
        next(err);
    }
};

const deleteOrganization = async (req, res, next) => {
    try {
        await orgService.deleteOrganization(req.user.organizationId);
        return sendSuccess(res, 200, null, 'Organization deactivated');
    } catch (err) {
        next(err);
    }
};

const listMembers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;
        const result = await orgService.listMembers(id, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        return sendSuccess(res, 200, result);
    } catch (err) {
        next(err);
    }
};

const inviteMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const membership = await orgService.inviteMember(id, req.body);
        return sendSuccess(res, 201, membership, 'Member added successfully');
    } catch (err) {
        next(err);
    }
};

const removeMember = async (req, res, next) => {
    try {
        const { id, userId } = req.params;
        await orgService.removeMember(id, userId);
        return sendSuccess(res, 200, null, 'Member removed');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrganization,
    getMyOrganization,
    updateOrganization,
    deleteOrganization,
    listMembers,
    inviteMember,
    removeMember,
};
