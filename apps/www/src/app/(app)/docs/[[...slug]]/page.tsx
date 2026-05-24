import type { Metadata } from 'next';

import {
  type DocPageProps,
  generateDocMetadata,
  generateDocStaticParams,
  renderDocPage,
} from '@/app/(app)/docs/[[...slug]]/doc-page';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return generateDocStaticParams('en');
}

export function generateMetadata(props: DocPageProps): Promise<Metadata> {
  return generateDocMetadata(props, 'en');
}

export default function DocPage(props: DocPageProps) {
  return renderDocPage(props, 'en');
}
