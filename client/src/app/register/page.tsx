'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FormBuilder } from '@/components/ui/FormBuilder';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur">
        <p className="font-display text-3xl text-ink-950">FlowBoard</p>
        <h1 className="mt-2 text-xl font-semibold text-ink-900">Create account</h1>
        <p className="mt-1 text-sm text-ink-500">
          Public signup creates a Member role. Admins can promote users later.
        </p>

        <div className="mt-6">
          <FormBuilder
            submitLabel="Create account"
            fields={[
              { name: 'name', label: 'Full name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'password', label: 'Password', type: 'password', required: true },
            ]}
            onSubmit={async (values) => {
              await register(values.name, values.email, values.password);
              router.push('/dashboard');
            }}
          />
        </div>

        <p className="mt-6 text-sm text-ink-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
