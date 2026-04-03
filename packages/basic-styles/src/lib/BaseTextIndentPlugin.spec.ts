import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseTextIndentPlugin } from './BaseTextIndentPlugin';

describe('BaseTextIndentPlugin', () => {
  it('exposes the default injected block contract', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTextIndentPlugin);
    const nodeProps = plugin.inject.nodeProps!;
    const transformNodeValue = nodeProps.transformNodeValue!;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(nodeProps).toMatchObject({
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
    });
    expect(
      transformNodeValue({
        getOptions: () => editor.getOptions(BaseTextIndentPlugin),
        nodeValue: 2,
      } as any)
    ).toBe('48px');
  });

  it('uses configured offset and unit when formatting node values', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      options: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, TextIndentPlugin],
    } as any);
    const plugin = editor.getPlugin(TextIndentPlugin);
    const nodeProps = plugin.inject.nodeProps!;

    expect(
      nodeProps.transformNodeValue!({
        getOptions: () => editor.getOptions(TextIndentPlugin),
        nodeValue: 3,
      } as any)
    ).toBe('30em');
  });

  it('applies and clears text indent through node updates', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
      value: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    } as any);
    const nodeKey = editor.getType(KEYS.textIndent);

    editor.tf.setNodes({ [nodeKey]: 2 }, { at: [0] });
    expect((editor.children[0] as any)[nodeKey]).toBe(2);

    editor.tf.unsetNodes(nodeKey, { at: [0] });
    expect((editor.children[0] as any)[nodeKey]).toBeUndefined();
  });
});
