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
import { BaseAlignPlugin } from '@udecode/plate-alignment';
import { BaseAutoformatPlugin } from '@udecode/plate-autoformat';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-nodes';
import { BaseCaptionPlugin } from '@udecode/plate-caption';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseCommentPlugin } from '@udecode/plate-comments';
import { DocxPlugin } from '@udecode/plate-docx';
import { BaseEmojiPlugin } from '@udecode/plate-emoji';
import { BaseExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { JuicePlugin } from '@udecode/plate-juice';
import { BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-line-height';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseListPlugin } from '@udecode/plate-list';
import { MarkdownPlugin, remarkMdx } from '@udecode/plate-markdown';
import { BaseImagePlugin, BaseMediaEmbedPlugin } from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import { BaseSlashPlugin } from '@udecode/plate-slash-command';
import { BaseTabbablePlugin } from '@udecode/plate-tabbable';
import { BaseTablePlugin } from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { Code } from '@/components/code';
import { Link } from '@/components/link';
import { Markdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { basicElementsValue } from '@/registry/examples/values/basic-elements-value';
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
      BaseHeadingPlugin,
      BaseBlockquotePlugin,
      BaseCodeBlockPlugin,
      BaseHorizontalRulePlugin,
      BaseLinkPlugin,
      BaseListPlugin,
      BaseImagePlugin,
      BaseMediaEmbedPlugin,
      BaseCaptionPlugin.configure({
        options: {
          query: { allow: [KEYS.img, KEYS.mediaEmbed] },
        },
      }),
      BaseMentionPlugin,
      BaseSlashPlugin,
      BaseTablePlugin,
      BaseTogglePlugin,
      BaseExcalidrawPlugin,
      BaseColumnPlugin,

      // Marks
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseUnderlinePlugin,
      BaseStrikethroughPlugin,
      BaseCodePlugin,
      BaseSubscriptPlugin,
      BaseSuperscriptPlugin,
      BaseFontColorPlugin,
      BaseFontBackgroundColorPlugin,
      BaseFontSizePlugin,
      BaseHighlightPlugin,
      BaseKbdPlugin,

      // Block Style
      BaseAlignPlugin.extend({
        inject: {
          targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.mediaEmbed],
        },
      }),
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            KEYS.p,
            ...KEYS.heading,
            KEYS.blockquote,
            KEYS.codeBlock,
            KEYS.toggle,
          ],
        },
      }),
      BaseListPlugin.extend({
        inject: {
          targetPlugins: [
            KEYS.p,
            ...KEYS.heading,
            KEYS.blockquote,
            KEYS.codeBlock,
            KEYS.toggle,
          ],
        },
        options: {
          listStyleTypes: {
            fire: {
              type: 'fire',
            },
            todo: {
              type: 'todo',
            },
          },
        },
      }),
      BaseLineHeightPlugin.extend({
        inject: {
          nodeProps: {
            defaultNodeValue: 1.5,
            validNodeValues: [1, 1.2, 1.5, 2, 3],
          },
          targetPlugins: [KEYS.p, ...KEYS.heading],
        },
      }),

      // Functionality
      BaseAutoformatPlugin,
      BaseEmojiPlugin,
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
      BaseTabbablePlugin,
      TrailingBlockPlugin,

      // Collaboration
      BaseCommentPlugin,

      // Deserialization
      DocxPlugin,
      MarkdownPlugin.configure({
        options: {
          remarkPlugins: [remarkMath, remarkGfm, remarkMdx],
        },
      }),
      JuicePlugin,
    ],
    value: [...basicElementsValue, ...basicMarksValue],
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
