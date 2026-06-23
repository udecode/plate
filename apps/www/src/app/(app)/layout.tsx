import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (process.env.PLATE_WWW_PLITE === '1') {
    const { PliteShell } = await import('@/components/plite-shell');

    return <PliteShell>{children}</PliteShell>;
  }

  const { AppShell } = await import('@/components/app-shell');

  return <AppShell>{children}</AppShell>;
}
