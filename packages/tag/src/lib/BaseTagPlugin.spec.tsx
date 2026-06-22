import { createSlateEditor, KEYS } from 'platejs';

import { BaseTagPlugin } from './BaseTagPlugin';

describe('BaseTagPlugin', () => {
  it('configures inline void tags and inserts them into text content', () => {
    const editor = createSlateEditor({
      plugins: [BaseTagPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BaseTagPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });

    editor.tf.insert.tag({ value: 'alpha' });

    const children = editor.children[0].children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      type: KEYS.tag,
      value: 'alpha',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('exposes an inferred tag transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BaseTagPlugin],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update((tx) => tx.tag.insert({ value: 'beta' }, { at: [0, 1] }));

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: 'hello' },
        {
          children: [{ text: '' }],
          type: KEYS.tag,
          value: 'beta',
        },
        { text: '' },
      ],
      type: 'p',
    });
  });
});
