import {
  BaseParagraphPlugin,
  createEditor,
  defineEditorSchema,
  definePlugin,
  ElementIdPlugin,
  schema,
} from '../../core';
import {
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '../../features/basic-nodes';
import { BaseImagePlugin } from '../../features/media';
import {
  MarkdownPlugin,
  parseMarkdown,
  serializeMarkdown,
} from './MarkdownPlugin';
import type { MarkdownDocumentParseResult } from './types';

const TitlePlugin = definePlugin('title', {
  schema: { element: schema.element.textBlock() },
});
const SectionPlugin = definePlugin('section', {
  schema: {
    element: {
      content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
    },
  },
});
const withoutParagraph = BaseParagraphPlugin.configure({ enabled: false });
const rootOf = (type: string) =>
  schema.content.group('block', { default: { type }, min: 1 });
const titleApp = {
  plugins: [withoutParagraph, TitlePlugin, MarkdownPlugin],
  schema: { root: rootOf('title') },
} as const;
const NotePlugin = definePlugin('note', {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({ markdown: { tag: type } }),
  schema: { element: { ...schema.element.textBlock(), type: 'paragraph' } },
});
const noteApp = {
  ...titleApp,
  plugins: [...titleApp.plugins, NotePlugin],
} as const;
const headedApp = {
  plugins: [...titleApp.plugins, BaseHeadingPlugin],
  schema: {
    root: schema.content.prefix(
      [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
      rootOf('title')
    ),
  },
};

const childrenOf = (result: MarkdownDocumentParseResult) => {
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

  return result.document.children;
};

describe('Markdown paragraphs without a paragraph plugin', () => {
  it('land on the root default block for their position and write back', () => {
    const options = {
      plugins: [...titleApp.plugins, ElementIdPlugin],
      schema: titleApp.schema,
    };
    const editor = createEditor(options);

    for (const result of [
      editor.api.markdown.parse('a\n\nb'),
      parseMarkdown('a\n\nb', options),
    ]) {
      const children = childrenOf(result);

      expect(children).toMatchObject([
        { children: [{ text: 'a' }], type: 'title' },
        { children: [{ text: 'b' }], type: 'title' },
      ]);
      expect(children[0].id).toEqual(expect.any(String));
      expect(children[1].id).not.toBe(children[0].id);
      expect(serializeMarkdown({ children }, options)).toMatchObject({
        data: 'a\n\nb\n',
        ok: true,
      });
    }
  });

  it('land the first paragraph in a required heading slot', () => {
    const children = childrenOf(parseMarkdown('a\n\nb', headedApp));

    expect(children).toEqual([
      { children: [{ text: 'a' }], level: 1, type: 'heading' },
      { children: [{ text: 'b' }], type: 'title' },
    ]);
    expect(serializeMarkdown({ children }, headedApp)).toMatchObject({
      data: '# a\n\nb\n',
      ok: true,
    });
  });

  it('keep two invalid standalone images as two blocks', () => {
    expect(
      childrenOf(
        parseMarkdown(
          '<img alt="one" src="javascript:one" />\n\n<img alt="two" src="javascript:two" />',
          { ...titleApp, plugins: [...titleApp.plugins, BaseImagePlugin] }
        )
      )
    ).toEqual([
      { children: [{ text: 'one' }], type: 'title' },
      { children: [{ text: 'two' }], type: 'title' },
    ]);
  });

  it('land beside a behavior-only plugin named "paragraph" and write back', () => {
    const options = {
      plugins: [definePlugin('paragraph', {}), TitlePlugin, MarkdownPlugin],
      schema: titleApp.schema,
    };
    const children = childrenOf(parseMarkdown('a', options));

    expect(children).toEqual([{ children: [{ text: 'a' }], type: 'title' }]);
    expect(serializeMarkdown({ children }, options)).toMatchObject({
      data: 'a\n',
      ok: true,
    });
  });

  it('never read an app block persisted as "paragraph" as paragraph syntax', () => {
    const editor = createEditor(noteApp);

    expect(childrenOf(editor.api.markdown.parse('a'))).toEqual([
      { children: [{ text: 'a' }], type: 'title' },
    ]);
    expect(editor.api.markdown.parseSlice('a')).toMatchObject({
      diagnostics: [
        { code: 'markdown-unsupported-node', nodeType: 'paragraph' },
      ],
      ok: false,
    });
  });

  it('refuse an app block persisted as "paragraph" as inline Markdown', () => {
    const editor = createEditor(noteApp);

    expect(
      childrenOf(editor.api.markdown.parse('<paragraph>a</paragraph>'))
    ).toEqual([{ children: [{ text: 'a' }], type: 'paragraph' }]);
    expect(
      editor.api.markdown.parseInline('<paragraph>a</paragraph>')
    ).toMatchObject({
      diagnostics: [{ code: 'markdown-inline-blocks' }],
      ok: false,
    });
  });

  it('refuse a slice paragraph under a schema that preserves unknown types', () => {
    const PreserveSchema = defineEditorSchema('schema:preserve-titles', {
      elements: {
        title: { content: schema.content.text({ default: 'text', min: 1 }) },
      },
      root: schema.content.types(['title'], {
        default: { type: 'title' },
        min: 1,
      }),
      unknown: 'preserve',
    });
    const editor = createEditor({
      plugins: [withoutParagraph, PreserveSchema, MarkdownPlugin],
    });

    expect(editor.api.markdown.parseSlice('a')).toMatchObject({
      diagnostics: [
        { code: 'markdown-unsupported-node', nodeType: 'paragraph' },
      ],
      ok: false,
    });
  });

  it('refuse text no block can hold', () => {
    const BoxPlugin = definePlugin('box', {
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({ markdown: { tag: type } }),
      schema: { element: { content: rootOf('title') } },
    });
    const divider = createEditor({
      plugins: [withoutParagraph, BaseHorizontalRulePlugin, MarkdownPlugin],
      schema: { root: rootOf('horizontalRule') },
    });
    const boxed = createEditor({
      ...titleApp,
      plugins: [...titleApp.plugins, BoxPlugin],
    });
    const refusal = (path: number[]) => ({
      diagnostics: [
        {
          code: 'markdown-unsupported-node',
          model: { path },
          nodeType: 'paragraph',
          severity: 'error',
        },
      ],
      ok: false,
    });

    expect(divider.api.markdown.parse('hello')).toMatchObject(refusal([0]));
    expect(boxed.api.markdown.parse('<box>\n\na\n\n</box>')).toMatchObject(
      refusal([0, 0])
    );
  });
});

describe('Markdown paragraphs with a paragraph plugin', () => {
  it('still report an unmapped root default block as lost', () => {
    expect(
      serializeMarkdown(
        { children: [{ children: [{ text: 'hello' }], type: 'title' }] },
        { plugins: [TitlePlugin, MarkdownPlugin], schema: titleApp.schema }
      )
    ).toMatchObject({
      diagnostics: [{ code: 'markdown-unsupported-node', nodeType: 'title' }],
      ok: false,
    });
  });

  it('build paragraphs with a plugin that only shares the paragraph name', () => {
    const ForeignParagraph = definePlugin('paragraph', {
      schema: { element: schema.element.textBlock() },
    });
    const editor = createEditor({
      plugins: [ForeignParagraph, MarkdownPlugin],
    });

    expect(childrenOf(editor.api.markdown.parse('a'))).toEqual([
      { children: [{ text: 'a' }], type: 'paragraph' },
    ]);
  });

  it('keep a section root wrapping its paragraph', () => {
    const editor = createEditor({
      plugins: [SectionPlugin, MarkdownPlugin],
      schema: { root: schema.content.element(SectionPlugin, { min: 1 }) },
    });

    expect(childrenOf(editor.api.markdown.parse('hello'))).toEqual([
      {
        children: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
        type: 'section',
      },
    ]);
  });
});
