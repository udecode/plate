import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

import {
  takeDisplayedSelectionSnapshotForRoot,
  takeSelectionSnapshot,
} from '../../src/playwright';

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

  test('normalizes zero-width DOM artifact offsets back to editor offset zero', async () => {
    document.body.innerHTML = `
      <div data-plite-editor="true">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-leaf="true">
            <span data-plite-zero-width="n" data-plite-length="0">\uFEFF<br /></span>
          </span>
        </span>
      </div>
    `;

    const marker = document.querySelector('[data-plite-zero-width="n"]')!;
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

  test('reports no visible selection without native text or projected markers', async () => {
    document.body.innerHTML = `
      <div data-plite-editor="true">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-string="true">hello</span>
        </span>
      </div>
    `;

    window.getSelection()?.removeAllRanges();

    expect(
      await takeDisplayedSelectionSnapshotForRoot(
        createRootLocator(
          document.querySelector<HTMLElement>('[data-plite-editor]')!
        )
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

  test('captures the native selection as the displayed selection', async () => {
    document.body.innerHTML = `
      <div data-plite-editor="true">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-leaf="true">
            <span data-plite-string="true">hello</span>
          </span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-plite-editor]')!;
    const text = document.querySelector('[data-plite-string]')!.firstChild!;
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
      <div data-plite-editor="true">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-view-selection="true">hello</span>
        </span>
        <span data-plite-node="text" data-plite-path="1,0">
          <span data-plite-view-selection="true">world</span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-plite-editor]')!;

    (root as any).__pliteBrowserHandle = {
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
      '[data-plite-view-selection="true"]'
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
      <div data-plite-editor="true">
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-string="true">hello</span>
          <span data-plite-view-selection="true">hello</span>
        </span>
      </div>
    `;

    const root = document.querySelector<HTMLElement>('[data-plite-editor]')!;
    const text = document.querySelector('[data-plite-string]')!.firstChild!;
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
