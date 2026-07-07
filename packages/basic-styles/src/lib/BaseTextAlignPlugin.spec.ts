import {
  BaseParagraphPlugin,
  createBaseEditor,
  getEditorPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.getPlugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect(typeof editor.update.textAlign.set).toBe('function');
  });

  it('parses text-align styles through the injected target plugin deserializer', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.getPlugin(BaseTextAlignPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      ...getEditorPlugin(editor, plugin),
      targetPlugin: KEYS.p,
    });
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;
    const node: Record<string, unknown> = {};

    parse({
      ...getEditorPlugin(editor, plugin),
      element: {
        style: { textAlign: 'center' },
      } as HTMLElement,
      node,
    });

    expect(node).toEqual({
      [editor.getType(KEYS.textAlign)]: 'center',
    });
  });

  it('applies and clears text alignment through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
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
    const nodeKey = editor.getType(KEYS.textAlign);

    editor.update.textAlign.set('center');
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 'center' });

    editor.update.textAlign.set('start');
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });
});
