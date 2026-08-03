import React from 'react';

import { createPlateEditor } from '@platejs/core/react';
import { PlateTest } from '@platejs/core/react/test';
import type { Range } from '@platejs/plite';
import { act, render } from '@testing-library/react';

import {
  getCaretPosition,
  getCursorOverlayState,
  getSelectionRects,
} from './cursorGeometry';

const collapsedRange = {
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 0, path: [0, 0] },
} satisfies Range;

const createRectList = (rects: DOMRect[]) =>
  Object.assign(rects, {
    item: (index: number) => rects[index] ?? null,
  });

describe('cursor geometry', () => {
  describe('caret position', () => {
    const rects = [
      { height: 10, left: 5, top: 1, width: 4 },
      { height: 12, left: 20, top: 3, width: 6 },
    ];

    it('returns null without an anchor rect', () => {
      expect(getCaretPosition([], collapsedRange)).toBeNull();
    });

    it('uses the trailing edge for forward expanded selections', () => {
      expect(
        getCaretPosition(rects, {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 1] },
        })
      ).toEqual({
        height: 12,
        left: 26,
        top: 3,
      });
    });

    it('uses the leading edge for backward or collapsed selections', () => {
      expect(
        getCaretPosition(rects, {
          anchor: { offset: 2, path: [0, 1] },
          focus: { offset: 0, path: [0, 0] },
        })
      ).toEqual({
        height: 10,
        left: 5,
        top: 1,
      });
      expect(
        getCaretPosition(rects, {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 0, path: [0, 1] },
        })
      ).toEqual({
        height: 12,
        left: 20,
        top: 3,
      });
    });
  });

  describe('overlay state', () => {
    it('returns an empty list without cursors', () => {
      expect(
        getCursorOverlayState({ cursors: undefined, selectionRects: {} })
      ).toEqual([]);
    });

    it('attaches rects and caret positions per cursor', () => {
      const selection = {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 1] },
      } as const;

      expect(
        getCursorOverlayState({
          cursors: {
            a: { data: { name: 'A' }, selection },
            b: { data: { name: 'B' }, selection: null },
          },
          selectionRects: {
            a: [{ height: 10, left: 1, top: 2, width: 3 }],
          },
        })
      ).toEqual([
        {
          caretPosition: { height: 10, left: 4, top: 2 },
          data: { name: 'A' },
          id: 'a',
          selection,
          selectionRects: [{ height: 10, left: 1, top: 2, width: 3 }],
        },
        {
          caretPosition: null,
          data: { name: 'B' },
          id: 'b',
          selection: null,
          selectionRects: [],
        },
      ]);
    });
  });

  describe('selection rects', () => {
    const originalRangeGetClientRects =
      globalThis.Range.prototype.getClientRects;

    afterEach(() => {
      globalThis.Range.prototype.getClientRects = originalRangeGetClientRects;
    });

    it('returns an empty array when the editor cannot create a DOM range', () => {
      const editor = createPlateEditor();

      expect(
        getSelectionRects(editor, {
          range: collapsedRange,
          xOffset: 0,
          yOffset: 0,
        })
      ).toEqual([]);
    });

    it('returns an empty array when a mapped DOM text node is detached', async () => {
      const editor = createPlateEditor({
        initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
      });

      await act(async () => {
        render(
          React.createElement(PlateTest, {
            editableProps: { autoFocus: false },
            editor,
          })
        );
      });

      const textNode = editor.read.nodes.get([0, 0])?.[0];

      if (!textNode) throw new TypeError('Expected a text node');

      const domNode = editor.api.dom.resolveDOMNode(textNode);

      if (!domNode) throw new TypeError('Expected a mapped DOM node');

      await act(async () => {
        domNode.remove();
      });

      expect(
        getSelectionRects(editor, {
          range: collapsedRange,
          xOffset: 0,
          yOffset: 0,
        })
      ).toEqual([]);
    });

    it('collects start, middle, and end rects with offsets applied', async () => {
      const editor = createPlateEditor({
        initialValue: [
          { children: [{ text: 'a' }], type: 'paragraph' },
          { children: [{ text: 'b' }], type: 'paragraph' },
          { children: [{ text: 'c' }], type: 'paragraph' },
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

      const startText = editor.read.nodes.get([0, 0])?.[0];
      const middleText = editor.read.nodes.get([1, 0])?.[0];
      const endText = editor.read.nodes.get([2, 0])?.[0];

      if (!startText || !middleText || !endText) {
        throw new TypeError('Expected three text nodes');
      }

      const startDomNode = editor.api.dom.resolveDOMNode(startText);
      const middleDomNode = editor.api.dom.resolveDOMNode(middleText);
      const endDomNode = editor.api.dom.resolveDOMNode(endText);

      if (!startDomNode || !middleDomNode || !endDomNode) {
        throw new TypeError('Expected three mapped DOM nodes');
      }

      middleDomNode.getClientRects = () =>
        createRectList([new DOMRect(30, 40, 12, 8)]);
      globalThis.Range.prototype.getClientRects = function () {
        if (startDomNode.contains(this.startContainer)) {
          return createRectList([new DOMRect(10, 20, 5, 9)]);
        }
        if (endDomNode.contains(this.endContainer)) {
          return createRectList([new DOMRect(50, 60, 7, 11)]);
        }

        return createRectList([]);
      };

      expect(
        getSelectionRects(editor, {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [2, 0] },
          },
          xOffset: 2,
          yOffset: 3,
        })
      ).toEqual([
        { height: 9, left: 8, top: 17, width: 5 },
        { height: 8, left: 28, top: 37, width: 12 },
        { height: 11, left: 48, top: 57, width: 7 },
      ]);
    });
  });
});
