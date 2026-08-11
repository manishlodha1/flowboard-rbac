'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Project, Task, TaskPriority, TaskStatus } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Input, Label, Select, Textarea } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { RequirePermission } from '@/components/rbac/RequirePermission';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TasksPage() {
  const { can, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api<Task[]>('/tasks', {
          query: { page, limit: 8, search, status, priority, projectId },
        }),
        api<Project[]>('/projects', { query: { limit: 50 } }),
      ]);
      setTasks(tasksRes.data);
      setTotalPages(tasksRes.meta?.totalPages ?? 1);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api('/tasks', {
      method: 'POST',
      body: {
        title: form.get('title'),
        description: form.get('description') || undefined,
        status: form.get('status'),
        priority: form.get('priority'),
        projectId: form.get('projectId'),
      },
    });
    setShowCreate(false);
    setPage(1);
    await load();
  }

  async function saveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    await api(`/tasks/${editing.id}`, {
      method: 'PATCH',
      body: {
        title: form.get('title'),
        description: form.get('description') || undefined,
        status: form.get('status'),
        priority: form.get('priority'),
      },
    });
    setEditing(null);
    await load();
  }

  async function removeTask(id: string) {
    if (!confirm('Delete this task?')) return;
    await api(`/tasks/${id}`, { method: 'DELETE' });
    await load();
  }

  function canEdit(task: Task) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER' && task.project.managerId === user.id) return true;
    return task.assigneeId === user.id || task.createdById === user.id;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tasks</p>
          <h1 className="mt-2 font-display text-4xl text-ink-950">Work queue</h1>
        </div>
        <RequirePermission permission="tasks:create" fallback={null}>
          <Button onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : 'New task'}
          </Button>
        </RequirePermission>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Search tasks…"
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
        <Select
          value={priority}
          onChange={(e) => {
            setPage(1);
            setPriority(e.target.value);
          }}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select
          value={projectId}
          onChange={(e) => {
            setPage(1);
            setProjectId(e.target.value);
          }}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {showCreate ? (
        <form onSubmit={createTask} className="space-y-3 rounded-xl border border-ink-100 bg-sand-50 p-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="projectId">Project</Label>
              <Select id="projectId" name="projectId" required defaultValue="">
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="TODO">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue="MEDIUM">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit">Create task</Button>
        </form>
      ) : null}

      {editing ? (
        <form onSubmit={saveEdit} className="space-y-3 rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
          <h3 className="font-semibold text-ink-900">Edit task</h3>
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={editing.title} required />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={editing.description ?? ''}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select id="edit-status" name="status" defaultValue={editing.status}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select id="edit-priority" name="priority" defaultValue={editing.priority}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <Alert message={error} /> : null}
      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="Adjust filters or create a new task." />
      ) : (
        <ul className="divide-y divide-ink-100 border-y border-ink-100">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-lg font-semibold text-ink-900">{task.title}</p>
                <p className="text-sm text-ink-500">
                  {task.project.name} · {task.assignee?.name ?? 'Unassigned'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(task.status)}>{task.status.replace('_', ' ')}</Badge>
                <Badge tone={statusTone(task.priority)}>{task.priority}</Badge>
                {canEdit(task) ? (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(task)}>
                    Edit
                  </Button>
                ) : null}
                {can('tasks:delete') ? (
                  <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
