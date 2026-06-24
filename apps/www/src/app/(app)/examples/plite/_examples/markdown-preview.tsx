import { cva } from 'class-variance-authority';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import type { ReactNode } from 'react';
import { type Descendant, NodeApi } from '@platejs/plite';
import {
  Editable,
  Plite,
  type PliteRangeDecoration,
  usePliteEditor,
  usePliteRangeDecorationSource,
} from '@platejs/plite-react';
import { cn } from '@/utils/cn';

const markdownSegmentVariants = cva('plite-markdown-preview-segment', {
  variants: {
    blockquote: {
      false: null,
      true: 'is-blockquote',
    },
    bold: {
      false: null,
      true: 'is-bold',
    },
    code: {
      false: null,
      true: 'is-code',
    },
    hr: {
      false: null,
      true: 'is-hr',
    },
    italic: {
      false: null,
      true: 'is-italic',
    },
    list: {
      false: null,
      true: 'is-list',
    },
    title: {
      false: null,
      true: 'is-title',
    },
    underlined: {
      false: null,
      true: 'is-underlined',
    },
  },
});

const MarkdownPreviewExample = () => {
  const editor = usePliteEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Plite is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: '## Try it out!' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  });
  const markdownSource = usePliteRangeDecorationSource<Record<string, true>>(
    editor,
    {
      id: 'markdown-preview',
      dirtiness: 'text',
      read: ({ snapshot }) => collectMarkdownRanges(snapshot.children),
    }
  );

  return (
    <Plite decorationSources={[markdownSource]} editor={editor}>
      <Editable
        id="markdown-preview"
        placeholder="Write some markdown..."
        renderSegment={(segment, children) => (
          <MarkdownSegment
            data={Object.assign(
              {},
              ...segment.slices.map((slice) => slice.data ?? {})
            )}
          >
            {children}
          </MarkdownSegment>
        )}
      />
    </Plite>
  );
};

const getTokenLength = (token: string | Prism.Token): number => {
  if (typeof token === 'string') {
    return token.length;
  }
  if (typeof token.content === 'string') {
    return token.content.length;
  }
  return (token.content as Prism.Token[]).reduce(
    (length, child) => length + getTokenLength(child),
    0
  );
};

const collectMarkdownRanges = (
  nodes: readonly Descendant[],
  path: number[] = []
): PliteRangeDecoration<Record<string, true>>[] => {
  const ranges: PliteRangeDecoration<Record<string, true>>[] = [];

  nodes.forEach((node, nodeIndex) => {
    const nodePath = [...path, nodeIndex];

    if (NodeApi.isText(node)) {
      const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
      let start = 0;

      for (const token of tokens) {
        const length = getTokenLength(token);
        const end = start + length;

        if (typeof token !== 'string') {
          ranges.push({
            data: { [token.type]: true },
            key: `markdown:${nodePath.join('.')}:${start}:${end}`,
            range: {
              anchor: { path: nodePath, offset: start },
              focus: { path: nodePath, offset: end },
            },
          });
        }

        start = end;
      }
    }

    if (NodeApi.isElement(node)) {
      ranges.push(...collectMarkdownRanges(node.children, nodePath));
    }
  });

  return ranges;
};

const MarkdownSegment = ({
  children,
  data,
}: {
  children: ReactNode;
  data: Record<string, unknown>;
}) => {
  const has = (key: string) => Boolean(data[key]);

  return (
    <span
      className={cn(
        markdownSegmentVariants({
          blockquote: has('blockquote'),
          bold: has('bold'),
          code: has('code'),
          hr: has('hr'),
          italic: has('italic'),
          list: has('list'),
          title: has('title'),
          underlined: has('underlined'),
        })
      )}
    >
      {children}
    </span>
  );
};

export default MarkdownPreviewExample;
