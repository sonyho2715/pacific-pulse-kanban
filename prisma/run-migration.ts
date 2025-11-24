import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ProjectStatus enum migration...\n');

  try {
    // Step 1: Add IN_DEVELOPMENT value first (needed for data migration)
    console.log('Step 1: Adding IN_DEVELOPMENT enum value...');
    await prisma.$executeRaw`ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'IN_DEVELOPMENT'`;
    console.log('✅ IN_DEVELOPMENT added\n');

    // Step 2: Migrate STARTED and IN_PROGRESS data to IN_DEVELOPMENT
    console.log('Step 2: Migrating existing data to IN_DEVELOPMENT...');
    const updated = await prisma.$executeRaw`
      UPDATE "Project"
      SET status = 'IN_DEVELOPMENT'::text::"ProjectStatus"
      WHERE status::text IN ('STARTED', 'IN_PROGRESS')
    `;
    console.log(`✅ Migrated ${updated} projects\n`);

    // Step 3: Add all other new enum values
    console.log('Step 3: Adding new enum values...');
    const newValues = ['BACKLOG', 'CODE_REVIEW', 'QA', 'READY_FOR_PROD', 'MONITORING', 'CLIENT_DELIVERY'];
    for (const value of newValues) {
      await prisma.$executeRaw`ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS ${value}`;
      console.log(`  ✅ Added ${value}`);
    }
    console.log();

    // Step 4: Rename existing enum values
    console.log('Step 4: Renaming existing enum values...');
    await prisma.$executeRaw`ALTER TYPE "ProjectStatus" RENAME VALUE 'PLANNING' TO 'PLANNED'`;
    console.log('  ✅ PLANNING → PLANNED');

    await prisma.$executeRaw`ALTER TYPE "ProjectStatus" RENAME VALUE 'FINISHED' TO 'DEPLOYED'`;
    console.log('  ✅ FINISHED → DEPLOYED');

    await prisma.$executeRaw`ALTER TYPE "ProjectStatus" RENAME VALUE 'PAID' TO 'COMPLETE'`;
    console.log('  ✅ PAID → COMPLETE\n');

    // Step 5: Show current status distribution
    console.log('Step 5: Current project status distribution:');
    const distribution = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status::text, COUNT(*) as count
      FROM "Project"
      GROUP BY status::text
      ORDER BY count DESC
    `;

    distribution.forEach(({ status, count }) => {
      console.log(`  ${status}: ${count} projects`);
    });

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
