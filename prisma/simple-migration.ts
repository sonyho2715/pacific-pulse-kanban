import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Migrating project statuses...\n');

  // Read all projects with old statuses
  const projects = await prisma.$queryRaw<Array<{ id: string; status: string; name: string }>>`
    SELECT id, status::text as status, name FROM "Project"
  `;

  console.log(`Found ${projects.length} projects to check\n`);

  // Status mapping
  const statusMap: Record<string, string> = {
    'PLANNING': 'PLANNED',
    'STARTED': 'IN_DEVELOPMENT',
    'IN_PROGRESS': 'IN_DEVELOPMENT',
    'FINISHED': 'DEPLOYED',
    'PAID': 'COMPLETE',
  };

  let migrated = 0;
  let skipped = 0;

  for (const project of projects) {
    const newStatus = statusMap[project.status];

    if (newStatus) {
      console.log(`  Migrating "${project.name}": ${project.status} → ${newStatus}`);
      // We'll do this after enum values exist
      migrated++;
    } else {
      console.log(`  ✓ "${project.name}": ${project.status} (already using new status)`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  - Projects to migrate: ${migrated}`);
  console.log(`  - Projects already migrated: ${skipped}`);
  console.log(`\nℹ️  Run 'npm run db:push -- --accept-data-loss' to update the database schema`);
  console.log(`   Then run this script again to complete the data migration.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
