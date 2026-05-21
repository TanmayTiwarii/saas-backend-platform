// =============================================================================
// Assignment Controller
// =============================================================================
const assignmentService = require('../services/assignment.service');
const { sendSuccess } = require('../utils/response');

const listAssignments = async (req, res, next) => {
    try {
        const assignments = await assignmentService.listAssignments(
            req.params.courseId, req.user.userId, req.user.role
        );
        return sendSuccess(res, 200, assignments);
    } catch (err) { next(err); }
};

const createAssignment = async (req, res, next) => {
    try {
        const { title, description, dueDate, maxMarks } = req.body;
        const assignment = await assignmentService.createAssignment(
            req.params.courseId, req.user.userId, req.user.role,
            { title, description, dueDate: dueDate ? new Date(dueDate) : null, maxMarks }
        );
        return sendSuccess(res, 201, assignment, 'Assignment created');
    } catch (err) { next(err); }
};

const updateAssignment = async (req, res, next) => {
    try {
        const { title, description, dueDate, maxMarks } = req.body;
        const assignment = await assignmentService.updateAssignment(
            req.params.id, req.user.userId, req.user.role,
            { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, maxMarks }
        );
        return sendSuccess(res, 200, assignment, 'Assignment updated');
    } catch (err) { next(err); }
};

const deleteAssignment = async (req, res, next) => {
    try {
        await assignmentService.deleteAssignment(req.params.id, req.user.userId, req.user.role);
        return sendSuccess(res, 200, null, 'Assignment deleted');
    } catch (err) { next(err); }
};

const submit = async (req, res, next) => {
    try {
        const { content, fileUrl } = req.body;
        const submission = await assignmentService.submitAssignment(
            req.params.id, req.user.userId, { content, fileUrl }
        );
        return sendSuccess(res, 201, submission, 'Submission saved');
    } catch (err) { next(err); }
};

const listSubmissions = async (req, res, next) => {
    try {
        const submissions = await assignmentService.listSubmissions(
            req.params.id, req.user.userId, req.user.role
        );
        return sendSuccess(res, 200, submissions);
    } catch (err) { next(err); }
};

const gradeSubmission = async (req, res, next) => {
    try {
        const { grade, feedback } = req.body;
        const result = await assignmentService.gradeSubmission(
            req.params.id, req.params.studentId,
            req.user.userId, req.user.role,
            { grade, feedback }
        );
        return sendSuccess(res, 200, result, 'Submission graded');
    } catch (err) { next(err); }
};

const getMySubmission = async (req, res, next) => {
    try {
        const submission = await assignmentService.getMySubmission(req.params.id, req.user.userId);
        return sendSuccess(res, 200, submission);
    } catch (err) { next(err); }
};

module.exports = {
    listAssignments, createAssignment, updateAssignment, deleteAssignment,
    submit, listSubmissions, gradeSubmission, getMySubmission,
};
