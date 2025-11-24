import { PrismaClient, ProjectStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct order
  await prisma.activityLog.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.note.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.client.deleteMany();

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Walter Peters',
        email: 'walter@example.com',
        company: 'BG Trading',
        notes: 'Trading platform client',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Lee Meadows',
        email: 'lee@example.com',
        company: 'Meadows Coaching',
        notes: 'Coaching business platform',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Viet Hawaii Restaurant',
        email: 'info@viethawaii.com',
        company: 'VietHawaii',
        notes: 'Restaurant website and ordering',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Dr. Silke',
        email: 'drsilke@example.com',
        company: 'Dr. Silke Wellness',
        notes: 'Social media automation',
      },
    }),
  ]);

  console.log(`Created ${clients.length} clients`);

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Next.js', color: '#000000' } }),
    prisma.tag.create({ data: { name: 'React', color: '#61dafb' } }),
    prisma.tag.create({ data: { name: 'Prisma', color: '#2d3748' } }),
    prisma.tag.create({ data: { name: 'TypeScript', color: '#3178c6' } }),
    prisma.tag.create({ data: { name: 'Vercel', color: '#000000' } }),
    prisma.tag.create({ data: { name: 'Railway', color: '#0b0d0e' } }),
    prisma.tag.create({ data: { name: 'E-commerce', color: '#22c55e' } }),
    prisma.tag.create({ data: { name: 'Dashboard', color: '#8b5cf6' } }),
    prisma.tag.create({ data: { name: 'Automation', color: '#f59e0b' } }),
    prisma.tag.create({ data: { name: 'SaaS', color: '#ef4444' } }),
  ]);

  console.log(`Created ${tags.length} tags`);

  // Create projects with CRM data
  const projects = [
    {
      name: 'Aloha Massage Spa',
      description: 'Spa booking and management system',
      status: ProjectStatus.IN_DEVELOPMENT,
      priority: Priority.HIGH,
      repositoryUrl: 'https://github.com/sonyho2715/aloha-massage-spa',
      nextActionSteps: 'Complete booking calendar integration\nAdd payment processing',
      estimatedHours: 40,
      order: 1,
    },
    {
      name: 'BOS Auto Detail Frontend',
      description: 'Auto detailing service frontend application',
      status: ProjectStatus.IN_DEVELOPMENT,
      priority: Priority.MEDIUM,
      repositoryUrl: 'https://github.com/sonyho2715/bos-auto-detail-frontend',
      nextActionSteps: 'Finish service selection UI\nIntegrate with backend API',
      estimatedHours: 32,
      order: 2,
    },
    {
      name: 'BG Walter Peters',
      description: 'Trading dashboard application',
      status: ProjectStatus.DEPLOYED,
      priority: Priority.HIGH,
      clientId: clients[0].id,
      repositoryUrl: 'https://github.com/sonyho2715/bg-walter-peters',
      deploymentUrl: 'https://bg-walter-peters.vercel.app',
      nextActionSteps: 'Monitor for issues\nGather client feedback',
      estimatedHours: 60,
      actualHours: 55,
      quoteAmount: 2500,
      paidAmount: 2500,
      order: 3,
    },
    {
      name: 'Kangen Autopost',
      description: 'Kangen business automation tools',
      status: ProjectStatus.QA,
      priority: Priority.MEDIUM,
      repositoryUrl: 'https://github.com/sonyho2715/kangen-autopost',
      nextActionSteps: 'Test all automation workflows\nFix edge cases',
      estimatedHours: 24,
      order: 4,
    },
    {
      name: 'BG Wealth',
      description: 'Wealth management platform',
      status: ProjectStatus.BACKLOG,
      priority: Priority.LOW,
      nextActionSteps: 'Define requirements\nCreate wireframes',
      estimatedHours: 80,
      order: 5,
    },
    {
      name: 'Pacific Pulse Growth Lab',
      description: 'Growth lab platform for business development',
      status: ProjectStatus.MONITORING,
      priority: Priority.MEDIUM,
      repositoryUrl: 'https://github.com/sonyho2715/pacific-pulse-growth-lab',
      deploymentUrl: 'https://pacific-pulse-growth-lab.vercel.app',
      nextActionSteps: 'Track usage metrics\nPlan next feature iteration',
      estimatedHours: 48,
      actualHours: 52,
      order: 6,
    },
    {
      name: 'Lee Meadows SaaS',
      description: 'SaaS application for coaching business',
      status: ProjectStatus.IN_DEVELOPMENT,
      priority: Priority.HIGH,
      clientId: clients[1].id,
      repositoryUrl: 'https://github.com/sonyho2715/lee-meadows-saas',
      nextActionSteps: 'Complete user dashboard\nAdd subscription management',
      estimatedHours: 64,
      quoteAmount: 3500,
      paidAmount: 1750,
      order: 7,
    },
    {
      name: 'VietHawaii',
      description: 'Vietnamese restaurant platform',
      status: ProjectStatus.CLIENT_DELIVERY,
      priority: Priority.HIGH,
      clientId: clients[2].id,
      repositoryUrl: 'https://github.com/sonyho2715/viethawaii',
      deploymentUrl: 'https://viethawaii.vercel.app',
      nextActionSteps: 'Schedule client training\nPrepare handoff documentation',
      estimatedHours: 40,
      actualHours: 38,
      quoteAmount: 2000,
      order: 8,
    },
    {
      name: 'Dr. Silke Autopost',
      description: 'Dr. Silke autoposting system for social media',
      status: ProjectStatus.READY_FOR_PROD,
      priority: Priority.URGENT,
      clientId: clients[3].id,
      repositoryUrl: 'https://github.com/sonyho2715/drsilke-autopost',
      nextActionSteps: 'Final testing\nPrepare production deployment',
      estimatedHours: 28,
      actualHours: 30,
      isOnHold: true,
      holdReason: 'Waiting for client to provide Instagram API credentials',
      holdStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      totalHoldDays: 5,
      order: 9,
    },
    {
      name: 'AI Prompts Marketplace',
      description: 'Marketplace for AI prompts and templates',
      status: ProjectStatus.PLANNED,
      priority: Priority.LOW,
      nextActionSteps: 'Research competitor platforms\nDefine MVP features',
      estimatedHours: 120,
      order: 10,
    },
    {
      name: 'Claude Code Project Tracker',
      description: 'Kanban board to track all Claude Code projects - this app!',
      status: ProjectStatus.IN_DEVELOPMENT,
      priority: Priority.HIGH,
      initialPrompt: 'I want to build a page to track progress of all my current projects from planning, start, progress, finish, get paid, estimate, kanban style.',
      nextActionSteps: 'Add tags system\nCreate activity feed\nDeploy to production',
      estimatedHours: 20,
      actualHours: 15,
      order: 11,
    },
  ];

  for (const project of projects) {
    const created = await prisma.project.create({
      data: project,
    });

    // Add initial status history
    await prisma.statusHistory.create({
      data: {
        projectId: created.id,
        fromStatus: null,
        toStatus: created.status,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        projectId: created.id,
        action: 'created',
        description: `Project "${created.name}" was created`,
      },
    });
  }

  console.log(`Created ${projects.length} projects with status history and activity logs`);

  // Add some sample tags to projects
  const allProjects = await prisma.project.findMany();

  // Add tags to first few projects
  if (allProjects.length > 0 && tags.length > 0) {
    await prisma.projectTag.createMany({
      data: [
        { projectId: allProjects[0].id, tagId: tags[0].id }, // Next.js
        { projectId: allProjects[0].id, tagId: tags[1].id }, // React
        { projectId: allProjects[0].id, tagId: tags[3].id }, // TypeScript
        { projectId: allProjects[2].id, tagId: tags[7].id }, // Dashboard
        { projectId: allProjects[2].id, tagId: tags[0].id }, // Next.js
        { projectId: allProjects[6].id, tagId: tags[9].id }, // SaaS
        { projectId: allProjects[6].id, tagId: tags[0].id }, // Next.js
        { projectId: allProjects[8].id, tagId: tags[8].id }, // Automation
        { projectId: allProjects[10].id, tagId: tags[0].id }, // Next.js
        { projectId: allProjects[10].id, tagId: tags[2].id }, // Prisma
      ],
    });
    console.log('Added tags to projects');
  }

  // Add sample notes
  if (allProjects.length > 0) {
    await prisma.note.createMany({
      data: [
        {
          projectId: allProjects[0].id,
          content: 'Initial meeting with client completed. Requirements documented.',
        },
        {
          projectId: allProjects[2].id,
          content: 'Client approved final design. Moving to deployment phase.',
        },
        {
          projectId: allProjects[6].id,
          content: 'First payment received. Starting development phase.',
        },
        {
          projectId: allProjects[8].id,
          content: 'Waiting on Instagram API credentials from client.',
        },
      ],
    });
    console.log('Added sample notes');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
