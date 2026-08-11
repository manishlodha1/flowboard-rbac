'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Role, User } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/rbac';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback';
import { Input, Label, Select } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { RequirePermission } from '@/components/rbac/RequirePermission';
import { FormBuilder } from '@/components/ui/FormBuilder';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'MEMBER'];

export default function UsersPage() {
  return (
    <RequirePermission permission="users:read">
      <UsersAdmin />
    </RequirePermission>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api<User[]>('/users', {
        query: { page, limit: 10, search, role },
      });
      setUsers(res.data);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateRole(id: string, nextRole: Role) {
    await api(`/users/${id}`, { method: 'PATCH', body: { role: nextRole } });
    await load();
  }

  async function toggleActive(user: User) {
    await api(`/users/${user.id}`, {
      method: 'PATCH',
      body: { isActive: !user.isActive },
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Users</p>
          <h1 className="mt-2 font-display text-4xl text-ink-950">Directory & roles</h1>
          <p className="mt-2 text-ink-500">Admin-only area for account and role management.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel' : 'Create user'}
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </div>

      {showCreate ? (
        <div className="rounded-xl border border-ink-100 bg-sand-50 p-4">
          <FormBuilder
            submitLabel="Create user"
            fields={[
              { name: 'name', label: 'Name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'password', label: 'Password', type: 'password', required: true },
              {
                name: 'role',
                label: 'Role',
                type: 'select',
                required: true,
                defaultValue: 'MEMBER',
                options: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
              },
            ]}
            onSubmit={async (values) => {
              await api('/auth/users', {
                method: 'POST',
                body: values,
              });
              setShowCreate(false);
              setPage(1);
              await load();
            }}
          />
        </div>
      ) : null}

      {error ? <Alert message={error} /> : null}
      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <ul className="divide-y divide-ink-100 border-y border-ink-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-semibold text-ink-900">{u.name}</p>
                <p className="text-sm text-ink-500">{u.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={u.isActive ? 'success' : 'danger'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div>
                  <Label htmlFor={`role-${u.id}`}>Role</Label>
                  <Select
                    id={`role-${u.id}`}
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as Role)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button variant="secondary" size="sm" onClick={() => toggleActive(u)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
