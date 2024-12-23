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
import { basicElementsValue } from '@/registry/default/example/values/en/basic-elements-value';
import { basicMarksValue } from '@/registry/default/example/values/en/basic-marks-value';
import { getI18nContent } from '@/utils/getI18nConent';

const i18n = {
  cn: {
    creatingDesc: '要在服务器上使用 Plate，你可以使用 ',
    creatingDesc2:
      ' 函数。这允许你在没有 DOM 环境的情况下创建和操作 Slate 文档。',
    creatingTitle: '创建服务器端编辑器',
    description:
      'Plate 可以在服务器端环境中使用，实现无需浏览器的内容操作。这对于生成静态内容、在服务器上处理编辑器内容或使用 React Server Components 等场景特别有用。',
    exampleDesc: '这是 Plate 在 React Server Component 中',
    exampleDesc2: '从 Slate 值生成 Markdown',
    exampleDesc3: '的输出：',
    exampleTitle: '示例：在 React Server Component 中生成 Markdown',
    title: '在服务器环境中使用 Plate',
  },
  en: {
    creatingDesc: 'To use Plate on the server, you can leverage the ',
    creatingDesc2:
      ' function. This allows you to create and manipulate Slate documents without a DOM environment.',
    creatingTitle: 'Creating a Server-Side Editor',
    description:
      'Plate can be utilized in server-side environments, enabling operations like content manipulation without a browser. This is particularly useful for scenarios such as generating static content, processing editor content on the server, or working with React Server Components.',
    exampleDesc: "Here's the output of Plate ",
    exampleDesc2: 'generating Markdown from a Slate value',
    exampleDesc3: ' within a React Server Component:',
    exampleTitle: 'Example: Generating Markdown in a React Server Component',
    title: 'Using Plate in a Server Environment',
  },
};

export default function RSCPage() {
  const content = getI18nContent(i18n);
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
      <H2>{content.title}</H2>
      <P>{content.description}</P>

      <H3>{content.creatingTitle}</H3>
      <P>
        {content.creatingDesc}
        <Code>createSlateEditor</Code>
        {content.creatingDesc2}
      </P>

      <H3>{content.exampleTitle}</H3>
      <P className="mb-8">
        {content.exampleDesc}
        <Link href="/docs/markdown">{content.exampleDesc2}</Link>
        {content.exampleDesc3}
      </P>

      <Markdown className="rounded-sm border p-4 py-6">{md}</Markdown>
    </DocContent>
  );
}
