// =============================================================================
// Prisma Database Seed — Student Portal
// Creates: 1 admin, 2 teachers, 3 students, 2 courses, enrollments, assignments
// Run: npm run db:seed
// =============================================================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hash(pw, 12);

async function main() {
    console.log('🌱  Seeding Student Portal database...\n');

    // ── Admin ─────────────────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: 'admin@portal.dev' },
        update: {},
        create: {
            email: 'admin@portal.dev',
            passwordHash: await hash('Admin@123'),
            firstName: 'Super',
            lastName: 'Admin',
            role: 'ADMIN',
            isEmailVerified: true,
        },
    });
    console.log(`✅  Admin:    ${admin.email}`);

    // ── Teachers ──────────────────────────────────────────────────────────────
    const teacher1 = await prisma.user.upsert({
        where: { email: 'alice@portal.dev' },
        update: {},
        create: {
            email: 'alice@portal.dev',
            passwordHash: await hash('Teacher@123'),
            firstName: 'Alice',
            lastName: 'Johnson',
            role: 'TEACHER',
            isEmailVerified: true,
        },
    });

    const teacher2 = await prisma.user.upsert({
        where: { email: 'bob@portal.dev' },
        update: {},
        create: {
            email: 'bob@portal.dev',
            passwordHash: await hash('Teacher@123'),
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'TEACHER',
            isEmailVerified: true,
        },
    });
    console.log(`✅  Teachers: ${teacher1.email}, ${teacher2.email}`);

    // ── Students ──────────────────────────────────────────────────────────────
    const student1 = await prisma.user.upsert({
        where: { email: 'charlie@portal.dev' },
        update: {},
        create: {
            email: 'charlie@portal.dev',
            passwordHash: await hash('Student@123'),
            firstName: 'Charlie',
            lastName: 'Brown',
            role: 'STUDENT',
            isEmailVerified: true,
        },
    });

    const student2 = await prisma.user.upsert({
        where: { email: 'diana@portal.dev' },
        update: {},
        create: {
            email: 'diana@portal.dev',
            passwordHash: await hash('Student@123'),
            firstName: 'Diana',
            lastName: 'Prince',
            role: 'STUDENT',
            isEmailVerified: true,
        },
    });

    const student3 = await prisma.user.upsert({
        where: { email: 'evan@portal.dev' },
        update: {},
        create: {
            email: 'evan@portal.dev',
            passwordHash: await hash('Student@123'),
            firstName: 'Evan',
            lastName: 'Rogers',
            role: 'STUDENT',
            isEmailVerified: true,
        },
    });
    console.log(`✅  Students: ${student1.email}, ${student2.email}, ${student3.email}`);

    // ── Courses ───────────────────────────────────────────────────────────────
    const course1 = await prisma.course.upsert({
        where: { code: 'CS101' },
        update: {},
        create: {
            title: 'Introduction to Computer Science',
            code: 'CS101',
            description: 'Fundamentals of programming, algorithms, and computer science concepts.',
            teacherId: teacher1.id,
        },
    });

    const course2 = await prisma.course.upsert({
        where: { code: 'MATH201' },
        update: {},
        create: {
            title: 'Applied Mathematics',
            code: 'MATH201',
            description: 'Linear algebra, calculus, and discrete mathematics for engineers.',
            teacherId: teacher2.id,
        },
    });
    console.log(`✅  Courses:  ${course1.code} (${course1.title}), ${course2.code} (${course2.title})`);

    // ── Enrollments ───────────────────────────────────────────────────────────
    const enrollments = [
        { studentId: student1.id, courseId: course1.id },
        { studentId: student2.id, courseId: course1.id },
        { studentId: student3.id, courseId: course1.id },
        { studentId: student1.id, courseId: course2.id },
        { studentId: student2.id, courseId: course2.id },
    ];

    for (const e of enrollments) {
        await prisma.enrollment.upsert({
            where: { studentId_courseId: e },
            update: {},
            create: e,
        });
    }
    console.log(`✅  Enrollments: 5 created`);

    // ── Assignments ───────────────────────────────────────────────────────────
    const assign1 = await prisma.assignment.upsert({
        where: { id: 'seed-assign-001' },
        update: {},
        create: {
            id: 'seed-assign-001',
            title: 'Hello World Program',
            description: 'Write a Hello World program in the language of your choice and explain your code.',
            courseId: course1.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxMarks: 100,
        },
    });

    const assign2 = await prisma.assignment.upsert({
        where: { id: 'seed-assign-002' },
        update: {},
        create: {
            id: 'seed-assign-002',
            title: 'Sorting Algorithms',
            description: 'Implement and compare Bubble Sort, Merge Sort, and Quick Sort.',
            courseId: course1.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            maxMarks: 100,
        },
    });

    const assign3 = await prisma.assignment.upsert({
        where: { id: 'seed-assign-003' },
        update: {},
        create: {
            id: 'seed-assign-003',
            title: 'Matrix Multiplication',
            description: 'Implement matrix multiplication from scratch without using libraries.',
            courseId: course2.id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            maxMarks: 50,
        },
    });
    console.log(`✅  Assignments: "${assign1.title}", "${assign2.title}", "${assign3.title}"`);

    // ── Sample submission + grade ─────────────────────────────────────────────
    await prisma.submission.upsert({
        where: { assignmentId_studentId: { assignmentId: assign1.id, studentId: student1.id } },
        update: {},
        create: {
            assignmentId: assign1.id,
            studentId: student1.id,
            content: 'console.log("Hello, World!"); // JavaScript implementation',
            grade: 95,
            feedback: 'Excellent work! Clean code and good explanation.',
            gradedAt: new Date(),
        },
    });
    console.log(`✅  Sample graded submission created`);

    console.log('\n🎉  Seed complete!\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│                  Login Credentials                   │');
    console.log('├──────────┬───────────────────────────┬──────────────┤');
    console.log('│ Role     │ Email                     │ Password     │');
    console.log('├──────────┼───────────────────────────┼──────────────┤');
    console.log('│ ADMIN    │ admin@portal.dev           │ Admin@123    │');
    console.log('│ TEACHER  │ alice@portal.dev           │ Teacher@123  │');
    console.log('│ TEACHER  │ bob@portal.dev             │ Teacher@123  │');
    console.log('│ STUDENT  │ charlie@portal.dev         │ Student@123  │');
    console.log('│ STUDENT  │ diana@portal.dev           │ Student@123  │');
    console.log('│ STUDENT  │ evan@portal.dev            │ Student@123  │');
    console.log('└──────────┴───────────────────────────┴──────────────┘');
}

main()
    .catch((e) => {
        console.error('❌  Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
