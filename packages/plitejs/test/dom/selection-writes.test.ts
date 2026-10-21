import { describe, expect, test } from 'bun:test';

import { JSDOM } from 'jsdom';

import {
  type DOMSelectionPoints,
  readDOMSelectionRange,
  readDOMSelectionRecord,
  writeDOMSelection,
} from '../../src/dom/utils/selection-writes';

// Points are compared as offsets into the one text node, because a deep
// equality check on DOM nodes would accept a different node and print the
// whole document tree on failure.
const setup = () => {
  const { document } = new JSDOM('<!doctype html><p>abcdef</p>').window;
  const selection = document.getSelection()!;
  const text = document.querySelector('p')!.firstChild!;
  const offset = ([node, value]: readonly [Node | null, number]) =>
    node === text ? value : 'outside the text';
  const offsets = (points: DOMSelectionPoints | null) =>
    points && { anchor: offset(points.anchor), focus: offset(points.focus) };

  return {
    document,
    selection,
    at: (anchor: number, focus: number): DOMSelectionPoints => ({
      anchor: [text, anchor],
      focus: [text, focus],
    }),
    record: () => {
      const record = readDOMSelectionRecord(document);

      return (
        record && { points: offsets(record.points), source: record.source }
      );
    },
    shown: () =>
      selection.rangeCount === 0
        ? null
        : {
            anchor: offset([selection.anchorNode, selection.anchorOffset]),
            focus: offset([selection.focusNode, selection.focusOffset]),
          },
  };
};

describe('writeDOMSelection', () => {
  test.each([
    ['forward', 1, 4],
    ['backward', 4, 1],
    ['collapsed', 2, 2],
  ])('shows and records %s points exactly as written', (_, anchor, focus) => {
    const { at, document, record, shown } = setup();

    writeDOMSelection(document, at(anchor, focus));

    expect(shown()).toEqual({ anchor, focus });
    expect(record()).toEqual({ points: { anchor, focus }, source: 'write' });
  });

  test('null clears the ranges and records no points', () => {
    const { at, document, record, shown } = setup();

    writeDOMSelection(document, at(1, 4));
    writeDOMSelection(document, null);

    expect(shown()).toBeNull();
    expect(record()).toEqual({ points: null, source: 'write' });
  });

  test('keeps the record when the selection already shows the written points', () => {
    const { at, document, record, selection, shown } = setup();

    writeDOMSelection(document, at(3, 5));
    selection.setBaseAndExtent(...at(1, 4).anchor, ...at(1, 4).focus);
    writeDOMSelection(document, at(1, 4));

    expect(shown()).toEqual({ anchor: 1, focus: 4 });
    expect(record()).toEqual({
      points: { anchor: 3, focus: 5 },
      source: 'write',
    });
  });
});

test('readDOMSelectionRange returns a range that moves without the selection', () => {
  const { at, document, selection, shown } = setup();

  writeDOMSelection(document, at(1, 4));
  readDOMSelectionRange(selection).collapse(true);

  expect(shown()).toEqual({ anchor: 1, focus: 4 });
});
