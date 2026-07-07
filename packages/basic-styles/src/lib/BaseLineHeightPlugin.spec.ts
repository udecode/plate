import {
  BaseParagraphPlugin,
  createBaseEditor,
  getEditorPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseLineHeightPlugin } from './BaseLineHeightPlugin';

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });
    const plugin = editor.getPlugin(BaseLineHeightPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    });
    expect(typeof editor.update.lineHeight.set).toBe('function');
  });

  it('parses line-height styles through the injected target plugin deserializer', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });
    const plugin = editor.getPlugin(BaseLineHeightPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      ...getEditorPlugin(editor, plugin),
      targetPlugin: KEYS.p,
    });
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;

    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { lineHeight: '2' },
        } as HTMLElement,
        node: {},
      })
    ).toEqual({
      [editor.getType(KEYS.lineHeight)]: '2',
    });
  });

  it('applies and clears line height through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor.update.lineHeight.set(2);
    expect(editor.read.children()[0]).toMatchObject({ lineHeight: 2 });

    editor.update.lineHeight.set(1.5);
    expect(editor.read.children()[0]).not.toHaveProperty('lineHeight');
  });
});
