import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTagPlugin } from './BaseTagPlugin';

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
