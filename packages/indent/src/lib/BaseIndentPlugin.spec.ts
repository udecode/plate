import {
  BaseParagraphPlugin,
  createBaseEditor,
  getEditorPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseIndentPlugin } from './BaseIndentPlugin';

describe('BaseIndentPlugin', () => {
  it('exposes the default options and injected node-prop contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseIndentPlugin);
    const nodeProps = plugin.inject.nodeProps!;

    expect(editor.getOptions(BaseIndentPlugin)).toEqual({
      offset: 24,
      unit: 'px',
    });
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(nodeProps.nodeKey).toBe('indent');
    expect(nodeProps.styleKey).toBe('marginLeft');
    expect(
      nodeProps.transformNodeValue!({
        ...getEditorPlugin(editor, plugin),
        getOptions: () => editor.getOptions(BaseIndentPlugin),
        nodeValue: 2,
      })
    ).toBe('48px');
  });

  it('changes block indent through typed tx groups', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
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

  it('routes tab and untab through typed tx groups', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: {
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
