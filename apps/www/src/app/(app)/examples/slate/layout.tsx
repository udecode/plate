import './slate-example-styles.css';

import { PreviewDevOverlayStyles } from '@/components/preview-dev-overlay-styles';

export default function SlateExamplesLayout({
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
