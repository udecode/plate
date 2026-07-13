import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTagPlugin } from './BaseTagPlugin';

describe('BaseTagPlugin', () => {
  it('configures inline void tags and inserts them into text content', () => {
    const editor = createBaseEditor({
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

    editor.update.tag.insert({ value: 'alpha' });

    const children = editor.read.children()[0].children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      type: KEYS.tag,
      value: 'alpha',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });
});
