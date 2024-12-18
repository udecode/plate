import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { BlockDisplay } from '@/components/block-display';
import { exampleNavMap } from '@/config/docs-examples';

export default function SlateToHtmlPage() {
  return (
    <DocContent
      category="example"
      doc={exampleNavMap['/docs/examples/slate-to-html']}
      toc={{}}
    >
      <BlockDisplay name="slate-to-html" />
    </DocContent>
  );
}
