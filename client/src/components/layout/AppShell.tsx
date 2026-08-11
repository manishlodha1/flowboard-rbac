'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/rbac';
import { Spinner } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/dashboard', label: 'Overview', permission: null },
  { href: '/projects', label: 'Projects', permission: 'projects:read' },
  { href: '/tasks', label: 'Tasks', permission: 'tasks:read' },
  { href: '/users', label: 'Users', permission: 'users:read' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <Spinner label="Checking session…" />;

  const links = NAV.filter((item) => !item.permission || can(item.permission));

  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6">
        <aside className="flex w-full flex-col justify-between rounded-2xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur md:w-64 md:shrink-0">
          <div>
            <Link href="/dashboard" className="font-display text-3xl tracking-tight text-ink-950">
              FlowBoard
            </Link>
            <p className="mt-1 text-sm text-ink-500">Role-aware project workspace</p>

            <nav className="mt-8 space-y-1">
              {links.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-ink-900 text-white'
                        : 'text-ink-700 hover:bg-sand-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 border-t border-ink-100 pt-4">
            <p className="font-medium text-ink-900">{user.name}</p>
            <p className="text-sm text-ink-500">{ROLE_LABELS[user.role]}</p>
            <Button variant="ghost" size="sm" className="mt-3 px-0" onClick={logout}>
              Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
