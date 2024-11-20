import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { TElement } from '@udecode/plate-common';

import {
  BaseAlignPlugin,
  BaseAutoformatPlugin,
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin,
  BaseCodePlugin,
  BaseColumnPlugin,
  BaseCommentsPlugin,
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseImagePlugin,
  BaseIndentListPlugin,
  BaseIndentPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseLineHeightPlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseMediaEmbedPlugin,
  BaseMentionPlugin,
  BaseParagraphPlugin,
  BaseSingleLinePlugin,
  BaseSlashPlugin,
  BaseSoftBreakPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseTabbablePlugin,
  BaseTablePlugin,
  BaseTodoListPlugin,
  BaseTogglePlugin,
  BaseUnderlinePlugin,
  DeletePlugin,
  DocxPlugin,
  HEADING_KEYS,
  NodeIdPlugin,
  NormalizeTypesPlugin,
  SelectOnBackspacePlugin,
  TrailingBlockPlugin,
  createSlateEditor,
} from '@udecode/plate';
import { BaseExitBreakPlugin } from '@udecode/plate-break';
import { BaseCaptionPlugin } from '@udecode/plate-caption';
import { BaseEmojiPlugin } from '@udecode/plate-emoji';
import { BaseExcalidrawPlugin } from '@udecode/plate-excalidraw';
import { JuicePlugin } from '@udecode/plate-juice';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BaseResetNodePlugin } from '@udecode/plate-reset-node';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { Code } from '@/components/code';
import { Link } from '@/components/link';
import { Markdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { exampleNavMap } from '@/config/docs-examples';
import { basicElementsValue } from '@/registry/default/example/values/basic-elements-value';
import { basicMarksValue } from '@/registry/default/example/values/basic-marks-value';

export default function RSCPage() {
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
      TrailingBlockPlugin.configure({
        options: { type: BaseParagraphPlugin.key },
      }),

      // Collaboration
      BaseCommentsPlugin,

      // Deserialization
      DocxPlugin,
      MarkdownPlugin,
      JuicePlugin,
    ],
    value: [...basicElementsValue, ...basicMarksValue],
  });

  const md = editor.api.markdown.serialize({
    nodes: {
      code_block: {
        serialize: (_, node) => {
          const codeLines = node.children
            .filter((child) => (child as any).type === 'code_line')
            .map((child) =>
              (child as any).children.map((c: TElement) => c.text).join('')
            )
            .join('\n');

          return `\`\`\`${(node as any as TCodeBlockElement).lang || ''}\n${codeLines}\n\`\`\``;
        },
      },
    },
  });

  return (
    <DocContent
      category="example"
      doc={exampleNavMap['/docs/examples/server-side']}
      toc={{}}
    >
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
