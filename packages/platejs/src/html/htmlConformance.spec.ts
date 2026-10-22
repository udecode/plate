import { describe, expect, it } from 'bun:test';

import isEqual from 'lodash/isEqual.js';

import {
  BaseParagraphPlugin,
  createEditor,
  type Descendant,
  ElementApi,
  PLUGINS,
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
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../features/basic-styles';
import { BaseCodeBlockPlugin } from '../features/code-block';
import { BaseDetailsPlugin } from '../features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../features/footnote';
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
import { parseHtml, serializeHtml } from './index';

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
  BaseFootnotePlugin,
  BaseFootnoteDefinitionPlugin,
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

const footnotes: Value = [
  paragraph(
    { text: 'Claim' },
    { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
    { text: ' again' },
    { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
    { text: ' missing' },
    { type: 'footnoteReference', ref: 'x', children: [{ text: '' }] },
    { text: '.' }
  ),
  {
    type: 'footnoteDefinition',
    ref: '1',
    children: [paragraph({ text: 'Source text' })],
  },
  {
    type: 'footnoteDefinition',
    ref: '1',
    children: [paragraph({ text: 'Duplicate' })],
  },
];

const fixtures: Record<string, Value> = {
  footnotes,
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
  'a list with level rules': [
    {
      children: [{ text: 'a' }],
      indent: 1,
      listLevels: { '2': { start: 3 } },
      listType: 'numbered',
      type: 'paragraph',
    },
    {
      children: [{ text: 'b' }],
      indent: 2,
      listLevels: { '2': { start: 3 } },
      listType: 'numbered',
      type: 'paragraph',
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
});

// gh api markdown -f mode=markdown.
const githubMarkdown = {
  single:
    '<p>Claim<sup><a href="#fn-1" id="user-content-fnref-1" data-footnote-ref="">1</a></sup>.</p>\n<section data-footnotes="">\n<ol>\n<li id="user-content-fn-1">\n<p>Source text. <a href="#fnref-1" data-footnote-backref="" aria-label="Back to reference 1">↩</a></p>\n</li>\n</ol>\n</section>\n',
  repeated:
    '<p>First claim<sup><a href="#fn-1" id="user-content-fnref-1" data-footnote-ref="">1</a></sup> and second claim<sup><a href="#fn-1" id="user-content-fnref-1-2" data-footnote-ref="">1</a></sup>.</p>\n<section data-footnotes="">\n<ol>\n<li id="user-content-fn-1">\n<p>Shared note. <a href="#fnref-1" data-footnote-backref="" aria-label="Back to reference 1">↩</a> <a href="#fnref-1-2" data-footnote-backref="" aria-label="Back to reference 1-2">↩<sup>2</sup></a></p>\n</li>\n</ol>\n</section>\n',
  blocks:
    '<p>Claim<sup><a href="#fn-n" id="user-content-fnref-n" data-footnote-ref="">1</a></sup>.</p>\n<section data-footnotes="">\n<ol>\n<li id="user-content-fn-n">\n<p>First paragraph.</p>\n<p>Second paragraph.</p>\n<ul>\n<li>item one</li>\n<li>item two</li>\n</ul>\n<a href="#fnref-n" data-footnote-backref="" aria-label="Back to reference 1">↩</a>\n</li>\n</ol>\n</section>\n',
};
// gh api markdown -f mode=gfm.
const githubGfm = {
  single:
    '<p>Claim<sup><a href="#user-content-fn-1-948904608bc87310ca134c9657b0e4e3" id="user-content-fnref-1-948904608bc87310ca134c9657b0e4e3" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1-948904608bc87310ca134c9657b0e4e3">\n<p>Source text. <a href="#user-content-fnref-1-948904608bc87310ca134c9657b0e4e3" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>',
  repeated:
    '<p>First claim<sup><a href="#user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda" id="user-content-fnref-1-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup> and second claim<sup><a href="#user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda" id="user-content-fnref-1-2-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda">\n<p>Shared note. <a href="#user-content-fnref-1-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a> <a href="#user-content-fnref-1-2-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-backref="" aria-label="Back to reference 1-2" class="data-footnote-backref">↩<sup>2</sup></a></p>\n</li>\n</ol>\n</section>',
  blocks:
    '<p>Claim<sup><a href="#user-content-fn-n-f2d6eae73954909d93371a6c2a372a87" id="user-content-fnref-n-f2d6eae73954909d93371a6c2a372a87" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-n-f2d6eae73954909d93371a6c2a372a87">\n<p>First paragraph.</p>\n<p>Second paragraph.</p>\n<ul>\n<li>item one</li>\n<li>item two</li>\n</ul>\n<a href="#user-content-fnref-n-f2d6eae73954909d93371a6c2a372a87" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a>\n</li>\n</ol>\n</section>',
};

describe('footnote HTML', () => {
  it('serializes linked footnotes under the default loss policy and parses them back', () => {
    const encoded = serializeHtml(
      { children: footnotes },
      { plugins, projection: 'accepted' }
    );
    expect(encoded).toEqual({
      ok: true,
      diagnostics: [],
      data: '<p>Claim<sup><a data-editor-footnote-ref="1" href="#fn-1" id="fnref-1">1</a></sup> again<sup><a data-editor-footnote-ref="1" href="#fn-1" id="fnref-1:2">1</a></sup> missing<sup><a data-editor-footnote-ref="x" href="#fn-x" id="fnref-x">x</a></sup>.</p><div data-editor-footnote-definition="1" id="fn-1"><p>Source text</p><a data-editor-footnote-chrome="" href="#fnref-1">↩</a></div><div data-editor-footnote-definition="1" id="fn-1:2"><p>Duplicate</p></div>',
    });
    if (!encoded.ok) throw new Error('Footnote serialization failed');
    expect(parseHtml(encoded.data, { plugins })).toMatchObject({
      ok: true,
      diagnostics: [],
      document: { children: footnotes },
    });
  });

  it.each([
    ...Object.entries(githubMarkdown).map(([shape, html]) => ({
      mode: 'markdown',
      shape,
      html,
    })),
    ...Object.entries(githubGfm).map(([shape, html]) => ({
      mode: 'gfm',
      shape,
      html,
    })),
    ...Object.entries(githubGfm).map(([shape, html]) => ({
      mode: 'absolute gfm',
      shape,
      html: html.replaceAll('href="#', 'href="https://github.com/o/r#'),
    })),
  ])(
    'reads GitHub $mode $shape footnotes without chrome',
    ({ shape, html }) => {
      for (const wrapped of [
        html,
        `<div class="markdown-body">${html}</div>`,
        `<article>${html}</article>`,
      ]) {
        const result = parseHtml(wrapped, { plugins });
        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
        expect(result.diagnostics).toEqual([]);
        const reader = createEditor({
          plugins,
          initialValue: result.document.children,
        });
        expect(reader.read.footnote.references({ ref: '1' })).toHaveLength(
          shape === 'repeated' ? 2 : 1
        );
        expect(reader.read.footnote.definitions()).toHaveLength(1);
        expect(reader.read.footnote.definition({ ref: '1' })?.[1]).toEqual([1]);
        expect(
          reader.read.footnote.definition({ ref: '1' })?.[0].children
        ).toMatchObject(
          shape === 'blocks'
            ? [
                paragraph({ text: 'First paragraph.' }),
                paragraph({ text: 'Second paragraph.' }),
                {
                  type: 'paragraph',
                  listType: 'bulleted',
                  children: [{ text: 'item one' }],
                },
                {
                  type: 'paragraph',
                  listType: 'bulleted',
                  children: [{ text: 'item two' }],
                },
              ]
            : [
                paragraph({
                  text: shape === 'single' ? 'Source text. ' : 'Shared note. ',
                }),
              ]
        );
        expect(
          reader.read.nodes.toArray({
            at: [],
            match: (node) => TextApi.isText(node) && node.script === 'sup',
          })
        ).toEqual([]);
      }
    }
  );

  it('pairs two pasted comments whose displayed note numbers coincide', () => {
    const html =
      githubGfm.single +
      githubGfm.single.replaceAll('948904608bc87310ca134c9657b0e4e3', 'second');
    const result = parseHtml(html, { plugins });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const reader = createEditor({
      plugins,
      initialValue: result.document.children,
    });
    expect(reader.read.footnote.refs()).toEqual(['1', '1-2']);
    expect(reader.read.footnote.references({ ref: '1' })[0]?.[1]).toEqual([
      0, 1,
    ]);
    expect(reader.read.footnote.references({ ref: '1-2' })[0]?.[1]).toEqual([
      2, 1,
    ]);
  });

  it.each([
    ['#fn-missing', '1', '1'],
    ['https://github.com/o/r#user-content-fn-missing', '1', '1'],
    ['#fn-%', '2', '2'],
  ])(
    'keeps citation %s without its definition unresolved',
    (href, text, ref) => {
      const result = parseHtml(
        `<p><sup><a data-footnote-ref="" href="${href}">${text}</a></sup></p>`,
        { plugins }
      );
      expect(result).toMatchObject({
        ok: true,
        document: {
          children: [
            paragraph(
              { text: '' },
              { type: 'footnoteReference', ref, children: [{ text: '' }] },
              { text: '' }
            ),
          ],
        },
      });
    }
  );

  it.each([
    ['foreign marker', '<a data-footnote-ref="" href="#ordinary">1</a>'],
    ['blank marker', '<a data-editor-footnote-ref=" " href="#fn-1">1</a>'],
    ['blank GitHub text', '<a data-footnote-ref="" href="#fn-1"> </a>'],
  ])('leaves a %s to Link', (_name, html) => {
    const result = parseHtml(`<p>${html}</p>`, {
      plugins,
      lossPolicy: 'allow',
    });
    expect(result).toMatchObject({
      ok: true,
      document: {
        children: [
          { children: [{ text: '' }, { type: 'link' }, { text: '' }] },
        ],
      },
    });
  });

  it('pairs raw malformed and percent-decoded GitHub fragments without throwing', () => {
    const html =
      '<p><sup><a data-footnote-ref="" href="#fn-%">2</a></sup><sup><a data-footnote-ref="" href="#fn-a%20b">3</a></sup></p><section data-footnotes=""><ol><li id="user-content-fn-%"><p>raw</p></li><li id="user-content-fn-a b"><p>decoded</p></li></ol></section>';
    const result = parseHtml(html, { plugins });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const reader = createEditor({
      plugins,
      initialValue: result.document.children,
    });
    expect(reader.read.footnote.refs()).toEqual(['2', '3']);
    expect(reader.read.footnote.references({ ref: '2' })).toHaveLength(1);
    expect(reader.read.footnote.references({ ref: '3' })).toHaveLength(1);
  });

  it('keeps plain ordered lists and blank definition markers outside footnotes', () => {
    const result = parseHtml(
      '<ol><li>ordinary</li></ol><div data-editor-footnote-definition=" "><p>plain</p></div>',
      { plugins, lossPolicy: 'allow' }
    );
    expect(result).toMatchObject({
      ok: true,
      document: {
        children: [
          {
            type: 'paragraph',
            listType: 'numbered',
            children: [{ text: 'ordinary' }],
          },
          paragraph({ text: 'plain' }),
        ],
      },
    });
  });
});
