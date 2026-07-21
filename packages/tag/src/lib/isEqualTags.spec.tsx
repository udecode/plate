import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTagPlugin } from './BaseTagPlugin';
import { isEqualTags } from './isEqualTags';

describe('isEqualTags', () => {
  it('treats matching tag values as equal regardless of order', () => {
    const editor = createBaseEditor({
      plugins: [BaseTagPlugin],
      value: [
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

    expect(isEqualTags(editor, [{ value: 'beta' }, { value: 'alpha' }])).toBe(
      true
    );
  });

  it('returns false for different tag sets and true for empty ones', () => {
    const editor = createBaseEditor({
      plugins: [BaseTagPlugin],
      value: [
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
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    expect(isEqualTags(editor, [{ value: 'beta' }])).toBe(false);
    expect(isEqualTags(emptyEditor)).toBe(true);
  });
});
