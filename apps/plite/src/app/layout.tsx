import '../../../www/src/app/(app)/examples/plite/plite-example-styles.css';
import './plite-host.css';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';

import '../../../www/src/app/globals.css';

export const metadata = {
  title: 'Plite',
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
