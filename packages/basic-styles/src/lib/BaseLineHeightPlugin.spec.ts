import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseLineHeightPlugin } from './BaseLineHeightPlugin';

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and bound setNodes transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseLineHeightPlugin);
    const transforms = editor.getTransforms(BaseLineHeightPlugin) as any;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    });
    expect(typeof (editor as any).tf.lineHeight?.setNodes).toBe('function');
    expect(typeof transforms.lineHeight.setNodes).toBe('function');
  });

  it('parses line-height styles through the injected target plugin deserializer', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseLineHeightPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      editor,
      plugin,
    } as any);
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;

    expect(
      parse({
        element: {
          style: { lineHeight: '2' },
        },
      } as any)
    ).toEqual({
      [editor.getType(KEYS.lineHeight)]: '2',
    });
  });

  it('applies and clears line height through the shared transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
      value: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    } as any);

    (editor as any).tf.lineHeight.setNodes(2, { at: [] });
    expect((editor.children[0] as any).lineHeight).toBe(2);

    (editor as any).tf.lineHeight.setNodes(1.5, { at: [] });
    expect((editor.children[0] as any).lineHeight).toBeUndefined();
  });
});
