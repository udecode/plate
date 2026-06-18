import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (process.env.PLATE_WWW_SLATE === '1') {
    const { SlateShell } = await import('@/components/slate-shell');

    return <SlateShell>{children}</SlateShell>;
  }

  const { AppShell } = await import('@/components/app-shell');

  return <AppShell>{children}</AppShell>;
}
