import { createSlateEditor, KEYS } from 'platejs';

import { BaseMentionInputPlugin, BaseMentionPlugin } from './BaseMentionPlugin';

describe('BaseMentionPlugin', () => {
  it('configures mention defaults and inserts markable void mention nodes', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    } as any);
    const plugin = editor.getPlugin(BaseMentionPlugin);
    const inputPlugin = editor.getPlugin(BaseMentionInputPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    });
    expect(plugin.options.trigger).toBe('@');
    expect(plugin.options.createComboboxInput?.('@')).toEqual({
      children: [{ text: '' }],
      trigger: '@',
      type: KEYS.mentionInput,
    });
    expect(inputPlugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });

    (editor.tf as any).insert.mention({ key: 'u1', value: 'Ada' } as any);

    const children = (editor.children[0] as any).children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });
});
