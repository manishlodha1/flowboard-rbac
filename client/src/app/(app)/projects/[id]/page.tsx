'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Project, Task, User } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { Select } from '@/components/ui/Field';
import { RequirePermission } from '@/components/rbac/RequirePermission';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { can, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignable, setAssignable] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [memberId, setMemberId] = useState('');

  const load = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api<Project>(`/projects/${params.id}`),
        api<Task[]>('/tasks', { query: { projectId: params.id, limit: 50 } }),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      if (can('projects:members')) {
        const usersRes = await api<User[]>('/users/assignable');
        setAssignable(usersRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    }
  }, [params.id, can]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    await api(`/projects/${params.id}/members`, {
      method: 'POST',
      body: { userId: memberId },
    });
    setMemberId('');
    await load();
  }

  async function removeMember(userId: string) {
    await api(`/projects/${params.id}/members/${userId}`, { method: 'DELETE' });
    await load();
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all of its tasks?')) return;
    await api(`/projects/${params.id}`, { method: 'DELETE' });
    router.push('/projects');
  }

  if (error) return <Alert message={error} />;
  if (!project) return <Spinner />;

  const canManage =
    user?.role === 'ADMIN' ||
    (user?.role === 'MANAGER' && project.managerId === user.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/projects" className="text-sm text-accent hover:underline">
          ← Back to projects
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-ink-950">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-ink-500">{project.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(project.status)}>{project.status.replace('_', ' ')}</Badge>
            <RequirePermission permission="projects:delete" fallback={null}>
              <Button variant="danger" size="sm" onClick={deleteProject}>
                Delete
              </Button>
            </RequirePermission>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl text-ink-950">Members</h2>
        <ul className="mt-3 divide-y divide-ink-100 border-y border-ink-100">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-ink-900">{m.user.name}</p>
                <p className="text-sm text-ink-500">
                  {m.user.email} · {m.user.role}
                  {project.managerId === m.userId ? ' · Manager' : ''}
                </p>
              </div>
              {canManage && project.managerId !== m.userId ? (
                <Button variant="ghost" size="sm" onClick={() => removeMember(m.userId)}>
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        {canManage ? (
          <form onSubmit={addMember} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
              <option value="">Add member…</option>
              {assignable
                .filter((u) => !project.members.some((m) => m.userId === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </Select>
            <Button type="submit">Add</Button>
          </form>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink-950">Tasks</h2>
          <Link href="/tasks" className="text-sm font-medium text-accent hover:underline">
            Manage in Tasks
          </Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-ink-500">No tasks in this project yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100 border-y border-ink-100">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-ink-900">{task.title}</p>
                  <p className="text-sm text-ink-500">
                    {task.assignee?.name ?? 'Unassigned'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={statusTone(task.status)}>{task.status.replace('_', ' ')}</Badge>
                  <Badge tone={statusTone(task.priority)}>{task.priority}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
