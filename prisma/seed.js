// =============================================================================
// Prisma Database Seed — creates default plans, a super admin, and sample org
// Run: npm run db:seed
// =============================================================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ------------------------------------------------------------------
  // Super Admin user
  // ------------------------------------------------------------------
  const passwordHash = await bcrypt.hash('SuperAdmin@123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@saasplatform.dev' },
    update: {},
    create: {
      email: 'admin@saasplatform.dev',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });

  console.log(`✅  Super Admin created: ${superAdmin.email}`);

  // ------------------------------------------------------------------
  // Sample organisation + subscription
  // ------------------------------------------------------------------
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Sample organisation for development',
      website: 'https://acme.example.com',
    },
  });

  console.log(`✅  Organisation created: ${org.name}`);

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: superAdmin.id, organizationId: org.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      organizationId: org.id,
      role: 'ADMIN',
    },
  });

  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅  Subscription (PRO) attached to ${org.name}`);
  console.log('\n🎉  Seed complete!');
  console.log('   Email   : admin@saasplatform.dev');
  console.log('   Password: SuperAdmin@123');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
