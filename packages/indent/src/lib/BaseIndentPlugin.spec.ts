import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
} from '@platejs/core';
import {
  EditorSchemaValidationError,
  property,
  schema,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseIndentPlugin } from './BaseIndentPlugin';

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
  it('exposes the default options and injected node-prop contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseIndentPlugin);
    const nodeProps = editor.getInjectProps(BaseIndentPlugin);

    expect(editor.plugin(BaseIndentPlugin).getOptions()).toEqual({
      offset: 24,
      unit: 'px',
    });
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(nodeProps.nodeKey).toBe('indent');
    expect(nodeProps.styleKey).toBe('marginLeft');
    expect(
      nodeProps.transformNodeValue!({
        ...getEditorPlugin(editor, plugin),
        getOptions: () => editor.plugin(BaseIndentPlugin).getOptions(),
        nodeValue: 2,
      })
    ).toBe('48px');
  });

  it('changes block indent through typed tx groups', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, TestIndentPropsPlugin],
      value: [
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
      value: [
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
      value: [{ children: [{ text: 'One' }], type: KEYS.p }],
    });

    expect(editor.update.indent.tab()).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({ indent: 1 });

    expect(editor.update.indent.untab()).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('indent');
  });
});
