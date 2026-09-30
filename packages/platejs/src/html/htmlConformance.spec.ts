import { describe, expect, it } from 'bun:test';

import isEqual from 'lodash/isEqual.js';

import {
  BaseParagraphPlugin,
  createEditor,
  type Descendant,
  definePlugin,
  ElementApi,
  PLUGINS,
  property,
  schema,
  TextApi,
  type Value,
} from '../core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../features/basic-nodes';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../features/basic-styles';
import { BaseCodeBlockPlugin } from '../features/code-block';
import { BaseDetailsPlugin } from '../features/details';
import { BaseIndentPlugin } from '../features/indent';
import { BaseLinkPlugin } from '../features/link';
import { BaseListPlugin } from '../features/list';
import {
  BaseAudioPlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../features/media';
import { BaseMentionPlugin } from '../features/mention';
import { BaseTablePlugin } from '../features/table';
import { PLATE_HTML_ATTRIBUTES } from '../lib/plugins/html/HtmlPlugin';

/**
 * Round-trip conformance for the first-party HTML mappings. Each fixture
 * serializes, parses back and compares every non-metadata property the
 * original carries: a property that does not survive must be reported as
 * omitted, and a reported property must not survive. A claim that does not
 * survive is therefore a failure, and so is an emitted Plate attribute that
 * parsing does not read.
 */
const listTargets = [
  PLUGINS.heading,
  PLUGINS.paragraph,
  PLUGINS.blockquote,
  PLUGINS.codeBlock,
  PLUGINS.details,
  PLUGINS.image,
];

const plugins = [
  BaseParagraphPlugin,
  BaseAudioPlugin,
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin,
  BaseCodePlugin,
  BaseDetailsPlugin,
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseImagePlugin,
  BaseIndentPlugin.configure({ targetPlugins: listTargets }),
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseLineHeightPlugin,
  BaseLinkPlugin,
  BaseListPlugin.configure({ targetPlugins: listTargets }),
  BaseMediaEmbedPlugin,
  BaseMentionPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseTablePlugin,
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
  BaseTextIndentPlugin,
  BaseUnderlinePlugin,
  BaseVideoPlugin,
];

const paragraph = (...children: Descendant[]) => ({
  children,
  type: 'paragraph',
});

const cell = (text: string, properties: Record<string, unknown> = {}) => ({
  children: [paragraph({ text })],
  ...properties,
  type: 'tableCell',
});

const fixtures: Record<string, Value> = {
  'aligned paragraph': [
    { children: [{ text: 'x' }], textAlign: 'center', type: 'paragraph' },
  ],
  'aligned heading': [
    {
      children: [{ text: 'h' }],
      level: 2,
      textAlign: 'right',
      type: 'heading',
    },
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
  'code block': [
    { children: [{ text: 'const a = 1;' }], language: 'ts', type: 'codeBlock' },
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
  headings: [1, 2, 3, 4, 5, 6].map((level) => ({
    children: [{ text: `h${level}` }],
    level,
    type: 'heading',
  })),
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
  'image relative width': [
    {
      children: [{ text: '' }],
      type: 'image',
      url: '/a.png',
      width: '50%',
    },
  ],
  indent: [{ children: [{ text: 'x' }], indent: 2, type: 'paragraph' }],
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
  'link without target': [
    paragraph(
      { text: '' },
      {
        children: [{ text: 'site' }],
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
      indent: 1,
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
      width: 640,
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
            cell('h1', { header: true }),
            cell('h2', { header: true }),
          ],
          type: 'tableRow',
        },
        {
          children: [
            cell('a', {
              backgroundColor: 'red',
              borders: {
                bottom: { color: 'blue', style: 'dashed', width: 2 },
                left: { color: 'red', style: 'solid', width: 1 },
              },
            }),
            cell('b'),
          ],
          height: 40,
          type: 'tableRow',
        },
      ],
      columnWidths: [120, 80],
      marginLeft: 16,
      type: 'table',
    },
  ],
  'table spans': [
    {
      children: [
        {
          children: [cell('a', { colSpan: 2 }), cell('b', { rowSpan: 2 })],
          type: 'tableRow',
        },
        {
          children: [cell('c'), cell('d')],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
  ],
  'text indent': [
    { children: [{ text: 'x' }], textIndent: 1, type: 'paragraph' },
  ],
  video: [
    {
      children: [{ text: 'Caption' }],
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=x',
      type: 'video',
      url: '/a.mp4',
      width: 640,
    },
  ],
};

// Blocks other than paragraphs keep their list properties.
const listItemFixtures: Record<string, Value> = {
  'blockquote in a list': [
    {
      children: [paragraph({ text: 'q' })],
      indent: 1,
      listType: 'bulleted',
      type: 'blockquote',
    },
  ],
  'blocks in a numbered list': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listStart: 3,
      listType: 'numbered',
      type: 'paragraph',
    },
    {
      alt: 'A',
      children: [{ text: '' }],
      indent: 1,
      listType: 'numbered',
      type: 'image',
      url: '/a.png',
    },
    {
      children: [{ text: 'b' }],
      indent: 1,
      listType: 'numbered',
      type: 'codeBlock',
    },
  ],
  'code block in a list': [
    {
      children: [{ text: 'const a = 1;\n' }],
      indent: 2,
      language: 'ts',
      listType: 'bulleted',
      type: 'codeBlock',
    },
  ],
  'details in a task list': [
    {
      checked: true,
      children: [
        { children: [{ text: 'Title' }], type: 'summary' },
        paragraph({ text: 'Body' }),
      ],
      indent: 1,
      listType: 'task',
      type: 'details',
    },
  ],
  'heading in a list': [
    {
      children: [{ text: 'h' }],
      indent: 1,
      level: 2,
      listType: 'bulleted',
      type: 'heading',
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
};

type ConformanceEditor = ReturnType<typeof createEditor>;

const serialize = (editor: ConformanceEditor, children: Value) =>
  editor.api.html.serialize({ document: { children }, lossPolicy: 'allow' });

const audit = (
  editor: ConformanceEditor,
  children: Value
): Readonly<{ problems: string[]; reported: string[] }> => {
  const serialized = serialize(editor, children);

  if (!serialized.ok) {
    return {
      problems: [`serialize failed: ${serialized.diagnostics[0]?.message}`],
      reported: [],
    };
  }
  const reported = new Set(
    serialized.diagnostics.flatMap((diagnostic) =>
      diagnostic.code === 'html-unsupported-content' &&
      diagnostic.model?.property !== undefined
        ? [`${diagnostic.model.path?.join(',')}:${diagnostic.model.property}`]
        : []
    )
  );
  const parsed = editor.api.html.parse(serialized.data, {
    lossPolicy: 'allow',
  });

  if (!parsed.ok) {
    return {
      problems: [`parse failed: ${parsed.diagnostics[0]?.message}`],
      reported: [...reported],
    };
  }
  const problems: string[] = [];

  parsed.diagnostics.forEach((diagnostic) => {
    if (
      diagnostic.code === 'html-unsupported-content' &&
      diagnostic.kind === 'attribute' &&
      diagnostic.source?.kind === 'tree'
    ) {
      problems.push(
        `${diagnostic.source.path.join(',')} <${diagnostic.source.tag}> ${diagnostic.source.attribute}: emitted but not read`
      );
    }
  });
  const compare = (
    original: Readonly<Record<string, unknown>>,
    decoded: Readonly<Record<string, unknown>> | undefined,
    path: string,
    placement: 'element' | 'text',
    type?: string
  ) => {
    for (const key of Object.keys(original)) {
      if (key === 'children' || key === 'type' || key === 'text') continue;
      const schemaProperty = editor.read.schema.property(
        placement === 'text' ? { key, placement } : { key, placement, type }
      );

      if (!schemaProperty || schemaProperty.role === 'metadata') continue;
      const descriptor = schemaProperty.value as Readonly<{
        default?: unknown;
      }>;
      const lost = !isEqual(
        original[key] ?? descriptor.default,
        decoded?.[key] ?? descriptor.default
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

  return { problems, reported: [...reported] };
};

describe('HTML round-trip conformance', () => {
  const editor = createEditor({ plugins });

  it.each(Object.entries({ ...fixtures, ...listItemFixtures }))(
    '%s',
    (_name, children) => {
      expect(audit(editor, children)).toEqual({ problems: [], reported: [] });
    }
  );

  it.each(Object.entries(listItemFixtures))(
    '%s parses back to the same document',
    (_name, children) => {
      const serialized = serialize(editor, children);

      expect(
        serialized.ok &&
          editor.api.html.parse(serialized.data, { lossPolicy: 'allow' })
      ).toMatchObject({ document: { children }, ok: true });
    }
  );

  it('accounts exactly the data attributes the mappings emit', () => {
    const emitted = new Set<string>();

    for (const children of Object.values({
      ...fixtures,
      ...listItemFixtures,
    })) {
      const serialized = serialize(editor, children);

      if (!serialized.ok) throw new Error(serialized.diagnostics[0].message);
      new DOMParser()
        .parseFromString(serialized.data, 'text/html')
        .body.querySelectorAll('*')
        .forEach((element) => {
          element.getAttributeNames().forEach((name) => {
            if (name.startsWith('data-')) emitted.add(name);
          });
        });
    }

    expect([...emitted].sort()).toEqual([...PLATE_HTML_ATTRIBUTES].sort());
  });

  it('fails an emitted attribute that no decoder claims', () => {
    const define = (claim: boolean) =>
      definePlugin('htmlConformanceNote', {
        formats: ({ defineFormats }) =>
          defineFormats({
            html: {
              decode: ({ element, preserve }) => {
                if (claim) preserve('data-language');

                return element.dataset.language
                  ? { tone: element.dataset.language }
                  : {};
              },
              encode: ({ content, node, preserve }) => {
                preserve('tone');

                return {
                  attributes: { 'data-language': node.tone },
                  children: content,
                  tag: 'aside',
                };
              },
              match: [{ tag: 'aside' }],
            },
          }),
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: { tone: property.string() },
          },
        },
      });
    const document = [
      { children: [{ text: 'x' }], tone: 'loud', type: 'htmlConformanceNote' },
    ];

    expect(
      audit(createEditor({ plugins: [...plugins, define(false)] }), document)
        .problems
    ).toEqual(['0 <aside> data-language: emitted but not read']);
    expect(
      audit(createEditor({ plugins: [...plugins, define(true)] }), document)
        .problems
    ).toEqual([]);
  });

  it('fails a claim that the output does not keep', () => {
    const define = (claim: boolean) =>
      definePlugin('htmlConformanceTone', {
        formats: ({ defineFormats }) =>
          defineFormats({
            html: {
              decode: () => ({}),
              encode: ({ content, preserve }) => {
                if (claim) preserve('tone');

                return { children: content, tag: 'aside' };
              },
              match: [{ tag: 'aside' }],
            },
          }),
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: { tone: property.string() },
          },
        },
      });
    const document = [
      { children: [{ text: 'x' }], tone: 'loud', type: 'htmlConformanceTone' },
    ];

    expect(
      audit(createEditor({ plugins: [...plugins, define(true)] }), document)
        .problems
    ).toEqual(['0 tone: "loud" read back as undefined without a report']);
    expect(
      audit(createEditor({ plugins: [...plugins, define(false)] }), document)
    ).toEqual({ problems: [], reported: ['0:tone'] });
  });
});
