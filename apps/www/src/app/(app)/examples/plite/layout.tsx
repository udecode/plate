import './plite-example-styles.css';

import { PreviewDevOverlayStyles } from '@/components/preview-dev-overlay-styles';

export default function PliteExamplesLayout({
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
