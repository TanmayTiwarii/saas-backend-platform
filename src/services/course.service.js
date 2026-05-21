// =============================================================================
// Course Service
// =============================================================================
const prisma = require('../config/db');

const COURSE_SELECT = {
    id: true,
    title: true,
    description: true,
    code: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
    _count: { select: { enrollments: true, assignments: true } },
};

// ---------------------------------------------------------------------------
// List all active courses (paginated, searchable)
// ---------------------------------------------------------------------------
const listCourses = async ({ page = 1, limit = 20, search } = {}) => {
    const skip = (page - 1) * limit;
    const where = {
        isActive: true,
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [courses, total] = await prisma.$transaction([
        prisma.course.findMany({ where, select: COURSE_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.course.count({ where }),
    ]);

    return { courses, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Get single course by ID
// ---------------------------------------------------------------------------
const getCourseById = async (id) => {
    const course = await prisma.course.findUnique({ where: { id }, select: COURSE_SELECT });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    return course;
};

// ---------------------------------------------------------------------------
// Create a course — TEACHER or ADMIN
// ---------------------------------------------------------------------------
const createCourse = async (teacherId, { title, description, code }) => {
    const existing = await prisma.course.findUnique({ where: { code } });
    if (existing) {
        const err = new Error('A course with this code already exists');
        err.status = 409;
        err.code = 'CODE_TAKEN';
        throw err;
    }

    return prisma.course.create({
        data: { title, description, code, teacherId },
        select: COURSE_SELECT,
    });
};

// ---------------------------------------------------------------------------
// Update course — only the owning TEACHER or ADMIN
// ---------------------------------------------------------------------------
const updateCourse = async (id, userId, role, data) => {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    if (role !== 'ADMIN' && course.teacherId !== userId) {
        const err = new Error('You can only update your own courses');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    return prisma.course.update({ where: { id }, data, select: COURSE_SELECT });
};

// ---------------------------------------------------------------------------
// Deactivate course — only the owning TEACHER or ADMIN
// ---------------------------------------------------------------------------
const deleteCourse = async (id, userId, role) => {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    if (role !== 'ADMIN' && course.teacherId !== userId) {
        const err = new Error('You can only deactivate your own courses');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    await prisma.course.update({ where: { id }, data: { isActive: false } });
};

// ---------------------------------------------------------------------------
// Enroll a student in a course
// ---------------------------------------------------------------------------
const enrollStudent = async (studentId, courseId) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.isActive) {
        const err = new Error('Course not found or no longer active');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) {
        const err = new Error('You are already enrolled in this course');
        err.status = 409;
        err.code = 'ALREADY_ENROLLED';
        throw err;
    }

    return prisma.enrollment.create({
        data: { studentId, courseId },
        include: { course: { select: { id: true, title: true, code: true } } },
    });
};

// ---------------------------------------------------------------------------
// Unenroll a student from a course
// ---------------------------------------------------------------------------
const unenrollStudent = async (studentId, courseId) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) {
        const err = new Error('You are not enrolled in this course');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    await prisma.enrollment.delete({
        where: { studentId_courseId: { studentId, courseId } },
    });
};

// ---------------------------------------------------------------------------
// List all students enrolled in a course — TEACHER (own) or ADMIN
// ---------------------------------------------------------------------------
const listStudents = async (courseId, userId, role) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    if (role !== 'ADMIN' && course.teacherId !== userId) {
        const err = new Error('Only the course teacher or an admin can view enrolled students');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    return prisma.enrollment.findMany({
        where: { courseId },
        include: {
            student: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { enrolledAt: 'asc' },
    });
};

// ---------------------------------------------------------------------------
// Get courses the authenticated student is enrolled in
// ---------------------------------------------------------------------------
const getMyCourses = async (studentId) => {
    return prisma.enrollment.findMany({
        where: { studentId },
        include: { course: { select: COURSE_SELECT } },
        orderBy: { enrolledAt: 'desc' },
    });
};

// ---------------------------------------------------------------------------
// Get courses taught by the authenticated teacher
// ---------------------------------------------------------------------------
const getMyTaughtCourses = async (teacherId) => {
    return prisma.course.findMany({
        where: { teacherId },
        select: COURSE_SELECT,
        orderBy: { createdAt: 'desc' },
    });
};

module.exports = {
    listCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollStudent,
    unenrollStudent,
    listStudents,
    getMyCourses,
    getMyTaughtCourses,
};
