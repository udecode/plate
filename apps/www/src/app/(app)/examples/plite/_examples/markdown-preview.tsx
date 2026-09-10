import { cva } from 'class-variance-authority';
import { NodeApi, type Path } from 'plitejs';
import {
  Editable,
  Plite,
  type PliteDecoration,
  type PliteDecorationSource,
  useEditor,
} from 'plitejs/react';
import { useMemo } from 'react';

import { Prism } from './utils/prism-runtime';

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
  const editor = useEditor({
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
  const markdownSource = useMemo<PliteDecorationSource<typeof editor>>(
    () => ({
      id: 'markdown-preview',
      read: ({ entry: [node, path] }) =>
        NodeApi.isText(node) ? collectMarkdownRanges(node.text, path) : [],
    }),
    []
  );

  return (
    <Plite decorations={[markdownSource]} editor={editor}>
      <Editable id="markdown-preview" placeholder="Write some markdown..." />
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

const markdownTokenClassNames: Record<string, string> = {
  blockquote: markdownSegmentVariants({ blockquote: true }),
  bold: markdownSegmentVariants({ bold: true }),
  code: markdownSegmentVariants({ code: true }),
  hr: markdownSegmentVariants({ hr: true }),
  italic: markdownSegmentVariants({ italic: true }),
  list: markdownSegmentVariants({ list: true }),
  title: markdownSegmentVariants({ title: true }),
  underlined: markdownSegmentVariants({ underlined: true }),
};

const collectMarkdownRanges = (text: string, path: Path): PliteDecoration[] => {
  const tokens = Prism.tokenize(text, Prism.languages.markdown);
  const ranges: PliteDecoration[] = [];
  let start = 0;

  for (const token of tokens) {
    const length = getTokenLength(token);
    const end = start + length;

    if (typeof token !== 'string') {
      ranges.push({
        attributes: {
          className:
            markdownTokenClassNames[token.type] ??
            'plite-markdown-preview-segment',
          'data-markdown-token': token.type,
        },
        key: `markdown:${path.join('.')}:${start}:${end}`,
        range: {
          anchor: { path, offset: start },
          focus: { path, offset: end },
        },
      });
    }

    start = end;
  }

  return ranges;
};

export default MarkdownPreviewExample;
