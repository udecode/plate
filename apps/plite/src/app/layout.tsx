import '../../../www/src/app/(app)/examples/plite/plite-example-styles.css';
import './plite-host.css';
import type { ReactNode } from 'react';

import '../../../www/src/app/globals.css';

import { Providers } from './providers';

export const metadata = {
  title: 'Plite',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
