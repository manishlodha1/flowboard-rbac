const tones: Record<string, string> = {
  neutral: 'bg-ink-100 text-ink-800',
  accent: 'bg-accent-soft text-accent-deep',
  warn: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
  success: 'bg-emerald-100 text-emerald-900',
  info: 'bg-sky-100 text-sky-900',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof tones {
  switch (status) {
    case 'ACTIVE':
    case 'DONE':
    case 'IN_PROGRESS':
      return 'accent';
    case 'PLANNING':
    case 'TODO':
    case 'REVIEW':
      return 'info';
    case 'ON_HOLD':
    case 'URGENT':
    case 'HIGH':
      return 'warn';
    case 'COMPLETED':
      return 'success';
    default:
      return 'neutral';
  }
}
