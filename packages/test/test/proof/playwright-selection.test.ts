import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

import {
  takeDisplayedSelectionSnapshotForRoot,
  takeSelectionSnapshot,
} from '../../src/playwright';
import { BROWSER_HANDLE_KEY } from '../../src/playwright/constants';
import {
  getRenderedBlockDOMShape,
  getRenderedBlockDOMShapes,
} from '../../src/playwright/dom-shape';
import { waitForSelectionRange } from '../../src/playwright/selection-handle';
import { waitForSelectionSync } from '../../src/playwright/selection-snapshots';

const createPage = () =>
  ({
    evaluate: async <T>(
      callback: (arg: { key: string }) => T,
      arg: { key: string }
    ) => callback(arg),
  }) as Parameters<typeof takeSelectionSnapshot>[0];

const createRootLocator = (root: HTMLElement) =>
  ({
    evaluate: async <T, A>(
      callback: (root: HTMLElement, arg: A) => T,
      arg: A
    ) => callback(root, arg),
    page: () => ({ waitForTimeout: async () => {} }),
  }) as Parameters<typeof takeDisplayedSelectionSnapshotForRoot>[0];

describe('playwright selection snapshots', () => {
  beforeAll(() => {
    if (!GlobalRegistrator.isRegistered) {
      GlobalRegistrator.register();
    }
  });

  afterAll(async () => {
    if (GlobalRegistrator.isRegistered) {
      await GlobalRegistrator.unregister();
    }
  });

  test('reads top-level block hosts through wrappers without hiding raw rendered text', async () => {
    document.body.innerHTML = `
      <div data-editor data-editor-node="value">
        <p data-editor-node="element" data-editor-path="0">direct</p>
        <div class="editor-draggable">
          <div class="editor-gutterLeft" contenteditable="false">gutter</div>
          <div class="editor-blockWrapper">
            <p data-editor-node="element" data-editor-path="1"><span data-editor-node="text" data-editor-path="1,0"><span data-editor-string data-editor-length="1">한꼬리</span></span><a data-editor-node="element" data-editor-path="1,1">link</a></p>
          </div>
        </div>
        <div class="editor-draggable">
          <div class="editor-blockWrapper">
            <blockquote data-editor-node="element" data-editor-path="2"><p data-editor-node="element" data-editor-path="2,0"><span data-editor-node="text" data-editor-path="2,0,0"><span data-editor-zero-width="n" data-editor-length="0">\uFEFF<br /></span></span></p></blockquote>
          </div>
          <div data-editor data-editor-node="value">
            <p data-editor-node="element" data-editor-path="0">another editor</p>
          </div>
        </div>
      </div>
    `;

    const root = createRootLocator(
      document.querySelector<HTMLElement>('[data-editor]')!
    );
    const shapes = await getRenderedBlockDOMShapes(root);

    expect(
      shapes.map(({ index, textContent }) => ({ index, textContent }))
    ).toEqual([
      { index: 0, textContent: 'direct' },
      { index: 1, textContent: '한꼬리link' },
      { index: 2, textContent: '' },
    ]);
    const emptyBlock = await getRenderedBlockDOMShape(root, 2);

    expect(emptyBlock.zeroWidthNodes).toMatchObject([
      { hasBr: true, hasFEFF: true, kind: 'n', length: '0' },
    ]);
    await expect(getRenderedBlockDOMShape(root, 3)).rejects.toThrow(
      'Missing rendered block DOM shape for index 3'
    );
  });

  test('normalizes zero-width DOM artifact offsets back to editor offset zero', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-leaf="true">
            <span data-editor-zero-width="n" data-editor-length="0">\uFEFF<br /></span>
          </span>
        </span>
      </div>
    `;

    const marker = document.querySelector('[data-editor-zero-width="n"]')!;
    const text = marker.firstChild as Text;
    const br = marker.querySelector('br')!;
    const selection = window.getSelection()!;
    const page = createPage();

    const expectZeroWidthOffset = async (node: Node, offset: number) => {
      const range = document.createRange();

      range.setStart(node, offset);
      range.setEnd(node, offset);
      selection.removeAllRanges();
      selection.addRange(range);

      expect(await takeSelectionSnapshot(page)).toEqual({
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

    await expectZeroWidthOffset(text, 1);
    await expectZeroWidthOffset(marker, 1);
    await expectZeroWidthOffset(br, 0);
  });

  test('includes preceding segments before a zero-width caret', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-leaf="true">
            <span data-editor-string="true">hello</span>
          </span>
          <span data-editor-leaf="true">
            <span data-editor-zero-width="n" data-editor-length="0">\uFEFF<br /></span>
          </span>
        </span>
      </div>
    `;

    const marker = document.querySelector('[data-editor-zero-width="n"]')!;
    const markerText = marker.firstChild as Text;
    const selection = window.getSelection()!;
    const range = document.createRange();

    range.setStart(markerText, 1);
    range.setEnd(markerText, 1);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(await takeSelectionSnapshot(createPage())).toEqual({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  test('reports no visible selection without native text or projected markers', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-string="true">hello</span>
        </span>
      </div>
    `;

    window.getSelection()?.removeAllRanges();

    expect(
      await takeDisplayedSelectionSnapshotForRoot(
        createRootLocator(document.querySelector<HTMLElement>('[data-editor]')!)
      )
    ).toMatchObject({
      displayed: null,
      doubleHighlighted: false,
      hasVisibleEditorSelection: false,
      hasVisibleSelection: false,
      source: 'none',
      view: {
        markerCount: 0,
      },
    });
  });

  test('accepts a model selection whose virtualized DOM unmounts during conditional sync', async () => {
    document.body.innerHTML = '<div data-editor="true"></div>';

    const root = document.querySelector<HTMLElement>('[data-editor]')!;

    (root as any)[BROWSER_HANDLE_KEY] = {
      getSelection: () => ({
        anchor: { offset: 3, path: [47, 119, 1, 0] },
        focus: { offset: 3, path: [47, 119, 1, 0] },
      }),
    };
    window.getSelection()?.removeAllRanges();

    await expect(
      waitForSelectionSync(createRootLocator(root), undefined, {
        allowMissingNativeSelection: true,
      })
    ).resolves.toBeUndefined();
  });

  test('accepts an explicit viewport-backed selection without projected markers', async () => {
    document.body.innerHTML = `
      <div
        data-editor="true"
        data-editor-viewport-selection="viewport-backed"
      >
        <span data-editor-node="text" data-editor-path="0,0">first</span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-editor]')!;
    const text = root.querySelector('[data-editor-node="text"]')!.firstChild!;
    const nativeRange = document.createRange();

    nativeRange.setStart(text, 0);
    nativeRange.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(nativeRange);

    (root as any)[BROWSER_HANDLE_KEY] = {
      getSelection: () => ({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [9999, 0] },
      }),
      getViewSelection: () => null,
    };

    await expect(
      waitForSelectionSync(createRootLocator(root))
    ).resolves.toBeUndefined();
  });

  test('still waits for the expected model selection when virtualized DOM is absent', async () => {
    document.body.innerHTML = '<div data-editor="true"></div>';

    const root = document.querySelector<HTMLElement>('[data-editor]')!;
    const expected = {
      anchor: { offset: 3, path: [47, 119, 1, 0] },
      focus: { offset: 3, path: [47, 119, 1, 0] },
    };
    let selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };

    (root as any)[BROWSER_HANDLE_KEY] = {
      getSelection: () => selection,
    };
    window.getSelection()?.removeAllRanges();
    setTimeout(() => {
      selection = expected;
    }, 20);

    await waitForSelectionSync(createRootLocator(root), expected, {
      allowMissingNativeSelection: true,
    });

    expect(selection).toBe(expected);
  });

  test('accepts a partial native range only while its view declares model-owned DOM coverage', async () => {
    document.body.innerHTML =
      '<div data-editor="true"><span data-editor-node="text" data-editor-path="0,0"><span data-editor-string="true">before</span></span></div>';
    const root = document.querySelector<HTMLElement>('[data-editor]')!;
    const text = root.querySelector('[data-editor-string]')!.firstChild!;
    const nativeRange = document.createRange();
    nativeRange.setStart(text, 0);
    nativeRange.setEnd(text, 6);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(nativeRange);
    const model = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    };
    let covered = true;
    let native = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    };
    (root as any)[BROWSER_HANDLE_KEY] = {
      getDOMSelection: () => native,
      getInputState: () => ({
        modelOwnedDOMCoverageSelection: covered,
        preferModelSelection: true,
      }),
      getSelection: () => model,
    };
    await expect(
      waitForSelectionSync(createRootLocator(root), model)
    ).resolves.toBeUndefined();
    covered = false;
    setTimeout(() => {
      native = model;
    }, 20);
    await waitForSelectionSync(createRootLocator(root), model);
    expect(native).toBe(model);
  });

  test('waits for native selection inside the requested editor root', async () => {
    document.body.innerHTML = `
      <div data-editor="first"><span>first</span></div>
      <div data-editor="second"><span>second</span></div>
    `;

    const first = document.querySelector<HTMLElement>('[data-editor="first"]')!;
    const secondText = document.querySelector(
      '[data-editor="second"] span'
    )!.firstChild!;
    const firstText = first.querySelector('span')!.firstChild!;
    const selection = window.getSelection()!;
    const outsideRange = document.createRange();

    outsideRange.setStart(secondText, 0);
    outsideRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(outsideRange);
    setTimeout(() => {
      const insideRange = document.createRange();

      insideRange.setStart(firstText, 1);
      insideRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(insideRange);
    }, 20);

    await waitForSelectionRange(createRootLocator(first));

    expect(selection.anchorNode).toBe(firstText);
  });

  test('captures the native selection as the displayed selection', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-leaf="true">
            <span data-editor-string="true">hello</span>
          </span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-editor]')!;
    const text = document.querySelector('[data-editor-string]')!.firstChild!;
    const range = document.createRange();
    const selection = window.getSelection()!;

    range.setStart(text, 1);
    range.setEnd(text, 4);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(
      await takeDisplayedSelectionSnapshotForRoot(createRootLocator(root))
    ).toMatchObject({
      displayed: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      doubleHighlighted: false,
      hasVisibleEditorSelection: true,
      hasVisibleSelection: true,
      native: {
        textLength: 3,
      },
      source: 'native',
      view: {
        markerCount: 0,
      },
    });
  });

  test('captures projected view selection when native selection is not expanded', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-view-selection="true">hello</span>
        </span>
        <span data-editor-node="text" data-editor-path="1,0">
          <span data-editor-view-selection="true">world</span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-editor]')!;

    (root as any)[BROWSER_HANDLE_KEY] = {
      getSelection: () => ({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      }),
      getViewSelection: () => ({
        anchor: { point: { offset: 1, path: [0, 0] } },
        focus: { point: { offset: 3, path: [1, 0] } },
      }),
    };
    window.getSelection()?.removeAllRanges();

    const markers = document.querySelectorAll<HTMLElement>(
      '[data-editor-view-selection="true"]'
    );

    markers.forEach((marker, index) => {
      marker.getBoundingClientRect = () =>
        new DOMRect(index * 10, index * 5, 10 + index, 8 + index);
    });

    expect(
      await takeDisplayedSelectionSnapshotForRoot(createRootLocator(root))
    ).toMatchObject({
      displayed: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
      doubleHighlighted: false,
      hasVisibleEditorSelection: true,
      hasVisibleSelection: true,
      source: 'view',
      view: {
        markerCount: 2,
        markerPaths: ['0,0', '1,0'],
        markerRects: [
          { height: 8, width: 10, x: 0, y: 0 },
          { height: 9, width: 11, x: 10, y: 5 },
        ],
        textLength: 10,
      },
    });
  });

  test('detects native plus projected double highlight', async () => {
    document.body.innerHTML = `
      <div data-editor="true">
        <span data-editor-node="text" data-editor-path="0,0">
          <span data-editor-string="true">hello</span>
          <span data-editor-view-selection="true">hello</span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-editor]')!;
    const text = document.querySelector('[data-editor-string]')!.firstChild!;
    const range = document.createRange();
    const selection = window.getSelection()!;

    range.setStart(text, 0);
    range.setEnd(text, 5);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(
      await takeDisplayedSelectionSnapshotForRoot(createRootLocator(root))
    ).toMatchObject({
      doubleHighlighted: true,
      hasVisibleEditorSelection: true,
      hasVisibleSelection: true,
      native: {
        textLength: 5,
      },
      view: {
        markerCount: 1,
      },
    });
  });
});
