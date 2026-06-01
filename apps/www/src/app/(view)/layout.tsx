import * as React from 'react';

import { PreviewDevOverlayStyles } from '@/components/preview-dev-overlay-styles';

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PreviewDevOverlayStyles />
    </>
  );
}
