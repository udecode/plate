import {
  AlignPlugin,
  AutoformatPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  ColumnPlugin,
  CommentsPlugin,
  DeletePlugin,
  DeserializeDocxPlugin,
  DeserializeMdPlugin,
  ExitBreakPlugin,
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
  HEADING_KEYS,
  HeadingPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ImagePlugin,
  IndentListPlugin,
  IndentPlugin,
  ItalicPlugin,
  KbdPlugin,
  LineHeightPlugin,
  LinkPlugin,
  ListPlugin,
  MediaEmbedPlugin,
  MentionPlugin,
  NodeIdPlugin,
  NormalizeTypesPlugin,
  ParagraphPlugin,
  SelectOnBackspacePlugin,
  SingleLinePlugin,
  SlashPlugin,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TabbablePlugin,
  TablePlugin,
  TodoListPlugin,
  TogglePlugin,
  TrailingBlockPlugin,
  UnderlinePlugin,
  createSlateEditor,
} from '@udecode/plate';
import { CaptionPlugin } from '@udecode/plate-caption';
import { EmojiPlugin } from '@udecode/plate-emoji';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw';
import { JuicePlugin } from '@udecode/plate-juice';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import { serializeMd } from '@udecode/plate-serializer-md';
import remarkGfm from 'remark-gfm';

import { Code } from '@/components/code';
import { DocPageLayout } from '@/components/doc-page-layout';
import { Link } from '@/components/link';
import { MemoizedReactMarkdown } from '@/components/markdown';
import { H2, H3, P } from '@/components/typography';
import { CodeBlock } from '@/components/ui/codeblock';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';

export default function RSCPage() {
  const mockDoc = {
    description: 'Use Plate in server environment',
    title: 'Server-Side',
    // ... other necessary properties
  };

  const editor = createSlateEditor({
    plugins: [
      HeadingPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      HorizontalRulePlugin,
      LinkPlugin,
      ListPlugin,
      ImagePlugin,
      MediaEmbedPlugin,
      CaptionPlugin.configure({
        options: {
          pluginKeys: [ImagePlugin.key, MediaEmbedPlugin.key],
        },
      }),
      MentionPlugin,
      SlashPlugin,
      TablePlugin,
      TodoListPlugin,
      TogglePlugin,
      ExcalidrawPlugin,

      // Marks
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      SubscriptPlugin,
      SuperscriptPlugin,
      FontColorPlugin,
      FontBackgroundColorPlugin,
      FontSizePlugin,
      HighlightPlugin,
      KbdPlugin,

      // Block Style
      AlignPlugin.extend({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            MediaEmbedPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            ImagePlugin.key,
            HEADING_KEYS.h6,
          ],
        },
      }),
      IndentPlugin.extend({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            HEADING_KEYS.h6,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
          ],
        },
      }),
      IndentListPlugin.extend({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            HEADING_KEYS.h4,
            HEADING_KEYS.h5,
            HEADING_KEYS.h6,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
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
      LineHeightPlugin.extend({
        inject: {
          props: {
            defaultNodeValue: 1.5,
            validNodeValues: [1, 1.2, 1.5, 2, 3],
          },
          targetPlugins: [
            ParagraphPlugin.key,
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
      AutoformatPlugin,
      EmojiPlugin,
      ExitBreakPlugin,
      NodeIdPlugin,
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
        },
      }),
      ResetNodePlugin,
      SelectOnBackspacePlugin.configure({
        options: {
          query: {
            allow: [ImagePlugin.key, HorizontalRulePlugin.key],
          },
        },
      }),
      DeletePlugin,
      SingleLinePlugin,
      SoftBreakPlugin,
      TabbablePlugin,
      TrailingBlockPlugin.configure({ type: ParagraphPlugin.key }),

      // Collaboration
      CommentsPlugin,

      // Deserialization
      DeserializeDocxPlugin,
      DeserializeMdPlugin,
      JuicePlugin,
      ColumnPlugin,
    ],
    value: [...basicElementsValue, ...basicMarksValue],
  });

  const md = serializeMd(editor, {
    nodes: {
      code_block: {
        serialize: (_, node) => {
          const codeLines = node.children
            .filter((child) => child.type === 'code_line')
            .map((child) => child.children.map((c) => c.text).join(''))
            .join('\n');

          return `\`\`\`${node.lang || ''}\n${codeLines}\n\`\`\``;
        },
      },
    },
  });

  return (
    <DocPageLayout doc={mockDoc} isUI={false} toc={[]}>
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
        <Link href="/docs/serializing-md">
          generating Markdown from a Slate value
        </Link>{' '}
        within a React Server Component:
      </P>

      <MemoizedReactMarkdown
        className="prose max-w-none break-words rounded-sm border p-4 py-6 prose-p:leading-relaxed prose-pre:p-0"
        components={{
          code({ children, className, node, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            return match ? (
              <CodeBlock
                key={Math.random()}
                language={match?.[1] || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {md}
      </MemoizedReactMarkdown>
    </DocPageLayout>
  );
}
