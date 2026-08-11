import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh">
      <div className="pointer-events-none absolute inset-0 grid-fade" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <p className="font-display text-3xl text-ink-950">FlowBoard</p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-8 py-16 md:max-w-3xl">
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink-950 md:text-7xl">
            FlowBoard
          </h1>
          <p className="max-w-xl text-lg text-ink-700 md:text-xl">
            A project workspace where Admin, Manager, and Member roles unlock different
            permissions — authentication, protected routes, and scoped CRUD in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Use demo credentials
              </Button>
            </Link>
          </div>
        </section>

        <footer className="border-t border-ink-100/80 py-6 text-sm text-ink-500">
          Full-stack RBAC assessment · Next.js · Express · Prisma · PostgreSQL
        </footer>
      </div>
    </div>
  );
}
