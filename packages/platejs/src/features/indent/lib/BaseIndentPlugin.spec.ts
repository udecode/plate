import {
  BaseParagraphPlugin,
  createEditor as createHeadlessEditor,
  definePlugin,
  ContentSlice,
  EditorSchemaValidationError,
  type Value,
  schema,
} from '../../../core';
import { writeDataTransferFragment } from '../../../dom';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import { createPluginContext } from '../../../lib/plugin/createPluginContext.internal';
import { createEditor } from '../../../react/core';
import { dispatchPlateShortcut } from '../../../react/utils/dispatchPlateShortcut.internal';
import { BaseBlockquotePlugin } from '../../basic-nodes';
import { BaseDetailsPlugin } from '../../details';
import { NoteHolder } from '../../details/__tests__/detailsConversionFixture';
import { BaseListPlugin } from '../../list';
import { BaseIndentPlugin } from './BaseIndentPlugin';

describe('BaseIndentPlugin', () => {
  it('increases indent in the caret root without editing main', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseIndentPlugin, NoteHolder],
      initialValue: {
        children: [
          {
            type: 'listNoteHolder',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: { note: [{ type: 'paragraph', children: [{ text: 'Note' }] }] },
      },
    });
    const main = editor.read.children();
    editor.update.selection.set({ path: [0, 0], offset: 0, root: 'note' });

    editor.plugin(BaseIndentPlugin).update.increase();

    expect({
      main: editor.read.children(),
      note: editor.read.root('note'),
    }).toEqual({
      main,
      note: [{ type: 'paragraph', indent: 1, children: [{ text: 'Note' }] }],
    });
  });
  it('accepts non-negative integer levels and rejects fractional indentation', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const document = (indent: number) => ({
      children: [
        { children: [{ text: 'Paragraph' }], indent, type: 'paragraph' },
      ],
    });

    expect(() => editor.read.schema.assertDocument(document(2))).not.toThrow();
    expect(() => editor.read.schema.assertDocument(document(0))).not.toThrow();
    expect(() => editor.read.schema.assertDocument(document(1.5))).toThrow(
      /indent.*validation/i
    );
  });

  it('exposes the default state and injected node-prop contract', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const plugin = editor.plugin(BaseIndentPlugin);
    const nodeProps = editor.plugin(BaseIndentPlugin).inject.nodeProps!;

    expect(editor.plugin(BaseIndentPlugin).store.get()).toEqual({
      indentMax: null,
      offset: 24,
      unit: 'px',
    });
    expect(plugin.targetPlugins[0]?.name).toBe(
      editor.plugin(BaseParagraphPlugin).schema.type
    );
    expect(nodeProps.nodeKey).toBe('indent');
    expect(nodeProps.styleKey).toBe('marginLeft');
    expect(
      nodeProps.transformNodeValue!({
        ...createPluginContext(editor, BaseIndentPlugin),
        nodeValue: 2,
      })
    ).toBe('48px');
  });

  it('changes the indent of every block in a range', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      initialValue: [
        { children: [{ text: 'One' }], type: 'paragraph' },
        { children: [{ text: 'Two' }], indent: 1, type: 'paragraph' },
      ],
    });
    const indents = () => editor.read.children().map((node) => node.indent);

    editor.update.indent.increase({ nodes: { at: [] } });
    expect(indents()).toEqual([1, 2]);

    editor.update.indent.decrease({ nodes: { at: [] } });
    expect(indents()).toEqual([undefined, 1]);
  });

  it('indents the Details when the caret sits in its title', () => {
    const editor = createHeadlessEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseDetailsPlugin,
        BaseIndentPlugin.configure({ targetPlugins: ['paragraph', 'details'] }),
      ],
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });
    editor.update.selection.set({ path: [0, 0, 0], offset: 5 });

    editor.plugin(BaseIndentPlugin).update.increase();

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        indent: 1,
        type: 'details',
      },
    ]);
  });

  it('uses configured targets for both model validation and injection', () => {
    const QuotePlugin = definePlugin('quote', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const IndentQuotePlugin = BaseIndentPlugin.configure({
      targetPlugins: ['quote'],
    });
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, QuotePlugin, IndentQuotePlugin],
      initialValue: [
        {
          children: [{ text: 'Quote' }],
          indent: 1,
          type: 'quote',
        },
      ],
    });

    expect(
      editor
        .plugin(BaseIndentPlugin)
        .targetPlugins.map((innerTarget) =>
          typeof innerTarget === 'string' ? innerTarget : innerTarget.name
        )
        .join(',')
    ).toBe('quote');
    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      type: 'quote',
    });
    let thrown: unknown;
    const assertFragment: typeof editor.read.schema.assertFragment =
      editor.read.schema.assertFragment;

    try {
      assertFragment([
        {
          children: [{ text: 'Paragraph' }],
          indent: 1,
          type: 'paragraph',
        },
      ]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(EditorSchemaValidationError);
    if (!(thrown instanceof EditorSchemaValidationError)) throw thrown;
    expect(thrown.diagnostics).toMatchObject([
      {
        code: 'property-target-mismatch',
        nodeType: editor.plugin(BaseParagraphPlugin).schema.type,
        property: { key: 'indent' },
      },
    ]);
  });

  it('indents and outdents a paragraph on Tab and Shift+Tab', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
    });
    const press = (shiftKey: boolean) =>
      dispatchPlateShortcut(
        editor,
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code: 'Tab',
          key: 'Tab',
          shiftKey,
        }),
        'keydown',
        getPlateRuntime(editor).shortcutTable
      );

    expect(press(false)).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({ indent: 1 });

    expect(press(true)).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('indent');
    // Outside a quote, Shift+Tab keeps the key at no indent.
    expect(press(true)).toBe(true);
  });

  it('lets Shift+Tab leave the blockquote plugin, not a plugin that only shares its name', () => {
    const quoted = (quote: typeof BaseBlockquotePlugin) => {
      const editor = createEditor({
        plugins: [BaseParagraphPlugin, BaseIndentPlugin, quote],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        },
        initialValue: [
          {
            children: [{ children: [{ text: 'One' }], type: 'paragraph' }],
            type: 'blockquote',
          },
        ],
      });
      const handled = dispatchPlateShortcut(
        editor,
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code: 'Tab',
          key: 'Tab',
          shiftKey: true,
        }),
        'keydown',
        getPlateRuntime(editor).shortcutTable
      );

      return { children: editor.read.children(), handled };
    };

    expect(quoted(BaseBlockquotePlugin)).toEqual({
      children: [{ children: [{ text: 'One' }], type: 'paragraph' }],
      handled: true,
    });
    expect(
      quoted(
        definePlugin('blockquote', {
          schema: { element: { content: schema.content.group('block') } },
        }) as never
      )
    ).toEqual({
      children: [
        {
          children: [{ children: [{ text: 'One' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
      handled: true,
    });
  });

  it('decodes CSS indentation through configured units', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
    });

    expect(
      parseHtmlSliceContent(editor, '<p style="margin-left: 20em">Indented</p>')
    ).toEqual([
      {
        children: [{ text: 'Indented' }],
        indent: 2,
        type: 'paragraph',
      },
    ]);
  });

  it('reads a margin between two indent levels as the nearer level', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
    });

    expect(
      editor.api.html.parse(
        '<p style="margin-left:36px">a</p><ul><li style="margin-left:36px">b</li></ul>'
      )
    ).toMatchObject({
      diagnostics: [],
      document: {
        children: [
          { children: [{ text: 'a' }], indent: 2, type: 'paragraph' },
          {
            children: [{ text: 'b' }],
            indent: 2,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
      },
      ok: true,
    });
  });

  it('uses the plugin type instead of an injected node key', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyIndent',
        },
      },
    });
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          type: 'paragraph',
        },
      ],
    });

    editor.update.indent.increase();

    expect(editor.read.children()[0]).toMatchObject({ indent: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyIndent');

    editor.update.indent.decrease();
    expect(editor.read.children()[0]).toMatchObject({ indent: 1 });
  });

  it('round-trips configured indent values through HTML', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
      initialValue: [
        {
          children: [{ text: 'Indented' }],
          indent: 2,
          type: 'paragraph',
        },
      ],
    });
    const serialized = new Map<string, string>();

    writeDataTransferFragment(
      editor,
      {
        setData: (format, value) => serialized.set(format, value),
      },
      ContentSlice.closed(editor.read.children())
    );
    const html = serialized.get('text/html');

    if (!html) throw new Error('Missing HTML mapping serialization');

    const paragraph = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.querySelector('p') as HTMLElement;

    expect(paragraph.dataset.indent).toBe('2');
    expect(paragraph.style.marginLeft).toBe('20em');
    expect(parseHtmlSliceContent(editor, html)).toEqual([
      ...editor.read.children(),
    ]);
  });

  it('caps matching block indent during normalization', () => {
    const value = [
      { children: [{ text: 'One' }], indent: 4, type: 'paragraph' },
    ] as const;
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          initialState: { indentMax: 2 },
        }),
      ],
      initialValue: value,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'paragraph' },
    ]);
  });

  it('caps the schema property instead of an injected node key', () => {
    const value = [
      { children: [{ text: 'One' }], indent: 4, type: 'paragraph' },
    ] as const;
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          inject: {
            nodeProps: {
              nodeKey: 'legacyIndent',
            },
          },
          initialState: { indentMax: 2 },
        }),
      ],
      initialValue: value,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'paragraph' },
    ]);
  });

  it('rejects indent outside the configured target types', () => {
    const value: Value = [
      { children: [{ text: 'One' }], indent: 2, type: 'quote' },
    ];
    let thrown: unknown;

    try {
      createEditor({
        plugins: [
          BaseParagraphPlugin,
          definePlugin('quote', {
            schema: {
              element: {
                content: schema.content.text({ default: 'text', min: 1 }),
              },
            },
          }),
          BaseIndentPlugin,
        ],
        initialValue: value,
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(EditorSchemaValidationError);
    if (!(thrown instanceof EditorSchemaValidationError)) throw thrown;
    expect(thrown.diagnostics).toMatchObject([
      {
        code: 'property-target-mismatch',
        nodeType: 'quote',
        property: { key: 'indent' },
      },
    ]);
  });
});
