import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTagPlugin } from './BaseTagPlugin';

describe('BaseTagPlugin', () => {
  it('configures inline void tags and inserts them into text content', () => {
    const editor = createBaseEditor({
      plugins: [BaseTagPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });
    const tag = { children: [{ text: '' }], type: KEYS.tag };

    expect(editor.read.schema.isInline(tag)).toBe(true);
    expect(editor.read.schema.isVoid(tag)).toBe(true);
    expect(editor.read.schema.property(BaseTagPlugin)?.value.kind).toBe(
      'string'
    );

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
