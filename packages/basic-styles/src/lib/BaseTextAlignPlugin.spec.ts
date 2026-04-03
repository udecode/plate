import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and bound setNodes transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTextAlignPlugin);
    const transforms = editor.getTransforms(BaseTextAlignPlugin) as any;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect(typeof (editor as any).tf.textAlign?.setNodes).toBe('function');
    expect(typeof transforms.textAlign.setNodes).toBe('function');
  });

  it('parses text-align styles through the injected target plugin deserializer', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTextAlignPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      editor,
      plugin,
    } as any);
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;
    const node: Record<string, unknown> = {};

    parse({
      element: {
        style: { textAlign: 'center' },
      },
      node,
    } as any);

    expect(node).toEqual({
      [editor.getType(KEYS.textAlign)]: 'center',
    });
  });

  it('applies and clears text alignment through the shared transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
      value: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    } as any);
    const nodeKey = editor.getType(KEYS.textAlign);

    (editor as any).tf.textAlign.setNodes('center', { at: [] });
    expect((editor.children[0] as any)[nodeKey]).toBe('center');

    (editor as any).tf.textAlign.setNodes('start', { at: [] });
    expect((editor.children[0] as any)[nodeKey]).toBeUndefined();
  });
});
