import { authored } from '../../authored';
import {
  BaseParagraphPlugin,
  ContentSlice,
  createEditor,
  createEditorView,
  definePlugin,
  ElementIdPlugin,
  PLUGINS,
  schema,
  type BasePluginInput,
  type CreateEditorOptions,
  type InitialValue,
  type Value,
} from '../../core';
import { writeDataTransferFragment } from '../../dom';
import { BaseBoldPlugin } from '../../features/basic-nodes';
import { BaseFontColorPlugin } from '../../features/basic-styles';
import { BaseListPlugin } from '../../features/list';
import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';
import { createMarkdownRuntime } from './internal/markdownConversion';
import {
  MarkdownPlugin,
  parseMarkdown,
  parseMarkdownInline,
  parseMarkdownSlice,
  serializeMarkdown,
} from './MarkdownPlugin';
import { remarkMdx } from './plugins';
import type {
  MarkdownDocumentValueFromPlugins,
  MarkdownSyncPluggable,
} from './types';
import { materializeRemarkPlugins } from './utils/getRemarkPluginsWithoutMdx';

const createFixtureEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<CreateEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createEditor({
    ...options,
  });

const createDataTransfer = ({
  files = [],
  html = '',
  text = '',
}: {
  files?: File[];
  html?: string;
  text?: string;
}) => {
  const dataTransfer = new DataTransfer();

  if (html) dataTransfer.setData('text/html', html);
  if (text) dataTransfer.setData('text/plain', text);
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  return dataTransfer;
};

