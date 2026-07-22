import React from 'react';

import { createPlateEditor } from '@platejs/core/react';
import { PlateTest } from '@platejs/core/react/test';
import type { TextSelection } from '@platejs/plite';
import { act, render } from '@testing-library/react';

import { makeClientRect } from './makeClientRect';
import { getBoundingClientRect } from './getBoundingClientRect';

describe('getBoundingClientRect', () => {
  const originalRangeGetBoundingClientRect =
    globalThis.Range.prototype.getBoundingClientRect;

  afterEach(() => {
    globalThis.Range.prototype.getBoundingClientRect =
      originalRangeGetBoundingClientRect;
  });

  it('uses the current selection when no location is provided', async () => {
    const selection = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;
    const rect = makeClientRect({
      bottom: 20,
      left: 10,
      right: 40,
      top: 5,
    });
    const editor = createPlateEditor({
      selection,
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
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

    expect(getBoundingClientRect(editor)).toMatchObject(rect);
  });

  it('merges the DOM rects for multiple explicit locations', async () => {
    const rectA = makeClientRect({
      bottom: 20,
      left: 10,
      right: 40,
      top: 10,
    });
    const rectB = makeClientRect({
      bottom: 25,
      left: 5,
      right: 50,
      top: 5,
    });
    const editor = createPlateEditor({
      initialValue: [
        { children: [{ text: 'a' }], type: 'p' },
        { children: [{ text: 'b' }], type: 'p' },
      ],
    });

    await act(async () => {
      render(
        React.createElement(PlateTest, {
          editableProps: { autoFocus: false },
          editor,
        })
      );
    });
    let rectIndex = 0;
    globalThis.Range.prototype.getBoundingClientRect = () =>
      [rectA, rectB][rectIndex++]!;

    expect(getBoundingClientRect(editor, [[0], [1]])).toMatchObject({
      bottom: 25,
      left: 5,
      right: 50,
      top: 5,
    });
  });

  it('returns undefined when there is no selection or DOM range', () => {
    const editor = createPlateEditor();

    expect(getBoundingClientRect(editor)).toBeUndefined();
  });
});
