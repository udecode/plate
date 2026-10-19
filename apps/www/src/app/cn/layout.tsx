import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';

// Reuse the same layout as (app)
export default function CNLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
