import React from 'react';

import { PlateTest, createPlateEditor } from '@platejs/core/react';
import { act, render } from '@testing-library/react';

import { makeClientRect } from './makeClientRect';
import { createVirtualRef } from './createVirtualRef';

describe('createVirtualRef', () => {
  const originalRangeGetBoundingClientRect =
    globalThis.Range.prototype.getBoundingClientRect;

  afterEach(() => {
    globalThis.Range.prototype.getBoundingClientRect =
      originalRangeGetBoundingClientRect;
  });

  it('returns the computed bounding rect for the given editor location', async () => {
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const rect = makeClientRect({
      bottom: 16,
      left: 3,
      right: 11,
      top: 2,
    });
    const editor = createPlateEditor({
      selection,
      value: [{ children: [{ text: 'a' }], type: 'p' }],
    });

    await act(async () => {
      render(
        React.createElement(PlateTest, {
          editableProps: { autoFocus: false },
          editor,
        })
      );
    });
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(
      createVirtualRef(editor).current!.getBoundingClientRect()
    ).toMatchObject(rect);
  });

  it('uses the fallback rect when no DOM rect can be computed', () => {
    const fallbackRect = makeClientRect({
      bottom: 12,
      left: 1,
      right: 9,
      top: 0,
    });
    const editor = createPlateEditor();

    expect(
      createVirtualRef(editor, undefined, {
        fallbackRect,
      }).current!.getBoundingClientRect()
    ).toMatchObject(fallbackRect);
  });

  it('throws when neither a computed rect nor a fallback rect exists', () => {
    const editor = createPlateEditor();

    expect(() =>
      createVirtualRef(editor).current!.getBoundingClientRect()
    ).toThrow(
      'Could not get the bounding client rect of the location. Please provide a fallbackRect.'
    );
  });
});
