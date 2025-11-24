import { PrismaClient, ProjectStatus, Priority, BillingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding current projects...');

  // Create clients first
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-aloha-massage' },
      update: {},
      create: {
        id: 'client-aloha-massage',
        name: 'Aloha Massage Spa',
        company: 'Aloha Massage Spa',
        email: 'contact@alohamassagespahi.com',
        website: 'https://www.alohamassagespahi.com',
        defaultBillingType: BillingType.FIXED,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-bos-auto' },
      update: {},
      create: {
        id: 'client-bos-auto',
        name: 'BOS Auto Detail',
        company: 'BOS Auto Detail',
        defaultBillingType: BillingType.FIXED,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-walter-peters' },
      update: {},
      create: {
        id: 'client-walter-peters',
        name: 'Walter Peters',
        company: 'BG Trading',
        defaultBillingType: BillingType.HOURLY,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-kangen' },
      update: {},
      create: {
        id: 'client-kangen',
        name: 'Kangen Water Hawaii',
        company: 'Kangen Business',
        defaultBillingType: BillingType.RETAINER,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-bgwealth' },
      update: {},
      create: {
        id: 'client-bgwealth',
        name: 'BG Wealth',
        company: 'Benefits Resource Group',
        website: 'https://www.benefitsresourcegroupllc.com',
        defaultBillingType: BillingType.FIXED,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-lee-meadows' },
      update: {},
      create: {
        id: 'client-lee-meadows',
        name: 'Lee Meadows',
        company: 'Lee Meadows Coaching',
        defaultBillingType: BillingType.FIXED,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-viethawaii' },
      update: {},
      create: {
        id: 'client-viethawaii',
        name: 'Viet Hawaii',
        company: 'Viet Hawaii Restaurant',
        website: 'https://viethawaii.com',
        defaultBillingType: BillingType.FIXED,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-drsilke' },
      update: {},
      create: {
        id: 'client-drsilke',
        name: 'Dr. Silke',
        company: 'Dr. Silke Clinic',
        website: 'https://www.sarnoclinic.com',
        defaultBillingType: BillingType.RETAINER,
        isActive: true,
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-pacific-pulse' },
      update: {},
      create: {
        id: 'client-pacific-pulse',
        name: 'Pacific Pulse (Internal)',
        company: 'Pacific Pulse AI',
        defaultBillingType: BillingType.HOURLY,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${clients.length} clients`);

  // Create projects
  const projects = [
    {
      id: 'proj-aloha-massage-spa',
      name: 'Aloha Massage Spa',
      description: 'Spa booking and management system with online scheduling, service catalog, and client management.',
      status: ProjectStatus.DEPLOYED,
      clientId: 'client-aloha-massage',
      clientName: 'Aloha Massage Spa',
      repositoryUrl: 'https://github.com/sonyho2715/aloha-massage-spa',
      deploymentUrl: 'https://www.alohamassagespahi.com',
      billingType: BillingType.FIXED,
      priority: Priority.MEDIUM,
      initialPrompt: 'Build a modern spa booking website with online scheduling capabilities.',
    },
    {
      id: 'proj-bos-auto-detail',
      name: 'BOS Auto Detail Frontend',
      description: 'Auto detailing service frontend with service packages, booking system, and customer portal.',
      status: ProjectStatus.IN_DEVELOPMENT,
      clientId: 'client-bos-auto',
      clientName: 'BOS Auto Detail',
      repositoryUrl: 'https://github.com/sonyho2715/bos-auto-detail-frontend',
      billingType: BillingType.FIXED,
      priority: Priority.HIGH,
      initialPrompt: 'Create auto detailing service website with package selection and booking.',
    },
    {
      id: 'proj-bg-walter-peters',
      name: 'BG Trading Dashboard',
      description: 'Trading dashboard application with real-time market data, portfolio tracking, and analytics.',
      status: ProjectStatus.DEPLOYED,
      clientId: 'client-walter-peters',
      clientName: 'Walter Peters',
      repositoryUrl: 'https://github.com/sonyho2715/bg-walter-peters',
      deploymentUrl: 'https://bg-walter-peters.vercel.app',
      billingType: BillingType.HOURLY,
      priority: Priority.HIGH,
      initialPrompt: 'Build trading dashboard with portfolio management and market analytics.',
    },
    {
      id: 'proj-kangen-autopost',
      name: 'Kangen Autopost',
      description: 'Kangen business automation tools for social media posting and lead management.',
      status: ProjectStatus.MONITORING,
      clientId: 'client-kangen',
      clientName: 'Kangen Water Hawaii',
      repositoryUrl: 'https://github.com/sonyho2715/kangen-autopost',
      billingType: BillingType.RETAINER,
      priority: Priority.MEDIUM,
      initialPrompt: 'Create automation system for Kangen business social media and marketing.',
    },
    {
      id: 'proj-bgwealth',
      name: 'BG Wealth / Benefits Resource Group',
      description: 'Wealth management platform with financial calculators, tools, and client portal.',
      status: ProjectStatus.DEPLOYED,
      clientId: 'client-bgwealth',
      clientName: 'Benefits Resource Group',
      repositoryUrl: 'https://github.com/sonyho2715/BGWealth',
      deploymentUrl: 'https://www.benefitsresourcegroupllc.com',
      billingType: BillingType.FIXED,
      priority: Priority.MEDIUM,
      initialPrompt: 'Build financial services website with calculators and client resources.',
    },
    {
      id: 'proj-pacific-pulse-growth-lab',
      name: 'Pacific Pulse Growth Lab',
      description: 'Growth lab platform for tracking business metrics, experiments, and growth strategies.',
      status: ProjectStatus.IN_DEVELOPMENT,
      clientId: 'client-pacific-pulse',
      clientName: 'Pacific Pulse (Internal)',
      repositoryUrl: 'https://github.com/sonyho2715/pacific-pulse-growth-lab',
      billingType: BillingType.HOURLY,
      priority: Priority.HIGH,
      initialPrompt: 'Internal growth tracking and analytics platform.',
    },
    {
      id: 'proj-lee-meadows-saas',
      name: 'Lee Meadows SaaS',
      description: 'SaaS application for coaching business with client management and session scheduling.',
      status: ProjectStatus.IN_DEVELOPMENT,
      clientId: 'client-lee-meadows',
      clientName: 'Lee Meadows',
      repositoryUrl: 'https://github.com/sonyho2715/lee-meadows-saas',
      billingType: BillingType.FIXED,
      priority: Priority.MEDIUM,
      initialPrompt: 'Build coaching SaaS platform with client management features.',
    },
    {
      id: 'proj-viethawaii',
      name: 'Viet Hawaii Restaurant',
      description: 'Vietnamese restaurant platform with online menu, ordering, and reservation system.',
      status: ProjectStatus.DEPLOYED,
      clientId: 'client-viethawaii',
      clientName: 'Viet Hawaii',
      repositoryUrl: 'https://github.com/sonyho2715/viethawaii',
      deploymentUrl: 'https://viethawaii.com',
      billingType: BillingType.FIXED,
      priority: Priority.MEDIUM,
      initialPrompt: 'Create restaurant website with online ordering and reservations.',
    },
    {
      id: 'proj-drsilke-autopost',
      name: 'Dr. Silke Autopost',
      description: 'Dr. Silke autoposting system for social media content scheduling and management.',
      status: ProjectStatus.MONITORING,
      clientId: 'client-drsilke',
      clientName: 'Dr. Silke',
      repositoryUrl: 'https://github.com/sonyho2715/drsilke-autopost',
      billingType: BillingType.RETAINER,
      priority: Priority.LOW,
      initialPrompt: 'Autoposting system for medical practice social media.',
    },
    {
      id: 'proj-ai-prompts-marketplace',
      name: 'AI Prompts Marketplace',
      description: 'AI prompts marketplace for buying and selling AI prompt templates.',
      status: ProjectStatus.BACKLOG,
      clientId: 'client-pacific-pulse',
      clientName: 'Pacific Pulse (Internal)',
      repositoryUrl: 'https://github.com/sonyho2715/ai-prompts-marketplace',
      billingType: BillingType.HOURLY,
      priority: Priority.LOW,
      initialPrompt: 'Build marketplace for AI prompts and templates.',
    },
    {
      id: 'proj-pacific-pulse-kanban',
      name: 'Pacific Pulse AI Projects Kanban',
      description: 'This CRM/project management system for tracking all AI development projects.',
      status: ProjectStatus.IN_DEVELOPMENT,
      clientId: 'client-pacific-pulse',
      clientName: 'Pacific Pulse (Internal)',
      billingType: BillingType.HOURLY,
      priority: Priority.URGENT,
      initialPrompt: 'Build comprehensive CRM for managing AI projects with Kanban board.',
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        clientId: project.clientId,
        clientName: project.clientName,
        repositoryUrl: project.repositoryUrl,
        deploymentUrl: project.deploymentUrl,
        billingType: project.billingType,
        priority: project.priority,
        initialPrompt: project.initialPrompt,
      },
      create: project,
    });
  }

  console.log(`Created/updated ${projects.length} projects`);

  // Create some tags
  const tags = [
    { name: 'Next.js', color: '#000000' },
    { name: 'React', color: '#61dafb' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Prisma', color: '#2d3748' },
    { name: 'Tailwind', color: '#38bdf8' },
    { name: 'Vercel', color: '#000000' },
    { name: 'Railway', color: '#0b0d0e' },
    { name: 'SaaS', color: '#8b5cf6' },
    { name: 'E-commerce', color: '#10b981' },
    { name: 'Booking', color: '#f59e0b' },
    { name: 'Dashboard', color: '#3b82f6' },
    { name: 'Automation', color: '#ef4444' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { color: tag.color },
      create: tag,
    });
  }

  console.log(`Created ${tags.length} tags`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
