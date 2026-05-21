// =============================================================================
// Assignment Service
// =============================================================================
const prisma = require('../config/db');

// ─── Private helpers ──────────────────────────────────────────────────────────

const _assertCourseTeacherOrAdmin = async (courseId, userId, role) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (role !== 'ADMIN' && course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can perform this action');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }
    return course;
};

const _assertEnrolledOrTeacherOrAdmin = async (courseId, userId, role) => {
    if (role === 'ADMIN') return;
    if (role === 'TEACHER') {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course && course.teacherId === userId) return;
    }
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
    });
    if (!enrollment) {
        const err = new Error('You must be enrolled in this course to view its assignments');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }
};

// ---------------------------------------------------------------------------
// List assignments for a course
// ---------------------------------------------------------------------------
const listAssignments = async (courseId, userId, role) => {
    await _assertEnrolledOrTeacherOrAdmin(courseId, userId, role);
    return prisma.assignment.findMany({
        where: { courseId },
        orderBy: { createdAt: 'asc' },
    });
};

// ---------------------------------------------------------------------------
// Create assignment — TEACHER (course owner) or ADMIN
// ---------------------------------------------------------------------------
const createAssignment = async (courseId, userId, role, { title, description, dueDate, maxMarks }) => {
    await _assertCourseTeacherOrAdmin(courseId, userId, role);
    return prisma.assignment.create({
        data: { title, description, courseId, dueDate, maxMarks: maxMarks || 100 },
    });
};

// ---------------------------------------------------------------------------
// Update assignment — TEACHER (course owner) or ADMIN
// ---------------------------------------------------------------------------
const updateAssignment = async (id, userId, role, data) => {
    const assignment = await prisma.assignment.findUnique({ where: { id }, include: { course: true } });
    if (!assignment) {
        const err = new Error('Assignment not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (role !== 'ADMIN' && assignment.course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can update this assignment');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }
    // Strip undefined fields so optional patches don't overwrite with null
    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return prisma.assignment.update({ where: { id }, data: cleanData });
};

// ---------------------------------------------------------------------------
// Delete assignment — TEACHER (course owner) or ADMIN
// ---------------------------------------------------------------------------
const deleteAssignment = async (id, userId, role) => {
    const assignment = await prisma.assignment.findUnique({ where: { id }, include: { course: true } });
    if (!assignment) {
        const err = new Error('Assignment not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (role !== 'ADMIN' && assignment.course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can delete this assignment');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }
    await prisma.assignment.delete({ where: { id } });
};

// ---------------------------------------------------------------------------
// Student submits assignment (or re-submits, updating existing)
// ---------------------------------------------------------------------------
const submitAssignment = async (assignmentId, studentId, { content, fileUrl }) => {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
        const err = new Error('Assignment not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    // Check student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId: assignment.courseId } },
    });
    if (!enrollment) {
        const err = new Error('You are not enrolled in the course this assignment belongs to');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }

    // Upsert: create or update if already submitted
    return prisma.submission.upsert({
        where: { assignmentId_studentId: { assignmentId, studentId } },
        update: { content, fileUrl, submittedAt: new Date() },
        create: { assignmentId, studentId, content, fileUrl },
    });
};

// ---------------------------------------------------------------------------
// Teacher lists all submissions for an assignment
// ---------------------------------------------------------------------------
const listSubmissions = async (assignmentId, userId, role) => {
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { course: true },
    });
    if (!assignment) {
        const err = new Error('Assignment not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (role !== 'ADMIN' && assignment.course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can view all submissions');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }

    return prisma.submission.findMany({
        where: { assignmentId },
        include: {
            student: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { submittedAt: 'asc' },
    });
};

// ---------------------------------------------------------------------------
// Teacher grades a submission
// ---------------------------------------------------------------------------
const gradeSubmission = async (assignmentId, studentId, userId, role, { grade, feedback }) => {
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { course: true },
    });
    if (!assignment) {
        const err = new Error('Assignment not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (role !== 'ADMIN' && assignment.course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can grade submissions');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }
    if (grade > assignment.maxMarks) {
        const err = new Error(`Grade cannot exceed maximum marks (${assignment.maxMarks})`);
        err.status = 400; err.code = 'INVALID_GRADE'; throw err;
    }

    const submission = await prisma.submission.findUnique({
        where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (!submission) {
        const err = new Error('Submission not found');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    return prisma.submission.update({
        where: { assignmentId_studentId: { assignmentId, studentId } },
        data: { grade, feedback, gradedAt: new Date() },
        include: {
            student: { select: { id: true, email: true, firstName: true, lastName: true } },
            assignment: { select: { title: true, maxMarks: true } },
        },
    });
};

// ---------------------------------------------------------------------------
// Student views their own submission and grade
// ---------------------------------------------------------------------------
const getMySubmission = async (assignmentId, studentId) => {
    const submission = await prisma.submission.findUnique({
        where: { assignmentId_studentId: { assignmentId, studentId } },
        include: {
            assignment: { select: { id: true, title: true, maxMarks: true, dueDate: true } },
        },
    });
    if (!submission) {
        const err = new Error('No submission found for this assignment');
        err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return submission;
};

module.exports = {
    listAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    listSubmissions,
    gradeSubmission,
    getMySubmission,
};
