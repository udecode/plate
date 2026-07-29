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
    const tagProps = { ignored: true, value: 'alpha' };

    expect(editor.read.schema.isInline(tag)).toBe(true);
    expect(editor.read.schema.isVoid(tag)).toBe(true);
    expect(editor.read.schema.property(BaseTagPlugin)?.value.kind).toBe(
      'string'
    );

    editor.update.tag.insert(tagProps);

    const children = editor.read.children()[0].children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toEqual({
      children: [{ text: '' }],
      type: KEYS.tag,
      value: 'alpha',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });
});

describe('BaseTagPlugin.read', () => {
  it('treats matching tag values as equal regardless of order', () => {
    const editor = createBaseEditor({
      plugins: [BaseTagPlugin],
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.tag,
              value: 'alpha',
            },
            { text: ' ' },
            {
              children: [{ text: '' }],
              type: KEYS.tag,
              value: 'beta',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    expect(
      editor
        .plugin(BaseTagPlugin)
        .read.isEqual([{ value: 'beta' }, { value: 'alpha' }])
    ).toBe(true);
  });

  it('returns false for different tag sets and true for empty ones', () => {
    const editor = createBaseEditor({
      plugins: [BaseTagPlugin],
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.tag,
              value: 'alpha',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });
    const emptyEditor = createBaseEditor({
      plugins: [BaseTagPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    expect(editor.plugin(BaseTagPlugin).read.isEqual([{ value: 'beta' }])).toBe(
      false
    );
    expect(emptyEditor.plugin(BaseTagPlugin).read.isEqual()).toBe(true);
  });
});
