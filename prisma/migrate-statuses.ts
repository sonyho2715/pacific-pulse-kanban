import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting status migration...');

  // Map old statuses to new statuses
  const statusMapping = {
    PLANNING: 'PLANNED',
    STARTED: 'IN_DEVELOPMENT',
    IN_PROGRESS: 'IN_DEVELOPMENT',
    FINISHED: 'DEPLOYED',
    PAID: 'COMPLETE',
  };

  // Get all projects
  const projects = await prisma.$queryRaw<Array<{ id: string; status: string; name: string }>>`
    SELECT id, status::text, name FROM "Project"
  `;

  console.log(`Found ${projects.length} projects to migrate`);

  // Update each project
  for (const project of projects) {
    const oldStatus = project.status;
    const newStatus = statusMapping[oldStatus as keyof typeof statusMapping];

    if (newStatus) {
      console.log(`Migrating "${project.name}": ${oldStatus} → ${newStatus}`);
      await prisma.$executeRaw`
        UPDATE "Project"
        SET status = CAST(${newStatus} AS "ProjectStatus")
        WHERE id = ${project.id}
      `;
    } else {
      console.log(`⚠️  Unknown status for "${project.name}": ${oldStatus}`);
    }
  }

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
