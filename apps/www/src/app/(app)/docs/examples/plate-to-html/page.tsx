import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { BlockDisplay } from '@/components/block-display';
import { getDocsNavMeta } from '@/lib/docs-nav-metadata';

const navMeta = getDocsNavMeta('/docs/examples/plate-to-html');
const doc = {
  ...navMeta,
  slug: '/docs/examples/plate-to-html',
  title: navMeta?.title ?? 'Plate to HTML',
};

export default function PlateToHtmlPage() {
  return (
    <DocContent category="example" doc={doc} toc={[]}>
      <BlockDisplay
        item={{
          name: 'plate-to-html',
          type: 'registry:example',
        }}
      />
    </DocContent>
  );
}
