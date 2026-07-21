import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTogglePlugin } from '../BaseTogglePlugin';
import { someToggle } from './someToggle';

describe('someToggle', () => {
  it('returns false when the editor has no selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    expect(someToggle(editor)).toBe(false);
  });

  it('returns true when the current selection is inside a toggle node', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'one' }],
          type: KEYS.toggle,
        },
        { children: [{ text: 'two' }], type: 'p' },
      ],
    });

    expect(someToggle(editor)).toBe(true);
  });

  it('returns false when the selection is outside toggle content', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [1, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: 'one' }],
          type: KEYS.toggle,
        },
        { children: [{ text: 'two' }], type: 'p' },
      ],
    });

    expect(someToggle(editor)).toBe(false);
  });
});
