import type { Metadata } from 'next';

import { serializeMarkdown } from 'platejs/markdown';

import {
  type DocContentDoc,
  DocContent,
} from '@/app/(app)/docs/[[...slug]]/doc-content';
import { Code } from '@/components/code';
import { Link } from '@/components/link';
import { Markdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { detailsValue } from '@/registry/examples/values/details-value';

const title = 'Server-Side Example';
const description = 'Server-side rendering example for Plate.';

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function RSCPage() {
  const mockDoc: DocContentDoc = {
    description: 'Server-side rendering.',
    title: 'Server-Side',
    // name: 'server-side',
    // ... other necessary properties
  };

  const markdown = serializeMarkdown(
    { children: [...basicBlocksValue, ...basicMarksValue, ...detailsValue] },
    { plugins: BaseEditorKit }
  );

  if (!markdown.ok) throw new Error(markdown.diagnostics[0].message);
  const md = markdown.data;

  return (
    <DocContent category="example" doc={mockDoc} toc={[]}>
      <H2>Using Plate in a Server Environment</H2>
      <P>
        Plate can be utilized in server-side environments, enabling operations
        like content manipulation without a browser. This is particularly useful
        for scenarios such as generating static content, processing editor
        content on the server, or working with React Server Components.
      </P>

      <H3>Converting Documents on the Server</H3>
      <P>
        Format functions such as <Code>serializeMarkdown</Code> convert a
        document with your plugin list and need no DOM or editor instance. Use{' '}
        <Code>createEditor</Code> on the server only when you transform the
        document itself.
      </P>

      <H3>Example: Generating Markdown in a React Server Component</H3>
      <P className="mb-8">
        Here's the output of Plate{' '}
        <Link href={{ pathname: '/docs/markdown' }}>
          generating Markdown from a Plate value
        </Link>{' '}
        within a React Server Component:
      </P>

      <Markdown className="rounded-sm border p-4 py-6">{md}</Markdown>
    </DocContent>
  );
}
