import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
} from '@platejs/core';
import {
  ContentSlice,
  EditorSchemaValidationError,
  property,
  schema,
  target,
} from '@platejs/plite';
import { getExtensionRegistry } from '@platejs/plite/internal';
import { KEYS } from '@platejs/utils';

import { BaseIndentPlugin } from './BaseIndentPlugin';

const serializeHtml = (editor: Parameters<typeof getExtensionRegistry>[0]) => {
  type Registration = {
    codec: {
      format: string;
      serialize?: (context: {
        format: string;
        slice: ContentSlice;
        state: typeof editor.read;
      }) => null | string;
    };
  };

  const registrations = (getExtensionRegistry(editor).capabilities.get(
    'host.codecs'
  ) ?? []) as readonly Registration[];
  const codec = registrations.find(
    (registration) => registration.codec.format === 'text/html'
  )?.codec;

  if (!codec?.serialize) throw new Error('Missing HTML codec serializer');

  return codec.serialize({
    format: 'text/html',
    slice: ContentSlice.closed(editor.read.children()),
    state: editor.read,
  });
};

const TestIndentPropsPlugin = createBasePlugin({
  key: 'testIndentProps',
  schema: {
    properties: [
      schema.elementProperty('foo', property.string(), {
        target: target.group('block'),
      }),
    ],
  },
});

describe('BaseIndentPlugin', () => {
  it('exposes the default state and injected node-prop contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseIndentPlugin);
    const nodeProps = editor.getInjectProps(BaseIndentPlugin);

    expect(editor.plugin(BaseIndentPlugin).store.get()).toEqual({
      offset: 24,
      unit: 'px',
    });
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(nodeProps.nodeKey).toBe('indent');
    expect(nodeProps.styleKey).toBe('marginLeft');
    expect(
      nodeProps.transformNodeValue!({
        ...getEditorPlugin(editor, plugin),
        nodeValue: 2,
      })
    ).toBe('48px');
  });

  it('changes block indent through typed tx groups', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, TestIndentPropsPlugin],
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: KEYS.p,
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          type: KEYS.p,
        },
      ],
    });

    editor.update.indent.set({
      nodes: { at: [] },
      setNodeProps: ({ indent }) => ({ foo: `indent-${indent}` }),
    });

    expect(editor.read.children()).toMatchObject([
      {
        foo: 'indent-1',
        indent: 1,
        type: KEYS.p,
      },
      {
        foo: 'indent-2',
        indent: 2,
        type: KEYS.p,
      },
    ]);

    editor.update.indent.decrease({
      nodes: { at: [] },
      unsetNodeProps: ['foo'],
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'One' }],
        type: KEYS.p,
      },
      {
        foo: 'indent-2',
        indent: 1,
        type: KEYS.p,
      },
    ]);
  });

  it('uses configured targets for both model validation and injection', () => {
    const QuotePlugin = createBasePlugin({
      key: 'quote',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'callout',
    });
    const IndentQuotePlugin = BaseIndentPlugin.configure({
      targetPluginKeys: ['quote'],
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, QuotePlugin, IndentQuotePlugin],
      initialValue: [
        {
          children: [{ text: 'Quote' }],
          indent: 1,
          type: 'callout',
        },
      ],
    });

    expect(editor.getPlugin(BaseIndentPlugin).targetPluginKeys).toEqual([
      'quote',
    ]);
    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      type: 'callout',
    });
    let thrown: unknown;

    try {
      editor.read.schema.validateFragment([
        { children: [{ text: 'Paragraph' }], indent: 1, type: KEYS.p },
      ]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(EditorSchemaValidationError);
    if (!(thrown instanceof EditorSchemaValidationError)) throw thrown;
    expect(thrown.diagnostics).toMatchObject([
      {
        code: 'property-target-mismatch',
        nodeType: KEYS.p,
        property: { key: 'indent' },
      },
    ]);
  });

  it('routes tab and untab through typed tx groups', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'One' }], type: KEYS.p }],
    });

    expect(editor.update.indent.tab()).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({ indent: 1 });

    expect(editor.update.indent.untab()).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('indent');
  });

  it('decodes CSS indentation through configured units', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
      type: 'depth',
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="margin-left: 20em">Indented</p>',
      })
    ).toEqual([
      {
        children: [{ text: 'Indented' }],
        depth: 2,
        type: KEYS.p,
      },
    ]);
  });

  it('uses the resolved plugin type as its sole storage key', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyIndent',
        },
      },
      type: 'depth',
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          depth: 1,
          type: KEYS.p,
        },
      ],
    });

    editor.update.indent.set();

    expect(editor.read.children()[0]).toMatchObject({ depth: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyIndent');

    expect(editor.update.indent.untab()).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({ depth: 1 });
  });

  it('round-trips configured indent values through HTML', () => {
    const IndentPlugin = BaseIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
      type: 'depth',
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, IndentPlugin],
      initialValue: [
        {
          children: [{ text: 'Indented' }],
          depth: 2,
          type: KEYS.p,
        },
      ],
    });
    const html = serializeHtml(editor);

    expect(html).not.toBeNull();

    const paragraph = new DOMParser()
      .parseFromString(html!, 'text/html')
      .body.querySelector('p') as HTMLElement;

    expect(paragraph.dataset.indent).toBe('2');
    expect(paragraph.style.marginLeft).toBe('20em');
    expect(editor.api.html.deserialize({ element: html! })).toEqual([
      ...editor.read.children(),
    ]);
  });
});
