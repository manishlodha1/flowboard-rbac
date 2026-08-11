'use client';

import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/Feedback';

/** Hide UI sections the current role cannot access. */
export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      fallback ?? (
        <EmptyState
          title="Access restricted"
          description="Your role does not include permission for this area."
        />
      )
    );
  }
  return <>{children}</>;
}
