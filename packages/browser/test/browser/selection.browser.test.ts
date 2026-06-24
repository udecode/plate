import { expect, it } from 'vitest';

import {
  takeDOMSelectionSnapshot,
  takeEditorSelectionSnapshot,
} from '../../src/browser/selection';

it('captures DOM and editor-shaped selection snapshots for a simple editor tree', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0"><span data-plite-string>alpha</span></span>
      <span data-plite-node="text" data-plite-path="1,0"><span data-plite-string>beta</span></span>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const first = root.querySelector('[data-plite-string]')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(first, 2);
  range.setEnd(first, 4);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeDOMSelectionSnapshot(selection)).toEqual({
    anchorNodeText: 'alpha',
    anchorOffset: 2,
    focusNodeText: 'alpha',
    focusOffset: 4,
  });

  expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
    anchor: {
      path: [0, 0],
      offset: 2,
    },
    focus: {
      path: [0, 0],
      offset: 4,
    },
  });
});

it('uses Plite DOM paths for sibling text nodes inside the same element', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <div data-plite-node="element" data-plite-path="0">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-string>alpha</span>
        </span>
        <span data-plite-node="text" data-plite-path="0,1">
          <span data-plite-string>beta</span>
        </span>
      </div>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const second = root.querySelectorAll('[data-plite-string]')[1]!
    .firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(second, 1);
  range.setEnd(second, 3);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
    anchor: {
      path: [0, 1],
      offset: 1,
    },
    focus: {
      path: [0, 1],
      offset: 3,
    },
  });
});

it('fails closed instead of flattening nested text nodes without Plite DOM paths', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <div data-plite-node="element">
        <span data-plite-node="text">
          <span data-plite-string>alpha</span>
        </span>
        <span data-plite-node="text">
          <span data-plite-string>beta</span>
        </span>
      </div>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const second = root.querySelectorAll('[data-plite-string]')[1]!
    .firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(second, 1);
  range.setEnd(second, 3);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeEditorSelectionSnapshot(root, selection)).toBeNull();
});

it('normalizes zero-width DOM artifact offsets back to editor offset zero', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0">
        <span data-plite-leaf="true">
          <span data-plite-zero-width="n" data-plite-length="0">\uFEFF<br /></span>
        </span>
      </span>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const marker = root.querySelector('[data-plite-zero-width="n"]')!;
  const text = marker.firstChild as Text;
  const br = marker.querySelector('br')!;
  const selection = document.getSelection()!;

  const expectZeroWidthOffset = (node: Node, offset: number) => {
    const range = document.createRange();

    range.setStart(node, offset);
    range.setEnd(node, offset);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 0,
      },
    });
  };

  const range = document.createRange();
  range.setStart(text, 1);
  range.setEnd(text, 1);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeDOMSelectionSnapshot(selection)).toEqual({
    anchorNodeText: '\uFEFF',
    anchorOffset: 1,
    focusNodeText: '\uFEFF',
    focusOffset: 1,
  });

  expectZeroWidthOffset(text, 1);
  expectZeroWidthOffset(marker, 1);
  expectZeroWidthOffset(br, 0);
});

it('maps RTL DOM selections while preserving browser geometry direction', () => {
  document.body.innerHTML = `
    <div
      data-plite-editor="true"
      dir="rtl"
      style="font: 18px Arial; line-height: 24px; width: 240px;"
    >
      <span data-plite-node="text" data-plite-path="0,0"><span data-plite-string>אבגד</span></span>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const text = root.querySelector('[data-plite-string]')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();
  const firstCharacterRange = document.createRange();
  const lastCharacterRange = document.createRange();

  range.setStart(text, 1);
  range.setEnd(text, 3);
  selection.removeAllRanges();
  selection.addRange(range);
  firstCharacterRange.setStart(text, 0);
  firstCharacterRange.setEnd(text, 1);
  lastCharacterRange.setStart(text, 3);
  lastCharacterRange.setEnd(text, 4);

  expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
    anchor: {
      path: [0, 0],
      offset: 1,
    },
    focus: {
      path: [0, 0],
      offset: 3,
    },
  });
  expect(firstCharacterRange.getBoundingClientRect().left).toBeGreaterThan(
    lastCharacterRange.getBoundingClientRect().left
  );
});

it('keeps wrapped-line DOM rectangles tied to one editor selection', () => {
  document.body.innerHTML = `
    <div
      data-plite-editor="true"
      style="font: 16px monospace; line-height: 20px; width: 90px;"
    >
      <span data-plite-node="text" data-plite-path="0,0">
        <span data-plite-string>alpha beta gamma delta epsilon</span>
      </span>
    </div>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const text = root.querySelector('[data-plite-string]')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(text, 0);
  range.setEnd(text, text.textContent?.length ?? 0);
  selection.removeAllRanges();
  selection.addRange(range);

  const rects = Array.from(range.getClientRects());

  expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
    anchor: {
      path: [0, 0],
      offset: 0,
    },
    focus: {
      path: [0, 0],
      offset: text.textContent?.length ?? 0,
    },
  });
  expect(rects.length).toBeGreaterThan(1);
  expect(
    new Set(rects.map((rect) => Math.round(rect.top))).size
  ).toBeGreaterThan(1);
});

it('maps editor selections inside a shadow root against the local root', () => {
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  shadowRoot.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0"><span data-plite-string>shadow alpha</span></span>
    </div>
  `;
  document.body.append(host);

  const root = shadowRoot.querySelector('[data-plite-editor="true"]')!;
  const text = root.querySelector('[data-plite-string]')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  try {
    range.setStart(text, 7);
    range.setEnd(text, 'shadow alpha'.length);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(takeEditorSelectionSnapshot(root, selection)).toEqual({
      anchor: {
        path: [0, 0],
        offset: 7,
      },
      focus: {
        path: [0, 0],
        offset: 'shadow alpha'.length,
      },
    });
  } finally {
    host.remove();
  }
});

it('fails closed when the DOM selection is outside the editor root', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0"><span data-plite-string>inside</span></span>
    </div>
    <p id="outside">outside</p>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const outside = document.querySelector('#outside')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(outside, 0);
  range.setEnd(outside, 'outside'.length);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeDOMSelectionSnapshot(selection)).toEqual({
    anchorNodeText: 'outside',
    anchorOffset: 0,
    focusNodeText: 'outside',
    focusOffset: 'outside'.length,
  });
  expect(takeEditorSelectionSnapshot(root, selection)).toBeNull();
});

it('fails closed when the DOM selection only partly belongs to the editor', () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0"><span data-plite-string>inside</span></span>
    </div>
    <p id="outside">outside</p>
  `;

  const root = document.querySelector('[data-plite-editor="true"]')!;
  const inside = root.querySelector('[data-plite-string]')!.firstChild as Text;
  const outside = document.querySelector('#outside')!.firstChild as Text;
  const selection = document.getSelection()!;
  const range = document.createRange();

  range.setStart(inside, 1);
  range.setEnd(outside, 3);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(takeDOMSelectionSnapshot(selection)).toEqual({
    anchorNodeText: 'inside',
    anchorOffset: 1,
    focusNodeText: 'outside',
    focusOffset: 3,
  });
  expect(takeEditorSelectionSnapshot(root, selection)).toBeNull();
});
