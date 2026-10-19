'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { createEditor } from 'plitejs';
import { installBrowserHandle } from 'plitejs/react';
import type { ReactNode } from 'react';

// The browser suites run against this app's production export.
installBrowserHandle();
// Specs build a remote peer's change in the page, because the managed runner
// builds no plitejs dist for the Playwright process to import.
Object.assign(globalThis, { createPeerEditor: createEditor });

export function Providers({ children }: { children: ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
