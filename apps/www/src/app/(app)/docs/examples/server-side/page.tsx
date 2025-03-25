import type { Metadata } from 'next';

import { BaseParagraphPlugin, createSlateEditor } from '@udecode/plate';
import { BaseAlignPlugin } from '@udecode/plate-alignment';
import { BaseAutoformatPlugin } from '@udecode/plate-autoformat';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  BaseExitBreakPlugin,
  BaseSingleLinePlugin,
  BaseSoftBreakPlugin,
} from '@udecode/plate-break';
import { BaseCaptionPlugin } from '@udecode/plate-caption';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseCommentsPlugin } from '@udecode/plate-comments';
import { DocxPlugin } from '@udecode/plate-docx';
import { BaseEmojiPlugin } from '@udecode/plate-emoji';
import { BaseExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import { BaseHeadingPlugin, HEADING_KEYS } from '@udecode/plate-heading';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { JuicePlugin } from '@udecode/plate-juice';
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-line-height';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseListPlugin, BaseTodoListPlugin } from '@udecode/plate-list';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BaseImagePlugin, BaseMediaEmbedPlugin } from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { BaseResetNodePlugin } from '@udecode/plate-reset-node';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BaseSlashPlugin } from '@udecode/plate-slash-command';
import { BaseTabbablePlugin } from '@udecode/plate-tabbable';
import { BaseTablePlugin } from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { Code } from '@/components/code';
import { Link } from '@/components/link';
import { Markdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { basicElementsValue } from '@/registry/default/examples/values/basic-elements-value';
import { basicMarksValue } from '@/registry/default/examples/values/basic-marks-value';

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
  const mockDoc = {
    description: 'Server-side rendering.',
    title: 'Server-Side',
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
          plugins: [BaseImagePlugin, BaseMediaEmbedPlugin],
        },
      }),
      BaseMentionPlugin,
      BaseSlashPlugin,
      BaseTablePlugin,
      BaseTodoListPlugin,
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
          targetPlugins: [
            BaseParagraphPlugin.key,
            BaseMediaEmbedPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            BaseImagePlugin.key,
            HEADING_KEYS.h6,
          ],
        },
      }),
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            HEADING_KEYS.h6,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
            BaseTogglePlugin.key,
          ],
        },
      }),
      BaseIndentListPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            HEADING_KEYS.h6,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
            BaseTogglePlugin.key,
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
          targetPlugins: [
            BaseParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            HEADING_KEYS.h6,
          ],
        },
      }),

      // Functionality
      BaseAutoformatPlugin,
      BaseEmojiPlugin,
      BaseExitBreakPlugin,
      NodeIdPlugin,
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
        },
      }),
      BaseResetNodePlugin,
      SelectOnBackspacePlugin.configure({
        options: {
          query: {
            allow: [BaseImagePlugin.key, BaseHorizontalRulePlugin.key],
          },
        },
      }),
      DeletePlugin,
      BaseSingleLinePlugin,
      BaseSoftBreakPlugin,
      BaseTabbablePlugin,
      TrailingBlockPlugin,

      // Collaboration
      BaseCommentsPlugin,

      // Deserialization
      DocxPlugin,
      MarkdownPlugin.configure({
        options: {
          remarkPlugins: [remarkMath, remarkGfm],
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
