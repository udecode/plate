import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { BlockDisplay } from '@/components/block-display';
import { getDocsNavMeta } from '@/lib/docs-nav-metadata';

const navMeta = getDocsNavMeta('/docs/examples/slate-to-html');
const doc = {
  ...navMeta,
  slug: '/docs/examples/slate-to-html',
  title: navMeta?.title ?? 'Slate to HTML',
};

export default function SlateToHtmlPage() {
  return (
    <DocContent category="example" doc={doc} toc={[]}>
      <BlockDisplay
        item={{
          name: 'slate-to-html',
          type: 'registry:example',
        }}
      />
    </DocContent>
  );
}
