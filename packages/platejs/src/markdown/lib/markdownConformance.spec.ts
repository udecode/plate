import { BaseCodeDrawingPlugin } from '../../code-drawing';
import {
  type Descendant,
  type Element,
  ElementApi,
  PLUGINS,
  TextApi,
} from '../../core';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../../features/basic-styles';
import { createTestEditor } from './__tests__/createTestEditor';

/**
 * Round-trip conformance for the first-party Markdown mappings. Each fixture
 * serializes, parses back and compares every non-metadata property the
 * original carries: a property that does not survive must be reported as
 * omitted, and a reported property must not survive. List numbering compares
 * by ordinal, because a start number may read back as `listStart` or
 * `listRestart` with the same meaning.
 */
const editor = createTestEditor([
  BaseCodeDrawingPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin.configure({
    targetPlugins: [
      PLUGINS.heading,
      PLUGINS.paragraph,
      PLUGINS.image,
      PLUGINS.mediaEmbed,
      PLUGINS.audio,
      PLUGINS.video,
    ],
  }),
]);

const ORDINAL_KEYS = new Set(['listRestart', 'listStart']);

const paragraph = (...children: Descendant[]) => ({
  children,
  type: 'paragraph',
});

const fixtures: Record<string, Descendant[]> = {
  'aligned paragraph': [
    { children: [{ text: 'x' }], textAlign: 'center', type: 'paragraph' },
  ],
  'aligned image': [
    {
      children: [{ text: '' }],
      textAlign: 'center',
      type: 'image',
      url: '/a.png',
    },
  ],
  audio: [
    {
      children: [{ text: '' }],
      textAlign: 'center',
      type: 'audio',
      url: '/a.mp3',
      width: '80%',
    },
  ],
  blockquote: [{ children: [paragraph({ text: 'q' })], type: 'blockquote' }],
  'bold italic code': [
    paragraph({ bold: true, code: true, italic: true, text: 'x' }),
  ],
  callout: [
    {
      backgroundColor: 'red',
      children: [{ text: 'c' }],
      icon: '🔥',
      type: 'callout',
      variant: 'info',
    },
  ],
  'code block': [
    { children: [{ text: 'const a = 1;' }], language: 'ts', type: 'codeBlock' },
  ],
  'code drawing': [
    {
      children: [{ text: '' }],
      code: 'graph TD;\n  A-->"B"',
      language: 'mermaid',
      type: 'codeDrawing',
      view: 'split',
    },
  ],
  columns: [
    {
      children: [
        { children: [paragraph({ text: 'a' })], type: 'column', width: '40%' },
        { children: [paragraph({ text: 'b' })], type: 'column', width: '60%' },
      ],
      type: 'columnGroup',
    },
  ],
  date: [
    paragraph(
      { text: '' },
      { children: [{ text: '' }], type: 'date', value: '2026-09-28' },
      { text: '' }
    ),
  ],
  details: [
    {
      children: [
        { children: [{ text: 'Title' }], type: 'summary' },
        paragraph({ text: 'Body' }),
      ],
      type: 'details',
    },
  ],
  equations: [
    { children: [{ text: '' }], latex: 'x^2', type: 'equation' },
    paragraph(
      { text: '' },
      { children: [{ text: '' }], latex: 'y', type: 'inlineEquation' },
      { text: '' }
    ),
  ],
  file: [
    {
      children: [{ text: '' }],
      name: 'a.pdf',
      type: 'file',
      url: '/a.pdf',
    },
  ],
  footnotes: [
    paragraph(
      { text: 'a' },
      { children: [{ text: '' }], ref: '1', type: 'footnoteReference' },
      { text: '' }
    ),
    {
      children: [paragraph({ text: 'note' })],
      ref: '1',
      type: 'footnoteDefinition',
    },
  ],
  headings: [1, 2, 3, 4, 5, 6].map((level) => ({
    children: [{ text: `h${level}` }],
    level,
    type: 'heading',
  })),
  'aligned heading': [
    {
      children: [{ text: 'h' }],
      level: 2,
      textAlign: 'right',
      type: 'heading',
    },
  ],
  'horizontal rule': [
    paragraph({ text: 'a' }),
    { children: [{ text: '' }], type: 'horizontalRule' },
    paragraph({ text: 'b' }),
  ],
  'image with caption': [
    {
      alt: 'A',
      children: [{ text: 'Caption' }],
      type: 'image',
      url: '/a.png',
    },
  ],
  'image native': [
    {
      alt: 'A',
      children: [{ text: '' }],
      title: 'T',
      type: 'image',
      url: '/a.png',
    },
  ],
  'image sized': [
    {
      alt: 'A',
      children: [{ text: '' }],
      naturalHeight: 180,
      naturalWidth: 320,
      type: 'image',
      url: '/a.png',
      width: 320,
    },
  ],
  'image in a list': [
    {
      alt: 'A',
      children: [{ text: '' }],
      indent: 1,
      listType: 'bulleted',
      type: 'image',
      url: '/a.png',
    },
  ],
  'line height': [
    { children: [{ text: 'x' }], lineHeight: 2, type: 'paragraph' },
  ],
  link: [
    paragraph(
      { text: '' },
      {
        children: [{ text: 'site' }],
        target: '_blank',
        type: 'link',
        url: 'https://example.com',
      },
      { text: '' }
    ),
  ],
  'list nesting': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    },
    {
      children: [{ text: 'b' }],
      indent: 2,
      listType: 'bulleted',
      type: 'paragraph',
    },
    {
      children: [{ text: 'c' }],
      indent: 3,
      listType: 'bulleted',
      type: 'paragraph',
    },
    {
      children: [{ text: 'd' }],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    },
  ],
  'list skipped depth': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    },
    {
      children: [{ text: 'c' }],
      indent: 3,
      listType: 'bulleted',
      type: 'paragraph',
    },
  ],
  'list start and restart': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listStart: 3,
      listType: 'numbered',
      type: 'paragraph',
    },
    {
      children: [{ text: 'b' }],
      indent: 1,
      listType: 'numbered',
      type: 'paragraph',
    },
    {
      children: [{ text: 'c' }],
      indent: 1,
      listRestart: 1,
      listType: 'numbered',
      type: 'paragraph',
    },
  ],
  'list style': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listStyle: 'upper-roman',
      listType: 'numbered',
      type: 'paragraph',
    },
  ],
  'list tasks': [
    {
      checked: true,
      children: [{ text: 'done' }],
      indent: 1,
      listType: 'task',
      type: 'paragraph',
    },
    {
      checked: false,
      children: [{ text: 'todo' }],
      indent: 1,
      listType: 'task',
      type: 'paragraph',
    },
  ],
  marks: [
    paragraph({ strikethrough: true, text: 's' }),
    paragraph({ text: 'u', underline: true }),
    paragraph({ highlight: true, text: 'h' }),
    paragraph({ kbd: true, text: 'k' }),
    paragraph({ script: 'sub', text: 'b' }),
    paragraph({ script: 'sup', text: 'p' }),
    paragraph({ color: 'red', text: 'c' }),
    paragraph({ backgroundColor: 'yellow', text: 'g' }),
    paragraph({ fontFamily: 'serif', text: 'f' }),
    paragraph({ fontSize: '20px', text: 'z' }),
    paragraph({ fontWeight: '600', text: 'w' }),
  ],
  'media embed': [
    {
      children: [{ text: '' }],
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=x',
      type: 'mediaEmbed',
      url: 'https://www.youtube.com/embed/x',
    },
  ],
  mentions: [
    paragraph(
      { text: '' },
      { children: [{ text: '' }], label: 'Ada', ref: 'ada', type: 'mention' },
      { text: ' ' },
      { children: [{ text: '' }], ref: 'bob', type: 'mention' },
      { text: '' }
    ),
  ],
  table: [
    {
      children: [
        {
          children: [
            {
              children: [paragraph({ text: 'h1' })],
              header: true,
              type: 'tableCell',
            },
            {
              children: [paragraph({ text: 'h2' })],
              header: true,
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              backgroundColor: 'red',
              children: [paragraph({ text: 'a' })],
              type: 'tableCell',
            },
            { children: [paragraph({ text: 'b' })], type: 'tableCell' },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
  ],
  toc: [{ children: [{ text: '' }], type: 'toc' }],
  video: [
    {
      children: [{ text: 'Caption' }],
      type: 'video',
      url: '/a.mp4',
      width: 640,
    },
  ],
};

const valueOf = (
  node: Readonly<Record<string, unknown>> | undefined,
  key: string,
  descriptor: Readonly<{ default?: unknown }>
) => node?.[key] ?? descriptor.default;

const same = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const ordinals = (children: readonly Descendant[]) => {
  editor.update.value.replace({ children });

  return editor.read.value().children.map((node) =>
    ElementApi.isElement(node) && node.listType === 'numbered'
      ? (
          editor.read as unknown as Readonly<{
            list: Readonly<{ ordinal: (element: Element) => unknown }>;
          }>
        ).list.ordinal(node)
      : undefined
  );
};

const audit = (children: Descendant[]) => {
  const serialized = editor.api.markdown.serialize({
    document: { children },
    lossPolicy: 'allow',
  });

  if (!serialized.ok) {
    return [`serialize failed: ${serialized.diagnostics[0]?.message}`];
  }
  const reported = new Set(
    serialized.diagnostics.flatMap((diagnostic) =>
      diagnostic.code === 'markdown-property-omitted'
        ? [`${diagnostic.model?.path?.join(',')}:${diagnostic.key}`]
        : []
    )
  );
  const parsed = editor.api.markdown.parse(serialized.data, {
    lossPolicy: 'allow',
  });

  if (!parsed.ok) return [`parse failed: ${parsed.diagnostics[0]?.message}`];
  const problems: string[] = [];
  const compare = (
    original: Readonly<Record<string, unknown>>,
    decoded: Readonly<Record<string, unknown>> | undefined,
    path: string,
    placement: 'element' | 'text',
    type?: string
  ) => {
    for (const key of Object.keys(original)) {
      if (key === 'children' || key === 'type' || key === 'text') continue;
      const property = editor.read.schema.property(
        placement === 'text' ? { key, placement } : { key, placement, type }
      );

      if (!property || property.role === 'metadata' || ORDINAL_KEYS.has(key)) {
        continue;
      }
      const descriptor = property.value as Readonly<{ default?: unknown }>;
      const lost = !same(
        valueOf(original, key, descriptor),
        valueOf(decoded, key, descriptor)
      );
      const wasReported = reported.has(`${path}:${key}`);

      if (lost && !wasReported) {
        problems.push(
          `${path} ${key}: ${JSON.stringify(original[key])} read back as ${JSON.stringify(decoded?.[key])} without a report`
        );
      }
      if (!lost && wasReported) {
        problems.push(`${path} ${key}: reported but preserved`);
      }
    }
  };
  const walk = (
    original: readonly Descendant[],
    decoded: readonly Descendant[] | undefined,
    parent: readonly number[]
  ) =>
    original.forEach((node, index) => {
      const path = [...parent, index];
      const other = decoded?.[index];

      if (TextApi.isText(node)) {
        if (!other || !TextApi.isText(other) || other.text !== node.text) {
          problems.push(`${path.join(',')}: text changed`);
          return;
        }
        compare(node, other, path.join(','), 'text');
        return;
      }
      if (!other || !ElementApi.isElement(other) || other.type !== node.type) {
        problems.push(
          `${path.join(',')}: ${node.type} read back as ${ElementApi.isElement(other) ? other.type : 'nothing'}`
        );
        return;
      }
      compare(node, other, path.join(','), 'element', node.type);
      walk(node.children, other.children, path);
    });

  walk(children, parsed.document.children, []);

  const before = ordinals(children);
  const after = ordinals(parsed.document.children);

  before.forEach((ordinal, index) => {
    if (
      ordinal !== after[index] &&
      !reported.has(`${index}:listStart`) &&
      !reported.has(`${index}:listRestart`)
    ) {
      problems.push(
        `${index}: numbered ${String(ordinal)} read back as ${String(after[index])}`
      );
    }
  });

  return problems;
};

describe('Markdown round-trip conformance', () => {
  it.each(Object.entries(fixtures))('%s', (_name, children) => {
    expect(audit(children)).toEqual([]);
  });
});
