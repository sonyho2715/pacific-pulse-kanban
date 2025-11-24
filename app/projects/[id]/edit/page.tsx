import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { EditProjectForm } from '@/components/EditProjectForm';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, clients, tags] = await Promise.all([
    db.project.findUnique({
      where: { id: params.id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        client: true,
        tags: {
          include: { tag: true },
        },
      },
    }),
    db.client.findMany({ orderBy: { name: 'asc' } }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Project
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-primary">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
              <p className="text-sm text-slate-500">{project.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <EditProjectForm project={project} clients={clients} tags={tags} />
      </div>
    </div>
  );
}
