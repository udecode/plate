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
    } as any);
    const plugin = editor.getPlugin(BaseTagPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });

    (editor.tf as any).insert.tag({ value: 'alpha' } as any);

    const children = (editor.children[0] as any).children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      type: KEYS.tag,
      value: 'alpha',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });
});
