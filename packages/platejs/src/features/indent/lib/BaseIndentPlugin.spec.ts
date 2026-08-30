import { writeHostFragmentData } from 'plitejs/dom';

import {
  BaseParagraphPlugin,
  createEditor as createHeadlessEditor,
  defineBasePlugin,
  createPluginContext,
  ContentSlice,
  EditorSchemaValidationError,
  type Value,
  property,
  schema,
  target,
} from '../../../core';
import { createEditor } from '../../../react/core';
import { BaseIndentPlugin } from './BaseIndentPlugin';

describe('BaseIndentPlugin', () => {
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

  it('changes block indent through typed tx groups', () => {
    const editor = createHeadlessEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin,
        defineBasePlugin('testIndentProps', {
          schema: {
            properties: {
              foo: schema.elementProperty(property.string(), {
                target: target.group('block'),
              }),
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          type: 'paragraph',
        },
      ],
    });

    editor.update.indent.change({
      nodes: { at: [] },
      setNodeProps: ({ indent }) => ({ foo: `indent-${indent}` }),
    });

    expect(editor.read.children()).toMatchObject([
      {
        foo: 'indent-1',
        indent: 1,
        type: 'paragraph',
      },
      {
        foo: 'indent-2',
        indent: 2,
        type: 'paragraph',
      },
    ]);

    editor.update.indent.decrease({
      nodes: { at: [] },
      unsetNodeProps: ['foo'],
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'One' }],
        type: 'paragraph',
      },
      {
        foo: 'indent-2',
        indent: 1,
        type: 'paragraph',
      },
    ]);
  });

  it('uses configured targets for both model validation and injection', () => {
    const QuotePlugin = defineBasePlugin('quote', {
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

  it('routes tab and untab through typed tx groups', () => {
    const editor = createHeadlessEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
    });

    expect(editor.update.indent.tab()).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({ indent: 1 });

    expect(editor.update.indent.untab()).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('indent');
    expect(editor.update.indent.untab()).toBe(true);
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
      editor.api.html.deserialize({
        element: '<p style="margin-left: 20em">Indented</p>',
      })
    ).toEqual([
      {
        children: [{ text: 'Indented' }],
        indent: 2,
        type: 'paragraph',
      },
    ]);
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

    editor.update.indent.change();

    expect(editor.read.children()[0]).toMatchObject({ indent: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyIndent');

    expect(editor.update.indent.untab()).toBe(true);
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

    writeHostFragmentData(
      editor,
      {
        setData: (format, value) => serialized.set(format, value),
      },
      ContentSlice.closed(editor.read.children())
    );
    const html = serialized.get('text/html');

    if (!html) throw new Error('Missing HTML codec serialization');

    const paragraph = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.querySelector('p') as HTMLElement;

    expect(paragraph.dataset.indent).toBe('2');
    expect(paragraph.style.marginLeft).toBe('20em');
    expect(editor.api.html.deserialize({ element: html })).toEqual([
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
          defineBasePlugin('quote', {
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
