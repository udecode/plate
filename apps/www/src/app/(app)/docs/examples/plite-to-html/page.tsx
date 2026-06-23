import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { BlockDisplay } from '@/components/block-display';
import { getDocsNavMeta } from '@/lib/docs-nav-metadata';

const navMeta = getDocsNavMeta('/docs/examples/plite-to-html');
const doc = {
  ...navMeta,
  slug: '/docs/examples/plite-to-html',
  title: navMeta?.title ?? 'Plite to HTML',
};

export default function SlateToHtmlPage() {
  return (
    <DocContent category="example" doc={doc} toc={[]}>
      <BlockDisplay
        item={{
          name: 'plite-to-html',
          type: 'registry:example',
        }}
      />
    </DocContent>
  );
}
