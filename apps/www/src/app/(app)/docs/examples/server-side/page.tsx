import type { Doc } from 'contentlayer/generated';

import type { Metadata } from 'next';

import {
  BaseExitBreakPlugin,
  BaseResetNodePlugin,
  BaseSoftBreakPlugin,
  createSlateEditor,
  DeletePlugin,
  KEYS,
  SelectOnBackspacePlugin,
  TrailingBlockPlugin,
} from '@udecode/plate';
import { BaseAutoformatPlugin } from '@udecode/plate-autoformat';
import { DocxPlugin } from '@udecode/plate-docx';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { Code } from '@/components/code';
import { Link } from '@/components/link';
import { Markdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';

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
  const mockDoc: Partial<Doc> = {
    description: 'Server-side rendering.',
    title: 'Server-Side',
    // name: 'server-side',
    // ... other necessary properties
  };

  const editor = createSlateEditor({
    plugins: [
      ...BaseEditorKit,

      // Functionality
      BaseAutoformatPlugin,
      BaseExitBreakPlugin,
      BaseResetNodePlugin,
      SelectOnBackspacePlugin.configure({
        options: {
          query: {
            allow: [KEYS.img, KEYS.hr],
          },
        },
      }),
      DeletePlugin,
      BaseSoftBreakPlugin,
      TrailingBlockPlugin,
      DocxPlugin,
    ],
    value: [...basicBlocksValue, ...basicMarksValue],
  });

  const md = editor.api.markdown.serialize();

  return (
    <DocContent category="example" doc={mockDoc} toc={{}}>
      <H2>Using Plate in a Server Environment</H2>
      <P>
        Plate can be utilized in server-side environments, enabling operations
        like content manipulation without a browser. This is particularly useful
        for scenarios such as generating static content, processing editor
        content on the server, or working with React Server Components.
      </P>

      <H3>Creating a Server-Side Editor</H3>
      <P>
        To use Plate on the server, you can leverage the{' '}
        <Code>createSlateEditor</Code>
        function. This allows you to create and manipulate Slate documents
        without a DOM environment.
      </P>

      <H3>Example: Generating Markdown in a React Server Component</H3>
      <P className="mb-8">
        Here's the output of Plate{' '}
        <Link href="/docs/markdown">
          generating Markdown from a Slate value
        </Link>{' '}
        within a React Server Component:
      </P>

      <Markdown className="rounded-sm border p-4 py-6">{md}</Markdown>
    </DocContent>
  );
}
