'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { installBrowserHandle } from 'plitejs/react';
import type { ReactNode } from 'react';

// The browser suites run against this app's production export.
installBrowserHandle();

export function Providers({ children }: { children: ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
