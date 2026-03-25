import { createSlateEditor, KEYS } from 'platejs';

import { isEqualTags } from './isEqualTags';

describe('isEqualTags', () => {
  it('treats matching tag values as equal regardless of order', () => {
    const editor = createSlateEditor({
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
    } as any);

    expect(
      isEqualTags(editor, [{ value: 'beta' }, { value: 'alpha' }] as any)
    ).toBe(true);
  });

  it('returns false for different tag sets and true for empty ones', () => {
    const editor = createSlateEditor({
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
    } as any);
    const emptyEditor = createSlateEditor({
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);

    expect(isEqualTags(editor, [{ value: 'beta' }] as any)).toBe(false);
    expect(isEqualTags(emptyEditor)).toBe(true);
  });
});
