import React from 'react';

import { PlateTest, createPlateEditor } from '@platejs/core/react';
import { act, render } from '@testing-library/react';

import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getRangeBoundingClientRect } from './getRangeBoundingClientRect';

describe('getRangeBoundingClientRect', () => {
  const originalRangeGetBoundingClientRect =
    globalThis.Range.prototype.getBoundingClientRect;

  afterEach(() => {
    globalThis.Range.prototype.getBoundingClientRect =
      originalRangeGetBoundingClientRect;
  });

  it('returns the default rect when the range is null', () => {
    const editor = createPlateEditor();

    expect(getRangeBoundingClientRect(editor, null)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the default rect when toDOMRange fails', () => {
    const editor = createPlateEditor();
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    expect(getRangeBoundingClientRect(editor, range)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the DOM range rect when available', async () => {
    const rect = makeClientRect({
      bottom: 30,
      left: 12,
      right: 32,
      top: 8,
    });
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'a' }], type: 'p' }],
    });
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    await act(async () => {
      render(
        React.createElement(PlateTest, {
          editableProps: { autoFocus: false },
          editor,
        })
      );
    });
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(getRangeBoundingClientRect(editor, range)).toEqual(rect);
  });
});
