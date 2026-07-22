import type { BaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import type { Value } from '@platejs/plite';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import {
  getTableMoveSelectionContext,
  shouldMoveSelectionFromCell,
} from './shouldMoveSelectionFromCell';

type RectInit = Pick<DOMRect, 'bottom' | 'height' | 'top'>;

const createRect = ({ bottom, height, top }: RectInit) =>
  ({
    bottom,
    height,
    top,
  }) as DOMRect;

const createEditor = ({
  blockRange = { anchor: 'block-start', focus: 'block-end' },
  blockRects = [],
  caretRects = [],
  isEnd = false,
  isStart = false,
}: {
  blockRange?: { anchor: unknown; focus: unknown } | null;
  blockRects?: DOMRect[];
  caretRects?: DOMRect[];
  isEnd?: boolean;
  isStart?: boolean;
}) =>
  ({
    api: {
      dom: {
        resolveDOMRange: (range: unknown) => {
          if (range === blockRange) {
            return {
              getClientRects: () => blockRects,
            };
          }

          return {
            getClientRects: () => caretRects,
          };
        },
      },
    },
    read: {
      points: {
        isEnd: () => isEnd,
        isStart: () => isStart,
      },
      ranges: {
        get: () => blockRange,
      },
    },
  }) as unknown as BaseEditor;

describe('shouldMoveSelectionFromCell', () => {
  const blockPath = [0, 0, 0, 0];
  const point = { offset: 2, path: [0, 0, 0, 0, 0] };

  it('falls back to block-end checks when the block range is missing', () => {
    const editor = createEditor({ blockRange: null, isEnd: true });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: false })
    ).toBe(true);
  });

  it('falls back to block-start checks when DOM rects are unavailable', () => {
    const editor = createEditor({ isStart: true });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: true })
    ).toBe(true);
  });

  it('keeps downward movement inside the cell until the caret reaches the last visual line', () => {
    const editor = createEditor({
      blockRects: [createRect({ top: 10, bottom: 20, height: 10 })],
      caretRects: [createRect({ top: 12, bottom: 18, height: 6 })],
      isEnd: true,
    });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: false })
    ).toBe(false);
  });

  it('allows downward movement once the caret reaches the last visual line tolerance', () => {
    const editor = createEditor({
      blockRects: [createRect({ top: 10, bottom: 20, height: 10 })],
      caretRects: [createRect({ top: 15, bottom: 19, height: 4 })],
      isEnd: false,
    });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: false })
    ).toBe(true);
  });

  it('keeps upward movement inside the cell until the caret reaches the first visual line', () => {
    const editor = createEditor({
      blockRects: [createRect({ top: 10, bottom: 20, height: 10 })],
      caretRects: [createRect({ top: 12, bottom: 16, height: 4 })],
      isStart: true,
    });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: true })
    ).toBe(false);
  });

  it('allows upward movement once the caret reaches the first visual line tolerance', () => {
    const editor = createEditor({
      blockRects: [createRect({ top: 10, bottom: 20, height: 10 })],
      caretRects: [createRect({ top: 11, bottom: 15, height: 4 })],
      isStart: false,
    });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: true })
    ).toBe(true);
  });

  it('ignores zero-height client rects when checking visual boundaries', () => {
    const editor = createEditor({
      blockRects: [
        createRect({ top: 0, bottom: 0, height: 0 }),
        createRect({ top: 10, bottom: 20, height: 10 }),
      ],
      caretRects: [
        createRect({ top: 0, bottom: 0, height: 0 }),
        createRect({ top: 15, bottom: 19, height: 4 }),
      ],
    });

    expect(
      shouldMoveSelectionFromCell(editor, { blockPath, point, reverse: false })
    ).toBe(true);
  });

  it('does not resolve a cell context for a selection spanning cells', () => {
    const editor = createPlateEditor<Value>({
      plugins: getTestTablePlugins(),
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 1, 0, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  children: [{ type: 'p', children: [{ text: 'one' }] }],
                },
                {
                  type: 'td',
                  children: [{ type: 'p', children: [{ text: 'two' }] }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(getTableMoveSelectionContext(editor)).toBeUndefined();
  });
});
