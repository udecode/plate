import React from 'react';

import { type PlateEditor, createPlateEditor } from '@platejs/core/react';
import { PlateTest } from '@platejs/core/react/test';
import type { TextSelection } from '@platejs/plite';
import { act, render } from '@testing-library/react';

import {
  createVirtualElement,
  createVirtualRef,
  getBoundingClientRect,
  getDefaultBoundingClientRect,
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
  getSelectionBoundingClientRect,
  makeClientRect,
  mergeClientRects,
} from './geometry';

const mountEditor = async (editor: PlateEditor) => {
  await act(async () => {
    render(
      React.createElement(PlateTest, {
        editableProps: { autoFocus: false },
        editor,
      })
    );
  });
};

describe('floating geometry', () => {
  const originalRangeGetBoundingClientRect =
    globalThis.Range.prototype.getBoundingClientRect;

  afterEach(() => {
    globalThis.Range.prototype.getBoundingClientRect =
      originalRangeGetBoundingClientRect;
    window.getSelection()?.removeAllRanges();
  });

  it('creates the default offscreen virtual element', () => {
    expect(getDefaultBoundingClientRect()).toEqual({
      bottom: 9999,
      height: 0,
      left: -9999,
      right: 9999,
      top: -9999,
      width: 0,
      x: 0,
      y: 0,
    });
    expect(createVirtualElement().getBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('derives a complete DOM rect from its edges', () => {
    const rect = makeClientRect({
      bottom: 26,
      left: 5,
      right: 19,
      top: 10,
    });
    const expected = {
      bottom: 26,
      height: 16,
      left: 5,
      right: 19,
      top: 10,
      width: 14,
      x: 5,
      y: 10,
    };

    expect(rect).toMatchObject(expected);
    expect(rect.toJSON()).toEqual(expected);
  });

  it('rejects an empty rect collection', () => {
    expect(() => mergeClientRects([])).toThrow(
      'clientRects should not be empty'
    );
  });

  const rect1 = makeClientRect({
    bottom: 90,
    left: 10,
    right: 90,
    top: 10,
  });
  const mergeCases = [
    {
      expected: { bottom: 90, left: 10, right: 90, top: 10 },
      name: 'keeps one rect',
      rects: [rect1],
    },
    {
      expected: { bottom: 90, left: 0, right: 90, top: 0 },
      name: 'extends above and left',
      rects: [rect1, makeClientRect({ bottom: 5, left: 0, right: 5, top: 0 })],
    },
    {
      expected: { bottom: 90, left: 0, right: 90, top: 0 },
      name: 'merges a top-left overlap',
      rects: [
        rect1,
        makeClientRect({ bottom: 20, left: 0, right: 20, top: 0 }),
      ],
    },
    {
      expected: { bottom: 105, left: 10, right: 105, top: 10 },
      name: 'extends below and right',
      rects: [
        rect1,
        makeClientRect({ bottom: 105, left: 100, right: 105, top: 100 }),
      ],
    },
    {
      expected: { bottom: 100, left: 10, right: 100, top: 10 },
      name: 'merges a bottom-right overlap',
      rects: [
        rect1,
        makeClientRect({ bottom: 100, left: 80, right: 100, top: 80 }),
      ],
    },
    {
      expected: { bottom: 90, left: 10, right: 90, top: 10 },
      name: 'keeps the outer rect when another is contained',
      rects: [
        rect1,
        makeClientRect({ bottom: 80, left: 20, right: 80, top: 20 }),
      ],
    },
    {
      expected: { bottom: 100, left: 0, right: 100, top: 0 },
      name: 'uses an enclosing rect',
      rects: [
        rect1,
        makeClientRect({ bottom: 100, left: 0, right: 100, top: 0 }),
      ],
    },
  ];

  for (const { expected, name, rects } of mergeCases) {
    it(name, () => {
      expect(mergeClientRects(rects)).toMatchObject(expected);
    });
  }

  it('returns the default rect without a DOM selection', () => {
    const getSelection = spyOn(window, 'getSelection').mockReturnValue(null);

    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );
    getSelection.mockRestore();
  });

  it('returns the default rect when the DOM selection has no range', () => {
    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the first DOM selection range rect', () => {
    const rect = makeClientRect({
      bottom: 18,
      left: 4,
      right: 14,
      top: 2,
    });
    const selection = window.getSelection();

    if (!selection) throw new Error('DOM selection unavailable');

    const range = document.createRange();
    range.getBoundingClientRect = () => rect;
    selection.addRange(range);

    expect(getDOMSelectionBoundingClientRect()).toEqual(rect);
  });

  it('returns the default rect without a resolvable editor range', () => {
    const editor = createPlateEditor();
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;

    expect(getRangeBoundingClientRect(editor, null)).toEqual(
      getDefaultBoundingClientRect()
    );
    expect(getRangeBoundingClientRect(editor, range)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the resolved editor range rect', async () => {
    const rect = makeClientRect({
      bottom: 30,
      left: 12,
      right: 32,
      top: 8,
    });
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;

    await mountEditor(editor);
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(getRangeBoundingClientRect(editor, range)).toEqual(rect);
  });

  it('returns the default rect for a collapsed editor selection', () => {
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

  it('returns the expanded editor selection rect', async () => {
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

    await mountEditor(editor);
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(getSelectionBoundingClientRect(editor)).toEqual(rect);
  });

  it('uses the current selection when no location is provided', async () => {
    const rect = makeClientRect({
      bottom: 20,
      left: 10,
      right: 40,
      top: 5,
    });
    const selection = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;
    const editor = createPlateEditor({
      selection,
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });

    await mountEditor(editor);
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(getBoundingClientRect(editor)).toMatchObject(rect);
  });

  it('merges the DOM rects for multiple explicit locations', async () => {
    const rects = [
      makeClientRect({ bottom: 20, left: 10, right: 40, top: 10 }),
      makeClientRect({ bottom: 25, left: 5, right: 50, top: 5 }),
    ];
    const editor = createPlateEditor({
      initialValue: [
        { children: [{ text: 'a' }], type: 'p' },
        { children: [{ text: 'b' }], type: 'p' },
      ],
    });

    await mountEditor(editor);
    let rectIndex = 0;
    globalThis.Range.prototype.getBoundingClientRect = () =>
      rects[rectIndex++]!;

    expect(getBoundingClientRect(editor, [[0], [1]])).toMatchObject({
      bottom: 25,
      left: 5,
      right: 50,
      top: 5,
    });
  });

  it('returns undefined without a selection or DOM range', () => {
    expect(getBoundingClientRect(createPlateEditor())).toBeUndefined();
  });

  it('creates a virtual ref for an editor location', async () => {
    const rect = makeClientRect({
      bottom: 16,
      left: 3,
      right: 11,
      top: 2,
    });
    const selection = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } satisfies TextSelection;
    const editor = createPlateEditor({
      selection,
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });

    await mountEditor(editor);
    globalThis.Range.prototype.getBoundingClientRect = () => rect;

    expect(
      createVirtualRef(editor).current?.getBoundingClientRect()
    ).toMatchObject(rect);
  });

  it('uses a virtual-ref fallback rect', () => {
    const fallbackRect = makeClientRect({
      bottom: 12,
      left: 1,
      right: 9,
      top: 0,
    });

    expect(
      createVirtualRef(createPlateEditor(), undefined, {
        fallbackRect,
      }).current?.getBoundingClientRect()
    ).toMatchObject(fallbackRect);
  });

  it('rejects a virtual ref without computed or fallback geometry', () => {
    expect(() =>
      createVirtualRef(createPlateEditor()).current?.getBoundingClientRect()
    ).toThrow(
      'Could not get the bounding client rect of the location. Please provide a fallbackRect.'
    );
  });
});
