'use client';

import dynamic from 'next/dynamic';

const DocumentMigrationDemo = dynamic(
  () => import('@/registry/examples/document-migration-demo'),
  { ssr: false }
);

export default function DocumentMigrationPage() {
  return <DocumentMigrationDemo />;
}
