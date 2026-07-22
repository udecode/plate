import React from 'react';

import { createPlateEditor } from '@platejs/core/react';
import { PlateTest } from '@platejs/core/react/test';
import type { TextSelection } from '@platejs/plite';
import { act, render } from '@testing-library/react';

import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getSelectionBoundingClientRect } from './getSelectionBoundingClientRect';

describe('getSelectionBoundingClientRect', () => {
  const originalRangeGetBoundingClientRect =
    globalThis.Range.prototype.getBoundingClientRect;

  afterEach(() => {
    globalThis.Range.prototype.getBoundingClientRect =
      originalRangeGetBoundingClientRect;
  });

  it('returns the default rect for a collapsed selection', () => {
    const selection = {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;
    const editor = createPlateEditor({
      selection,
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });

    expect(getSelectionBoundingClientRect(editor)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the expanded selection rect', async () => {
    const rect = makeClientRect({
      bottom: 24,
      left: 6,
      right: 28,
      top: 4,
    });
    const selection = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    } satisfies TextSelection;
    const editor = createPlateEditor({
      selection,
      initialValue: [{ children: [{ text: 'ab' }], type: 'p' }],
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

    expect(getSelectionBoundingClientRect(editor)).toEqual(rect);
  });
});
