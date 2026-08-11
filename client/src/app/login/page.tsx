'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FormBuilder } from '@/components/ui/FormBuilder';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur">
        <p className="font-display text-3xl text-ink-950">FlowBoard</p>
        <h1 className="mt-2 text-xl font-semibold text-ink-900">Sign in</h1>
        <p className="mt-1 text-sm text-ink-500">
          Demo: admin@flowboard.dev / Password123!
        </p>

        <div className="mt-6">
          <FormBuilder
            submitLabel="Sign in"
            fields={[
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'password', label: 'Password', type: 'password', required: true },
            ]}
            onSubmit={async (values) => {
              await login(values.email, values.password);
              router.push('/dashboard');
            }}
          />
        </div>

        <p className="mt-6 text-sm text-ink-500">
          New here?{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Create a member account
          </Link>
        </p>
      </div>
    </div>
  );
}
