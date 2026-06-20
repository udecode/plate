import '../../../www/src/app/(app)/examples/slate/slate-example-styles.css';
import './slate-host.css';

import type { ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '../../../www/src/app/globals.css';

export const metadata = {
  title: 'Slate',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
