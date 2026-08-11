export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-100 border-t-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <h3 className="font-display text-2xl text-ink-900">{title}</h3>
      {description ? <p className="max-w-md text-ink-500">{description}</p> : null}
      {action}
    </div>
  );
}

export function Alert({ message, tone = 'danger' }: { message: string; tone?: 'danger' | 'info' }) {
  const styles =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-sky-200 bg-sky-50 text-sky-900';
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{message}</div>;
}
