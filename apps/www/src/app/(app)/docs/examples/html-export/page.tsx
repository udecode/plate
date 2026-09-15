import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { BlockDisplay } from '@/components/block-display';
import { getDocsNavMeta } from '@/lib/docs-nav-metadata';

const navMeta = getDocsNavMeta('/docs/examples/html-export');
const doc = {
  ...navMeta,
  slug: '/docs/examples/html-export',
  title: navMeta?.title ?? 'HTML Export',
};

export default function HtmlExportPage() {
  return (
    <DocContent category="example" doc={doc} toc={[]}>
      <BlockDisplay
        item={{
          name: 'html-export',
          type: 'registry:example',
        }}
      />
    </DocContent>
  );
}
