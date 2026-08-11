'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/rbac';
import type { DashboardData } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Alert, Spinner } from '@/components/ui/Feedback';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardData>('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert message={error} />;
  if (!data) return <Spinner />;

  const tiles = [
    { label: 'Projects', value: data.stats.projects },
    { label: 'Tasks', value: data.stats.tasks },
    { label: 'In progress', value: data.stats.inProgress },
    { label: 'Done', value: data.stats.done },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Overview</p>
        <h1 className="mt-2 font-display text-4xl text-ink-950">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-ink-500">
          Signed in as {ROLE_LABELS[data.role]}. Your workspace is filtered by role and
          membership.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-ink-100 bg-sand-50/80 p-4">
            <p className="text-sm text-ink-500">{tile.label}</p>
            <p className="mt-2 font-display text-4xl text-ink-950">{tile.value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl text-ink-950">Your assigned tasks</h2>
          <Link href="/tasks" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {data.myTasks.length === 0 ? (
          <p className="text-ink-500">No tasks assigned to you yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100 border-y border-ink-100">
            {data.myTasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-ink-900">{task.title}</p>
                  <p className="text-sm text-ink-500">{task.project.name}</p>
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

      <section>
        <h2 className="font-display text-2xl text-ink-950">Active permissions</h2>
        <p className="mt-1 text-sm text-ink-500">Resolved from the shared RBAC catalog.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.permissions.map((p) => (
            <Badge key={p} tone="accent">
              {p}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
