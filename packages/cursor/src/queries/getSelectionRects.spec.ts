import React from 'react';

import type { Range } from '@platejs/plite';

import { PlateTest, createPlateEditor } from '@platejs/core/react';
import { act, render } from '@testing-library/react';

import { getSelectionRects } from './getSelectionRects';

const collapsedRange = {
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 0, path: [0, 0] },
} satisfies Range;

const createRectList = (rects: DOMRect[]) =>
  Object.assign(rects, {
    item: (index: number) => rects[index] ?? null,
  });

describe('getSelectionRects', () => {
  const originalRangeGetClientRects = globalThis.Range.prototype.getClientRects;

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

    const textNode = editor.read.nodes.get([0, 0])?.[0];

    if (!textNode) throw new TypeError('Expected a text node');

    const domNode = editor.api.dom.resolveDOMNode(textNode);

    if (!domNode) throw new TypeError('Expected a mapped DOM node');

    domNode.remove();

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
      value: [
        { children: [{ text: 'a' }], type: 'p' },
        { children: [{ text: 'b' }], type: 'p' },
        { children: [{ text: 'c' }], type: 'p' },
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

    const startDomText = startDomNode.firstChild;
    const endDomText = endDomNode.firstChild;

    if (!startDomText || !endDomText) {
      throw new TypeError('Expected mapped DOM text');
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
