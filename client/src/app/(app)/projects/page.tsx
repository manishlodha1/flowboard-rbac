'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Project, ProjectStatus } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Input, Label, Select, Textarea } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { RequirePermission } from '@/components/rbac/RequirePermission';

const STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];

export default function ProjectsPage() {
  const { can } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api<Project[]>('/projects', {
        query: { page, limit: 8, search, status },
      });
      setProjects(res.data);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api('/projects', {
      method: 'POST',
      body: {
        name: form.get('name'),
        description: form.get('description') || undefined,
        status: form.get('status'),
      },
    });
    setShowCreate(false);
    setPage(1);
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Projects</p>
          <h1 className="mt-2 font-display text-4xl text-ink-950">Workspace projects</h1>
        </div>
        <RequirePermission permission="projects:create" fallback={null}>
          <Button onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : 'New project'}
          </Button>
        </RequirePermission>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>

      {showCreate && can('projects:create') ? (
        <form onSubmit={createProject} className="space-y-3 rounded-xl border border-ink-100 bg-sand-50 p-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="PLANNING">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Create project</Button>
        </form>
      ) : null}

      {error ? <Alert message={error} /> : null}
      {loading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try clearing filters, or create a project if your role allows it."
        />
      ) : (
        <ul className="divide-y divide-ink-100 border-y border-ink-100">
          {projects.map((project) => (
            <li key={project.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-lg font-semibold text-ink-900 hover:text-accent"
                >
                  {project.name}
                </Link>
                <p className="mt-1 max-w-2xl text-sm text-ink-500">
                  {project.description || 'No description'} · Managed by {project.manager.name} ·{' '}
                  {project._count?.tasks ?? 0} tasks
                </p>
              </div>
              <Badge tone={statusTone(project.status)}>{project.status.replace('_', ' ')}</Badge>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
