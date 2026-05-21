// =============================================================================
// Course Controller
// =============================================================================
const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/response');

const listCourses = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;
        const result = await courseService.listCourses({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
        });
        return sendSuccess(res, 200, result);
    } catch (err) { next(err); }
};

const getCourse = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        return sendSuccess(res, 200, course);
    } catch (err) { next(err); }
};

const createCourse = async (req, res, next) => {
    try {
        const { title, description, code } = req.body;
        const course = await courseService.createCourse(req.user.userId, { title, description, code });
        return sendSuccess(res, 201, course, 'Course created');
    } catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const course = await courseService.updateCourse(
            req.params.id, req.user.userId, req.user.role, { title, description }
        );
        return sendSuccess(res, 200, course, 'Course updated');
    } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
    try {
        await courseService.deleteCourse(req.params.id, req.user.userId, req.user.role);
        return sendSuccess(res, 200, null, 'Course deactivated');
    } catch (err) { next(err); }
};

const enroll = async (req, res, next) => {
    try {
        const enrollment = await courseService.enrollStudent(req.user.userId, req.params.id);
        return sendSuccess(res, 201, enrollment, 'Enrolled successfully');
    } catch (err) { next(err); }
};

const unenroll = async (req, res, next) => {
    try {
        await courseService.unenrollStudent(req.user.userId, req.params.id);
        return sendSuccess(res, 200, null, 'Unenrolled successfully');
    } catch (err) { next(err); }
};

const listStudents = async (req, res, next) => {
    try {
        const students = await courseService.listStudents(req.params.id, req.user.userId, req.user.role);
        return sendSuccess(res, 200, students);
    } catch (err) { next(err); }
};

const getMyCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getMyCourses(req.user.userId);
        return sendSuccess(res, 200, courses);
    } catch (err) { next(err); }
};

const getMyTaughtCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getMyTaughtCourses(req.user.userId);
        return sendSuccess(res, 200, courses);
    } catch (err) { next(err); }
};

module.exports = {
    listCourses, getCourse, createCourse, updateCourse, deleteCourse,
    enroll, unenroll, listStudents, getMyCourses, getMyTaughtCourses,
};