describe('MarkdownPlugin', () => {
  it('exports authored documents only through explicit semantic projections', () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        MarkdownPlugin,
        authored({ authorId: 'alice' }),
      ],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert(' draft', {
      at: { offset: 4, path: [0, 0] },
    });

    expect(() => serializeTestMarkdown(editor)).toThrow(
      'Markdown serialization requires a projection'
    );
    const accepted = serializeTestMarkdown(editor, {
      projection: 'accepted',
    });
    const proposed = serializeTestMarkdown(editor, {
      projection: 'proposed',
    });

    expect(accepted.data).toBe('Base\n');
    expect(proposed.data).toBe('Base draft\n');
    expect(accepted.diagnostics[0]?.code).toBe('authored-lossy-projection');
    expect(proposed.data).not.toContain('plate-authored');
  });

  it('reads live Markdown options without changing document schema identity', () => {
    const remarkPlugin = () => undefined;
    const editor = createFixtureEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseListPlugin,
        MarkdownPlugin.configure({
          initialState: {
            remarkPlugins: [remarkPlugin],
            remarkStringifyOptions: { bullet: '+' },
          },
        }),
      ],
    });
    const value = [
      {
        children: [{ text: 'Item' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];
    const identity = editor.read.schema.identity();
    const serializeHost = () => {
      const data = new DataTransfer();

      writeDataTransferFragment(editor, data, ContentSlice.closed(value));

      return data.getData('text/markdown');
    };

    expect(editor.plugin(MarkdownPlugin).store.get().remarkPlugins?.[0]).toBe(
      remarkPlugin
    );
    expect(
      serializeTestMarkdown(editor, { document: { children: value } }).data
    ).toBe('+ Item\n');
    expect(serializeHost()).toBe('+ Item\n');

    editor.plugin(MarkdownPlugin).store.set({
      remarkStringifyOptions: { bullet: '*' },
    });

    expect(
      serializeTestMarkdown(editor, { document: { children: value } }).data
    ).toBe('* Item\n');
    expect(serializeHost()).toBe('* Item\n');
    expect(editor.read.schema.identity()).toEqual(identity);
  });

  it('materializes frozen sync plugin tuples only at the unified boundary', () => {
    const remarkPlugin = (_options: { label: string }) => undefined;
    const tuple = [remarkPlugin, { label: 'configured' }] as const;
    const configuredPlugins: MarkdownSyncPluggable[] = [tuple];
    const editor = createFixtureEditor({
      plugins: [
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: configuredPlugins },
        }),
      ],
    });
    const snapshot =
      editor.plugin(MarkdownPlugin).store.get().remarkPlugins ?? [];
    const snapshotTuple = snapshot[0];

    if (
      !snapshotTuple ||
      typeof snapshotTuple === 'function' ||
      !Array.isArray(snapshotTuple)
    ) {
      throw new Error('Expected a frozen remark plugin tuple.');
    }

    configuredPlugins.push(() => undefined);

    expect(snapshot).toHaveLength(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshotTuple)).toBe(true);

    const materialized = materializeRemarkPlugins(snapshot);
    const materializedTuple = materialized[0];

    if (
      !materializedTuple ||
      typeof materializedTuple === 'function' ||
      !Array.isArray(materializedTuple)
    ) {
      throw new Error('Expected a materialized remark plugin tuple.');
    }

    expect(materialized).not.toBe(snapshot);
    expect(materializedTuple).not.toBe(snapshotTuple);
    expect(materializedTuple[1]).toBe(snapshotTuple[1]);
    expect(typeof serializeTestMarkdown(editor).data).toBe('string');
  });

  it('exposes the final parse and serialize API', () => {
    const plugins = [BaseBoldPlugin, MarkdownPlugin] as const;
    const editor = createFixtureEditor({
      plugins,
    });
    const plugin = editor.plugin(MarkdownPlugin);

    expect(editor.plugin(MarkdownPlugin).store.get()).toMatchObject({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
    });
    expect(typeof editor.api.markdown.parse).toBe('function');
    expect(typeof editor.api.markdown.parseInline).toBe('function');
    expect(typeof editor.api.markdown.parseSlice).toBe('function');
    expect(typeof editor.api.markdown.serialize).toBe('function');
    expect(Reflect.ownKeys(editor.plugin(MarkdownPlugin).api)).toEqual([
      'parse',
      'parseInline',
      'parseSlice',
      'serialize',
    ]);
    expect(editor.plugin(MarkdownPlugin).api.parse('**bold**')).toEqual(
      editor.api.markdown.parse('**bold**')
    );
    const portalResult = editor.plugin(MarkdownPlugin).api.parse('**bold**');
    const editorResult = editor.api.markdown.parse('**bold**');

    if (portalResult.ok && editorResult.ok) {
      const portalDocument: MarkdownDocumentValueFromPlugins<typeof plugins> =
        portalResult.document;
      const editorDocument: MarkdownDocumentValueFromPlugins<typeof plugins> =
        editorResult.document;

      void portalDocument;
      void editorDocument;
    }
    expect('parser' in plugin).toBe(false);
    expect(parseTestMarkdown(editor, '**bold**')).toEqual({
      children: [
        {
          children: [{ bold: true, text: 'bold' }],
          type: 'paragraph',
        },
      ],
    });
  });

  it('keeps direct and editor operations on the same result contract', () => {
    const plugins = [
      BaseParagraphPlugin,
      BaseBoldPlugin,
      MarkdownPlugin,
    ] as const;
    const editor = createEditor({ plugins });
    const direct = parseMarkdown('**bold**', { plugins });
    const throughEditor = editor.api.markdown.parse('**bold**');

    expect(direct).toEqual(throughEditor);
    if (!direct.ok) throw new Error('Expected Markdown parsing.');
    const directSerialized = serializeMarkdown(direct.document, { plugins });
    const editorSerialized = editor.api.markdown.serialize({
      document: direct.document,
    });

    expect(directSerialized).toEqual(editorSerialized);
  });

  it('returns closed rootless slices from direct slice and inline parsing', () => {
    const plugins = [
      BaseParagraphPlugin,
      BaseBoldPlugin,
      MarkdownPlugin,
    ] as const;
    const slice = parseMarkdownSlice('**bold**', { plugins });
    const inline = parseMarkdownInline(' **bold** ', { plugins });

    expect(slice.ok).toBe(true);
    expect(inline.ok).toBe(true);
    if (!slice.ok || !inline.ok) throw new Error('Expected Markdown slices.');
    expect(slice.slice).toMatchObject({ openEnd: 0, openStart: 0 });
    expect(inline.slice).toMatchObject({ openEnd: 0, openStart: 0 });
    expect(slice.slice.roots).toBeUndefined();
    expect(inline.slice.roots).toBeUndefined();
  });

  it('rejects multiple blocks in inline parsing instead of truncating', () => {
    const result = parseMarkdownInline('one\n\ntwo', {
      plugins: [BaseParagraphPlugin, MarkdownPlugin],
    });

    expect(result).toMatchObject({
      diagnostics: [
        {
          actual: 2,
          code: 'markdown-inline-blocks',
          severity: 'error',
        },
      ],
      ok: false,
    });
  });

  it('reports limits and reserves fallback for explicit streaming recovery', () => {
    const plugins = [
      BaseParagraphPlugin,
      MarkdownPlugin.configure({
        initialState: { remarkPlugins: [remarkMdx] },
      }),
    ] as const;
    const limited = parseMarkdown('three bytes', {
      limits: { maxBytes: 2 },
      plugins,
    });
    const strict = parseMarkdown('<u>', { plugins });
    const recovered = parseMarkdown('<u>', {
      plugins,
      recovery: 'incomplete-stream',
    });

    expect(limited).toMatchObject({
      diagnostics: [
        expect.objectContaining({ code: 'markdown-limit-exceeded' }),
      ],
      ok: false,
    });
    expect(strict.ok).toBe(false);
    expect(recovered).toMatchObject({
      diagnostics: [expect.objectContaining({ code: 'markdown-fallback' })],
      ok: true,
    });
  });

  it('fails unknown visible nodes unless the caller allows a diagnosed drop', () => {
    const UnknownPlugin = definePlugin('unknownMarkdownNode', {
      schema: { element: schema.element.textBlock() },
    });
    const plugins = [
      BaseParagraphPlugin,
      UnknownPlugin,
      MarkdownPlugin,
    ] as const;
    const document = {
      children: [
        {
          children: [{ text: 'visible' }],
          type: 'unknownMarkdownNode',
        },
      ],
    } as const;
    const rejected = serializeMarkdown(document, { plugins });
    const allowed = serializeMarkdown(document, {
      lossPolicy: 'allow',
      plugins,
    });

    expect(rejected).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          severity: 'error',
        }),
      ],
      ok: false,
    });
    expect(allowed).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          severity: 'warning',
        }),
      ],
      ok: true,
    });
  });

  it('diagnoses caller-requested node filtering', () => {
    const plugins = [
      BaseParagraphPlugin,
      BaseBoldPlugin,
      MarkdownPlugin,
    ] as const;
    const result = parseMarkdown('**bold**', {
      disallowedNodes: ['bold'],
      plugins,
    });

    expect(result).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-filtered-node',
          severity: 'warning',
        }),
      ],
      ok: true,
    });
  });

  it('returns schema-fit repairs as typed diagnostics', () => {
    const FittedPlugin = definePlugin('fittedMarkdownNode', {
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({
          markdown: {
            decode: () => ({
              children: [{ text: 'fit' }, { text: 'ted' }],
              type,
            }),
            from: 'paragraph',
            kind: 'node',
          },
        }),
      schema: { element: schema.element.textBlock() },
    });
    const result = parseMarkdown('fitted', {
      plugins: [BaseParagraphPlugin, FittedPlugin, MarkdownPlugin],
    });

    expect(result).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-schema-repair',
          impact: 'lossless',
          repair: 'merge-text',
          severity: 'warning',
        }),
      ],
      document: {
        children: [expect.objectContaining({ children: [{ text: 'fitted' }] })],
      },
      ok: true,
    });

    expect(
      parseMarkdownSlice('fitted', {
        plugins: [BaseParagraphPlugin, FittedPlugin, MarkdownPlugin],
      })
    ).toMatchObject({
      diagnostics: [],
      ok: true,
      slice: {
        content: [
          expect.objectContaining({
            children: [{ text: 'fit' }, { text: 'ted' }],
          }),
        ],
      },
    });
  });

  it('round-trips canonical persisted element ids', () => {
    const editor = createFixtureEditor({
      plugins: [
        ElementIdPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Hello' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ],
    });

    const markdown = serializeTestMarkdown(editor, { withBlockId: true }).data;

    expect(markdown).toContain('<block id="block-1">');
    expect(parseTestMarkdown(editor, markdown)).toEqual({
      children: [
        {
          children: [{ text: 'Hello' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ],
    });
  });

  it('round-trips persisted ids for flat list blocks', () => {
    const editor = createFixtureEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseListPlugin,
        ElementIdPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'First' }],
          id: 'list-1',
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second' }],
          id: 'list-2',
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });

    const markdown = serializeTestMarkdown(editor, { withBlockId: true }).data;

    expect(markdown).toContain('<block id="list-1">');
    expect(markdown).toContain('<block id="list-2">');
    expect(parseTestMarkdown(editor, markdown).children).toEqual([
      expect.objectContaining({ id: 'list-1' }),
      expect.objectContaining({ id: 'list-2' }),
    ]);
  });

  it('rejects persisted block wrappers without ElementIdPlugin', () => {
    const editor = createFixtureEditor({
      plugins: [
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
    });

    expect(() =>
      parseTestMarkdown(editor, '<block id="block-1">\n\nHello\n\n</block>')
    ).toThrow('requires ElementIdPlugin');
  });

  it('checks optional plugins through their installed portal state', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });
    const installed = editor.read((state) => {
      const runtime = createMarkdownRuntime(
        editor,
        editor.plugin(MarkdownPlugin).store.get(),
        state
      );

      return {
        markdown: runtime.registry.has(PLUGINS.markdown),
        missing: runtime.registry.has('missingPlugin'),
      };
    });

    expect(installed).toEqual({
      markdown: true,
      missing: false,
    });
  });

  it('skips plain-text parsing when html is present', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({
          html: '<p>paste me</p>',
          text: '**plain text**',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'paste me' }], type: 'paragraph' },
    ]);
  });

  it('passes through URL-only clipboard text so link handling can own it', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({ text: 'https://platejs.org/docs' })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'paragraph' },
    ]);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({
          files: [new File([''], 'attachment.txt')],
          text: 'https://platejs.org/docs',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'paragraph' },
    ]);
  });

  it('parses non-url plain text by default', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({ text: '**bold**' })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: 'paragraph' },
    ]);
  });

  it('registers Markdown serialization with the host format registry', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
    });
    const data = new DataTransfer();
    const fragment = parseTestMarkdown(editor, '**bold**');

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.closed(fragment.children)
    );

    expect(data.getData('text/markdown')).toBe('**bold**\n');
  });

  it('projects only primary content through the Markdown host format', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });
    const data = new DataTransfer();

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [
          {
            children: [{ text: 'Primary content' }],
            type: 'paragraph',
          },
        ],
        openEnd: 1,
        openStart: 1,
        roots: {
          caption: [{ text: 'Detached caption' }],
        },
      })
    );

    expect(data.getData('text/markdown')).toBe('Primary content\n');
  });

  it('keeps inline marks while unwrapping an open nested fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const blockquote = parseTestMarkdown(editor, '> alpha **beta** gamma')
      .children[0];

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [blockquote],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('unwraps every open depth without inventing nested block markers', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const blockquote = parseTestMarkdown(editor, '> # alpha **beta** gamma')
      .children[0];

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [blockquote],
        openEnd: 2,
        openStart: 2,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('does not invent a heading marker for an open clipboard fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const heading = parseTestMarkdown(editor, '# alpha **beta** gamma')
      .children[0];

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [heading],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('does not invent code fences for an open clipboard fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const codeBlock = parseTestMarkdown(
      editor,
      '```ts\nconst alpha = 1;\nconst beta = 2;\n```'
    ).children[0];

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [codeBlock],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe(
      'const alpha = 1;\nconst beta = 2;\n'
    );
  });

  it('does not invent a list marker for an open clipboard fragment', () => {
    const editor = createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin, MarkdownPlugin],
    });
    const data = new DataTransfer();

    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [
          {
            children: [{ text: 'partial item' }],
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('partial item\n');
  });

  it('round-trips image alt through the Markdown host format', () => {
    const source = createTestEditor();
    const document = parseTestMarkdown(source, '![Caption](/image.png)');
    const data = new DataTransfer();

    writeDataTransferFragment(
      source,
      data,
      ContentSlice.fromJSON({
        content: document.children,
        openEnd: 0,
        openStart: 0,
      })
    );

    expect(data.getData('text/markdown')).toBe('![Caption](/image.png)\n');

    const target = createTestEditor();
    const markdownData = new DataTransfer();

    target.update.value.replace({
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    target.update.selection.set({ offset: 0, path: [0, 0] });
    markdownData.setData('text/markdown', data.getData('text/markdown'));

    expect(target.api.dom.clipboard.insertData(markdownData)).toBe(true);

    const value = target.read.value();
    const image = value.children[0];

    expect(image).toMatchObject({
      alt: 'Caption',
      children: [{ text: '' }],
      type: 'image',
      url: '/image.png',
    });
    expect(value).not.toHaveProperty('roots');
  });

  it('deserializes partially styled MDX spans into JSON-compatible content', () => {
    const editor = createFixtureEditor({
      plugins: [BaseFontColorPlugin, MarkdownPlugin],
    });
    const value = parseTestMarkdown(
      editor,
      '<span style="color: #93C47D;">colored</span>',
      { remarkPlugins: [remarkMdx] }
    );

    expect(value).toEqual({
      children: [
        {
          children: [{ color: '#93C47D', text: 'colored' }],
          type: 'paragraph',
        },
      ],
    });
    expect(ContentSlice.closed(value.children).content).toEqual(value.children);
  });

  it('parses the registered Markdown clipboard format', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const data = new DataTransfer();

    data.setData('text/markdown', '**bold**');

    expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
    expect(editor.read.children()).toEqual(
      parseTestMarkdown(editor, '**bold**').children
    );
  });

  it('round-trips a leaf property through the Markdown host format', () => {
    const value = [
      { children: [{ bold: true, text: 'bold' }], type: 'paragraph' },
    ];
    const source = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: value,
    });
    const target = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const data = new DataTransfer();

    writeDataTransferFragment(source, data, ContentSlice.closed(value));

    expect(target.api.dom.clipboard.insertData(data)).toBe(true);
    expect(target.read.children()).toEqual(value);
  });
});
