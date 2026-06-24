import { afterAll, describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { act, renderHook } from '@testing-library/react';
import { createEditor, defineStateField } from '@platejs/plite';

import * as PliteLayout from '../src';
import {
  createEstimatedPageLayoutEngine,
  createPliteLayout,
  createPlitePage,
  createPlitePageLayout,
  getPlitePageLayoutDecorations,
  getPlitePageLayoutGeometry,
  getPlitePageLayoutProjection,
  paginatePlitePageLayoutBlocks,
  pretextPageLayoutEngine,
  type PlitePageBreakSnapshot,
  type PlitePageLayoutSnapshot,
  type PlitePageSettings,
} from '../src';
import {
  createPagedEditablePageMountPlan,
  getPagedEditableMountedPageIndexes,
  getPagedEditableVisiblePageMountItems,
} from '../src/page-mount-plan';
import * as PliteLayoutReact from '../src/react';
import { usePliteLayout } from '../src/react';

const registeredDom = typeof document === 'undefined';

if (registeredDom) {
  GlobalRegistrator.register();
}

afterAll(() => {
  if (registeredDom) {
    GlobalRegistrator.unregister();
  }
});

class TestCanvasRenderingContext2D {
  font = '';

  measureText(text: string): { width: number } {
    const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 16);
    const textWidth = /700/.test(this.font)
      ? fontSize * 0.65
      : /Menlo|monospace/.test(this.font)
        ? fontSize * 0.7
        : fontSize * 0.6;
    let width = 0;

    for (const character of text) {
      width += character === ' ' ? fontSize * 0.33 : textWidth;
    }

    return { width };
  }
}

class TestOffscreenCanvas {
  getContext(_kind: string): TestCanvasRenderingContext2D {
    return new TestCanvasRenderingContext2D();
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pageSettings = defineStateField<PlitePageSettings>({
  key: 'layout.page',
  collab: 'shared',
  history: 'push',
  initial: () => ({ margins: 96, preset: 'a4' }),
  persist: true,
});

const expectedPliteLayoutRuntimeRootExports = [
  'createEstimatedPageLayoutEngine',
  'createPliteLayout',
  'createPlitePage',
  'createPlitePageBreakSnapshot',
  'createPlitePageLayout',
  'getPlitePageLayoutDecorations',
  'getPlitePageLayoutFragments',
  'getPlitePageLayoutGeometry',
  'getPlitePageLayoutPathKey',
  'getPlitePageLayoutProjection',
  'getPlitePagePresetSize',
  'normalizePlitePageSettings',
  'paginatePlitePageLayoutBlocks',
  'pretextPageLayoutEngine',
];

const expectedPliteLayoutRuntimeReactExports = [
  'PagedEditable',
  'usePliteLayout',
  'usePliteLayoutFragments',
  'usePliteLayoutFragmentsAtPath',
  'usePliteLayoutSnapshot',
  'usePlitePageLayout',
  'usePlitePageLayoutSnapshot',
];

describe('plite-layout public runtime exports', () => {
  it('keeps public root and React subpath runtime values exact', () => {
    expect({
      react: Object.keys(PliteLayoutReact).sort(),
      root: Object.keys(PliteLayout).sort(),
    }).toEqual({
      react: expectedPliteLayoutRuntimeReactExports,
      root: expectedPliteLayoutRuntimeRootExports,
    });
  });
});

describe('plite-layout public docs', () => {
  it('keeps package and library docs beta-ready and proof-gated', () => {
    const packageReadme = readFileSync(
      new URL('../README.md', import.meta.url),
      'utf8'
    );
    const libraryReadmeUrl = new URL(
      '../../../docs/libraries/plite-layout/README.md',
      import.meta.url
    );
    const libraryReadme = existsSync(libraryReadmeUrl)
      ? readFileSync(libraryReadmeUrl, 'utf8')
      : packageReadme;

    expect(packageReadme).toContain('Page layout helpers');
    expect(packageReadme).toContain('explicit product proof');
    expect(packageReadme).toContain('derived geometry');
    expect(packageReadme).toContain(
      "import { PagedEditable, usePliteLayout } from '@platejs/plite-layout/react'"
    );
    expect(packageReadme).not.toMatch(/\b[Ee]xperimental\b/);

    if (existsSync(libraryReadmeUrl)) {
      expect(libraryReadme).toContain('explicit flags');
      expect(libraryReadme).toContain('authoritative page breaks');
      expect(libraryReadme).toContain('Headless And Static Use');
      expect(libraryReadme).toContain(
        'authoritative PDF, print, or collaboration'
      );
      expect(libraryReadme).not.toMatch(/\b[Ee]xperimental\b/);
    }
  });
});

describe('createPlitePageLayout', () => {
  it('keeps equivalent inline page settings from retriggering React layout refreshes', async () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Stable inline page settings.' }],
        },
      ],
    });
    const createPage = (margins: number) =>
      ({ margins, preset: 'letter' }) as const;
    const { result, rerender, unmount } = renderHook(
      ({ page }) => usePliteLayout(editor, { page }),
      { initialProps: { page: createPage(72) } }
    );
    const layout = result.current;

    await act(async () => {});
    const composeCount = layout.getMetrics().composeCount;

    await act(async () => {
      rerender({ page: createPage(72) });
    });

    expect(result.current).toBe(layout);
    expect(layout.getMetrics().composeCount).toBe(composeCount);

    await act(async () => {
      rerender({ page: createPage(96) });
    });

    expect(layout.getMetrics().composeCount).toBeGreaterThan(composeCount);

    unmount();
  });

  it('exports Pretext as the built-in page layout engine', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);

    const output = pretextPageLayoutEngine().compose({
      blocks: [
        {
          element: {
            type: 'paragraph',
            children: [{ text: 'Text   ' }],
          },
          lineHeight: 24,
          path: [0],
          spacingAfter: 12,
          text: 'Text   ',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        },
      ],
      page,
      settings,
      version: 1,
    });

    expect(output.fragments[0]!.lines[0]).toMatchObject({
      end: 'Text   '.length,
      start: 0,
      text: 'Text   ',
    });
  });

  it('uses rich-inline fragments for normal whitespace mixed runs', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 358, preset: 'letter' } as const;
    const page = createPlitePage(settings);
    const output = pretextPageLayoutEngine({ whiteSpace: 'normal' }).compose({
      blocks: [
        {
          element: {
            type: 'paragraph',
            children: [
              { text: 'alpha ' },
              { text: 'beta', bold: true },
              { text: ' code', code: true },
            ],
          },
          lineHeight: 24,
          path: [0],
          runs: [
            {
              id: '0.0:0-6',
              path: [0, 0],
              range: { end: 6, start: 0 },
              text: 'alpha ',
              textStyle: {
                font: '400 16px Arial',
                letterSpacing: 0,
              },
            },
            {
              id: '0.1:6-10',
              path: [0, 1],
              range: { end: 10, start: 6 },
              text: 'beta',
              textStyle: {
                font: '700 16px Arial',
                letterSpacing: 0,
              },
            },
            {
              id: '0.2:10-15',
              path: [0, 2],
              range: { end: 15, start: 10 },
              text: ' code',
              textStyle: {
                font: '400 16px Menlo, monospace',
                letterSpacing: 0,
              },
            },
          ],
          spacingAfter: 12,
          text: 'alpha beta code',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        },
      ],
      page,
      settings,
      version: 1,
    });
    const lines = output.fragments[0]!.lines;

    expect(lines).toHaveLength(2);
    expect(lines[0]!.text).toBe('alpha beta');
    expect(lines[0]!.runs).toEqual([
      expect.objectContaining({
        leafRange: { end: 5, start: 0 },
        left: 0,
        path: [0, 0],
        range: { end: 5, start: 0 },
        text: 'alpha',
      }),
      expect.objectContaining({
        leafRange: { end: 6, start: 5 },
        left: 48,
        path: [0, 0],
        range: { end: 6, start: 5 },
        text: ' ',
      }),
      expect.objectContaining({
        leafRange: { end: 4, start: 0 },
        path: [0, 1],
        range: { end: 10, start: 6 },
        text: 'beta',
      }),
    ]);
    expect(lines[0]!.runs![0]!.width).toBeCloseTo(48);
    expect(lines[0]!.runs![1]!.width).toBeCloseTo(5.28);
    expect(lines[0]!.runs![2]!.left).toBeCloseTo(53.28);

    expect(lines[1]!.text).toBe('code');
    expect(lines[1]!.runs).toEqual([
      expect.objectContaining({
        leafRange: { end: 5, start: 1 },
        left: 0,
        path: [0, 2],
        range: { end: 15, start: 11 },
        text: 'code',
      }),
    ]);
  });

  it('lets Pretext callers estimate selected cold blocks', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const output = pretextPageLayoutEngine({
      estimateBlock: ({ blockIndex }) => blockIndex === 0,
    }).compose({
      blocks: [
        {
          element: {
            type: 'paragraph',
            children: [{ text: 'abcdefghij' }],
          },
          lineHeight: 24,
          path: [0],
          runs: [
            {
              id: '0.0:0-10',
              path: [0, 0],
              range: { end: 10, start: 0 },
              text: 'abcdefghij',
              textStyle: {
                font: '400 16px Arial',
                letterSpacing: 0,
              },
            },
          ],
          spacingAfter: 12,
          text: 'abcdefghij',
          textStyle: {
            font: '400 16px Arial',
            letterSpacing: 0,
          },
        },
      ],
      page,
      settings,
      version: 1,
    });
    const line = output.fragments[0]!.lines[0]!;

    expect(line.width).toBe(80);
    expect(line.runs![0]!.width).toBe(80);
  });

  it('keeps hard line breaks when estimating cold Pretext blocks', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const output = pretextPageLayoutEngine({
      estimateBlock: () => true,
    }).compose({
      blocks: [
        {
          element: {
            type: 'code-block',
            children: [{ text: 'alpha\nbeta\ngamma' }],
          },
          lineHeight: 24,
          path: [0],
          runs: [
            {
              id: '0.0:0-16',
              path: [0, 0],
              range: { end: 16, start: 0 },
              text: 'alpha\nbeta\ngamma',
              textStyle: {
                font: '400 16px monospace',
                letterSpacing: 0,
              },
            },
          ],
          spacingAfter: 12,
          text: 'alpha\nbeta\ngamma',
          textStyle: {
            font: '400 16px monospace',
            letterSpacing: 0,
          },
        },
      ],
      page,
      settings,
      version: 1,
    });

    expect(output.fragments[0]!.lines.map((line) => line.text)).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('projects collapsed rich-inline whitespace at style boundaries', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha ' }, { text: 'beta', bold: true }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: pretextPageLayoutEngine({ whiteSpace: 'normal' }),
      page: pageSettings,
    }));
    const rects = layout.projectRange({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 6 },
    });

    expect(rects).toHaveLength(1);
    expect(rects[0]!.width).toBeGreaterThan(0);

    layout.destroy();
  });

  it('exposes the generic layout API without an engine at the call site', () => {
    Reflect.set(globalThis, 'OffscreenCanvas', TestOffscreenCanvas);
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Generic layout call site.' }],
        },
      ],
    });
    const layout = createPliteLayout(editor, () => ({
      page: { margins: 72, preset: 'letter' },
    }));
    const snapshot: PlitePageLayoutSnapshot = layout.getSnapshot();

    expect(snapshot.settings).toEqual({ margins: 72, preset: 'letter' });
    expect(snapshot.page.width).toBe(816);
    expect(snapshot.blocks[0]!.text).toBe('Generic layout call site.');

    layout.destroy();
  });

  it('rejects explicit public main roots in layout options', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Primary layout.' }],
        },
      ],
    });

    expect(() =>
      createPlitePageLayout(editor, () => ({
        engine: createEstimatedPageLayoutEngine(),
        page: pageSettings,
        root: 'main',
      }))
    ).toThrow(/Omit root to target the primary document/);
  });

  it('rejects explicit public main roots in layout projection options', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Primary projection.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));

    expect(() =>
      layout.projectRange(
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 7 },
        },
        { root: 'main' }
      )
    ).toThrow(/Omit root to target the primary document/);
    expect(() =>
      layout.projectRange({
        anchor: { path: [0, 0], offset: 0, root: 'main' },
        focus: { path: [0, 0], offset: 7 },
      })
    ).toThrow(/Omit root to target the primary document/);

    layout.destroy();
  });

  it('accepts a caller-supplied engine in the generic layout API', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Estimated generic layout call site.' }],
        },
      ],
    });
    const layout = createPliteLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: { margins: 72, preset: 'letter' },
    }));
    const snapshot = layout.getSnapshot();

    expect(snapshot.measurementProfile.engine.id).toBe('estimated');
    expect(snapshot.blocks[0]!.text).toBe(
      'Estimated generic layout call site.'
    );

    layout.destroy();
  });

  it('keeps the generic layout API usable without browser canvas measurement', () => {
    const previousOffscreenCanvas = Reflect.get(globalThis, 'OffscreenCanvas');
    const hadOffscreenCanvas = Reflect.has(globalThis, 'OffscreenCanvas');

    Reflect.deleteProperty(globalThis, 'OffscreenCanvas');

    try {
      const editor = createEditor({
        initialValue: [
          {
            type: 'paragraph',
            children: [{ text: 'Headless layout call site.' }],
          },
        ],
      });
      const layout = createPliteLayout(editor, () => ({
        page: { margins: 72, preset: 'letter' },
      }));
      const snapshot = layout.getSnapshot();

      expect(snapshot.settings).toEqual({ margins: 72, preset: 'letter' });
      expect(snapshot.blocks[0]!.text).toBe('Headless layout call site.');
      expect(layout.getMetrics().pageCount).toBe(1);

      layout.destroy();
    } finally {
      if (hadOffscreenCanvas) {
        Reflect.set(globalThis, 'OffscreenCanvas', previousOffscreenCanvas);
      } else {
        Reflect.deleteProperty(globalThis, 'OffscreenCanvas');
      }
    }
  });

  it('keeps page settings in state fields and layout output in the derived store', () => {
    const editor = createEditor({
      extensions: [pageSettings],
      initialValue: {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'One '.repeat(5000) }],
          },
        ],
        state: {
          [pageSettings.key]: { margins: 72, preset: 'letter' },
        },
      },
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));

    expect(layout.getSnapshot().settings).toEqual({
      margins: 72,
      preset: 'letter',
    });
    expect(layout.getSnapshot().pages.length).toBeGreaterThan(1);
    expect(editor.read((state) => state.getField(pageSettings))).toEqual({
      margins: 72,
      preset: 'letter',
    });

    layout.destroy();
  });

  it('keeps authoritative page break snapshots opt-in and profile checked', () => {
    const pageBreaks = defineStateField<PlitePageBreakSnapshot | null>({
      key: 'layout.pageBreaks',
      applyPatch: (_value, patch) => patch as PlitePageBreakSnapshot | null,
      collab: 'shared',
      diff: (_previous, value) => value,
      history: 'skip',
      initial: () => null,
      invertPatch: (_patch, previous) => previous,
      persist: true,
    });
    const editor = createEditor({
      extensions: [pageBreaks],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Long '.repeat(6000) }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: { margins: 96, preset: 'a4' },
      pageBreaks: {
        mode: 'write',
        source: pageBreaks,
        writerId: 'writer-a',
      },
    }));
    const storedSnapshot = editor.read((state) => state.getField(pageBreaks));

    expect(storedSnapshot?.writerId).toBe('writer-a');
    expect(storedSnapshot?.breaks.length).toBeGreaterThan(0);
    expect(storedSnapshot?.measurementProfile.engine.id).toBe('estimated');
    expect(layout.getSnapshot().pageBreaks).toEqual(storedSnapshot);
    expect(layout.getSnapshot().pageBreaksStatus).toBe('written');

    layout.destroy();

    const reader = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: { margins: 96, preset: 'a4' },
      pageBreaks: {
        mode: 'read',
        source: pageBreaks,
      },
    }));

    expect(reader.getSnapshot().pageBreaks).toEqual(storedSnapshot);
    expect(reader.getSnapshot().pageBreaksStatus).toBe('accepted');

    reader.destroy();

    editor.update((tx) => {
      tx.setField(pageBreaks, {
        ...storedSnapshot!,
        measurementProfile: {
          ...storedSnapshot!.measurementProfile,
          engine: { id: 'other-engine' },
        },
      });
    });

    const staleReader = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: { margins: 96, preset: 'a4' },
      pageBreaks: {
        mode: 'read',
        source: pageBreaks,
      },
    }));

    expect(staleReader.getSnapshot().pageBreaks).toBe(null);
    expect(staleReader.getSnapshot().pageBreaksStatus).toBe('stale-profile');

    staleReader.destroy();
  });

  it('refreshes subscribers after editor text changes', async () => {
    const editor = createEditor({
      extensions: [pageSettings],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Short paragraph.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    let wakeCount = 0;
    const unsubscribe = layout.subscribe(() => {
      wakeCount++;
    });

    editor.update((tx) => {
      tx.text.insert(' Added text.', {
        at: { path: [0, 0], offset: 'Short paragraph.'.length },
      });
    });

    expect(wakeCount).toBe(1);
    expect(layout.getMetrics().composeCount).toBe(2);
    expect(layout.getSnapshot().blocks[0]?.text).toBe(
      'Short paragraph. Added text.'
    );

    unsubscribe();
    layout.destroy();
  });

  it('bounds deferred text refreshes during sustained typing', async () => {
    const editor = createEditor({
      extensions: [pageSettings],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Typing paragraph.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
      textChangeRefresh: 'deferred',
    }));
    const composeCount = layout.getMetrics().composeCount;

    for (const text of ['a', 'b', 'c', 'd']) {
      editor.update((tx) => {
        tx.text.insert(text, {
          at: {
            path: [0, 0],
            offset: editor.read((state) => state.text.string([0]).length),
          },
        });
      });
      await wait(220);
    }

    expect(layout.getMetrics().composeCount).toBeGreaterThan(composeCount);

    layout.destroy();
  });

  it('coalesces deferred text refreshes for text commits that mark children dirty', async () => {
    const editor = createEditor({
      extensions: [pageSettings],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Burst paragraph.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
      textChangeRefresh: { delayMs: 25, maxDelayMs: 100, mode: 'deferred' },
    }));
    const composeCount = layout.getMetrics().composeCount;

    for (const text of ['a', 'b', 'c', 'd']) {
      editor.update((tx) => {
        tx.text.insert(text, {
          at: {
            path: [0, 0],
            offset: editor.read((state) => state.text.string([0]).length),
          },
        });
      });
    }

    expect(layout.getMetrics().composeCount).toBe(composeCount);

    await wait(80);

    expect(layout.getMetrics().composeCount).toBe(composeCount + 1);
    expect(layout.getSnapshot().blocks[0]?.text).toBe('Burst paragraph.abcd');

    layout.destroy();
  });

  it('binds extracted blocks and projected ranges to the layout root', () => {
    const headerText = 'Header '.repeat(160);
    const mainText = 'Main '.repeat(12);
    const editor = createEditor({
      initialValue: {
        children: [
          {
            type: 'paragraph',
            children: [{ text: mainText }],
          },
        ],
        roots: {
          header: [
            {
              type: 'paragraph',
              children: [{ text: headerText }],
            },
          ],
        },
      },
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      root: 'header',
      page: pageSettings,
    }));

    expect(layout.getSnapshot().root).toBe('header');
    expect(layout.getSnapshot().blocks).toHaveLength(1);
    expect(layout.getSnapshot().blocks[0]!.text).toBe(headerText);
    expect(
      layout.projectRange({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      }).length
    ).toBeGreaterThan(0);
    expect(
      layout.projectRange({
        anchor: { path: [0, 0], offset: 0, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      }).length
    ).toBeGreaterThan(0);
    expect(
      layout.projectRange({
        anchor: { path: [0, 0], offset: 0, root: 'footer' },
        focus: { path: [0, 0], offset: 4, root: 'footer' },
      })
    ).toEqual([]);
    expect(
      layout.projectRange({
        anchor: { path: [0, 0], offset: 0, root: 'header' },
        focus: { path: [0, 0], offset: 4, root: 'footer' },
      })
    ).toEqual([]);

    layout.destroy();
  });

  it('projects ranges through the requested page geometry', () => {
    const text = 'Long '.repeat(6000);
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    const snapshot = layout.getSnapshot();

    expect(snapshot.pages.length).toBeGreaterThan(1);

    const singleRects = layout.projectRange(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: text.length },
      },
      { pageGap: 24, pageLayoutMode: 'single' }
    );
    const spreadRects = layout.projectRange(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: text.length },
      },
      { pageGap: 24, pageLayoutMode: 'spread' }
    );
    const firstSingleSecondPageRect = singleRects.find(
      (rect) => rect.top >= snapshot.pages[0]!.height
    );
    const firstSpreadSecondPageRect = spreadRects.find(
      (rect) => rect.left >= snapshot.pages[0]!.width
    );

    expect(firstSingleSecondPageRect?.top).toBe(
      snapshot.pages[0]!.height + 24 + snapshot.pages[1]!.content.top
    );
    expect(firstSpreadSecondPageRect?.left).toBe(
      snapshot.pages[0]!.width + 24 + snapshot.pages[1]!.content.left
    );
    expect(firstSpreadSecondPageRect?.top).toBe(snapshot.pages[1]!.content.top);

    layout.destroy();
  });

  it('projects only the requested partial range and collapsed caret', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Alpha beta' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));

    const partialRects = layout.projectRange({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const caretRects = layout.projectRange({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    expect(partialRects).toHaveLength(1);
    expect(partialRects[0]!.left).toBe(
      layout.getSnapshot().pages[0]!.content.left
    );
    expect(partialRects[0]!.width).toBe(40);
    expect(caretRects).toEqual([
      {
        height: layout.getSnapshot().blocks[0]!.lineHeight,
        left: layout.getSnapshot().pages[0]!.content.left + 40,
        top: layout.getSnapshot().pages[0]!.content.top,
        width: 0,
      },
    ]);

    layout.destroy();
  });

  it('projects spanning ranges without leaking unrelated blocks', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'First block' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Second block' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Third block' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    const rects = layout.projectRange({
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [1, 0], offset: 6 },
    });

    expect(rects).toHaveLength(2);
    expect(rects.map((rect) => rect.width)).toEqual([40, 48]);
    expect(rects[1]!.top).toBeGreaterThan(rects[0]!.top);

    layout.destroy();
  });

  it('extracts leaf runs with block offsets and projects placed runs on lines', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Bold ', bold: true },
            { text: 'code', code: true },
          ],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
      typography: {
        text({ leaf }) {
          if (leaf.code) {
            return { font: '400 16px Mono', letterSpacing: 0 };
          }

          if (leaf.bold) {
            return { font: '700 16px Inter', letterSpacing: 0 };
          }

          return { font: '400 16px Inter', letterSpacing: 0 };
        },
      },
    }));
    const snapshot = layout.getSnapshot();
    const block = snapshot.blocks[0]!;
    const projection = getPlitePageLayoutProjection(snapshot);

    expect(block.text).toBe('Bold code');
    expect(
      block.runs.map((run) => ({
        path: run.path,
        range: run.range,
        text: run.text,
        textStyle: run.textStyle,
      }))
    ).toEqual([
      {
        path: [0, 0],
        range: { end: 5, start: 0 },
        text: 'Bold ',
        textStyle: { font: '700 16px Inter', letterSpacing: 0 },
      },
      {
        path: [0, 1],
        range: { end: 9, start: 5 },
        text: 'code',
        textStyle: { font: '400 16px Mono', letterSpacing: 0 },
      },
    ]);
    expect(
      projection.lines[0]!.runs.map((run) => ({
        left: run.left,
        path: run.path,
        range: run.range,
        text: run.text,
        width: run.width,
      }))
    ).toEqual([
      {
        left: 0,
        path: [0, 0],
        range: { end: 5, start: 0 },
        text: 'Bold ',
        width: 40,
      },
      {
        left: 40,
        path: [0, 1],
        range: { end: 9, start: 5 },
        text: 'code',
        width: 32,
      },
    ]);

    layout.destroy();
  });

  it('extracts block-local boxes for structured Markdown nodes', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'code-block',
          children: [{ text: 'one\ntwo' }],
        },
        {
          type: 'thematic-break',
          children: [{ text: '' }],
        },
        {
          type: 'image',
          url: 'https://example.com/image.png',
          children: [{ text: '' }],
        },
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'A' }] },
                { type: 'table-cell', children: [{ text: 'B' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '1' }] },
                { type: 'table-cell', children: [{ text: '2' }] },
              ],
            },
          ],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    const boxes = layout
      .getSnapshot()
      .blocks.flatMap((block) => block.boxes ?? [])
      .map((box) => ({
        kind: box.kind,
        path: box.path,
        rect: box.rect,
        split: box.split,
      }));

    expect(boxes).toEqual([
      {
        kind: 'block',
        path: [0],
        rect: { height: 48, left: 0, top: 0, width: 0 },
        split: 'avoid',
      },
      {
        kind: 'code-line',
        path: [0, 0],
        rect: { height: 24, left: 0, top: 0, width: 0 },
        split: 'line',
      },
      {
        kind: 'code-line',
        path: [0, 0],
        rect: { height: 24, left: 0, top: 24, width: 0 },
        split: 'line',
      },
      {
        kind: 'thematic-break',
        path: [1],
        rect: { height: 24, left: 0, top: 0, width: 0 },
        split: 'avoid',
      },
      {
        kind: 'image',
        path: [2],
        rect: { height: 24, left: 0, top: 0, width: 0 },
        split: 'avoid',
      },
      {
        kind: 'table',
        path: [3],
        rect: { height: 2, left: 0, top: 0, width: 2 },
        split: 'row',
      },
      {
        kind: 'table-cell',
        path: [3, 0, 0],
        rect: { height: 1, left: 0, top: 0, width: 1 },
        split: 'avoid',
      },
      {
        kind: 'table-cell',
        path: [3, 0, 1],
        rect: { height: 1, left: 1, top: 0, width: 1 },
        split: 'avoid',
      },
      {
        kind: 'table-cell',
        path: [3, 1, 0],
        rect: { height: 1, left: 0, top: 1, width: 1 },
        split: 'avoid',
      },
      {
        kind: 'table-cell',
        path: [3, 1, 1],
        rect: { height: 1, left: 1, top: 1, width: 1 },
        split: 'avoid',
      },
    ]);

    layout.destroy();
  });

  it('lets providers own media and BFC-like box sizing without a product TableKit', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'image',
          url: 'https://example.com/hero.png',
          children: [{ text: '' }],
        },
        {
          type: 'callout',
          children: [{ text: 'Do not split this callout.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      nodeLayout({ defaults, element, path }) {
        if (element.type === 'image') {
          return {
            box: {
              kind: 'image',
              path,
              rect: { height: 320, left: 0, top: 0, width: 480 },
              split: 'avoid',
            },
            type: 'box',
          };
        }

        if (element.type === 'callout') {
          return {
            box: {
              kind: 'block',
              path,
              rect: {
                height: defaults.block.lineHeight * 3,
                left: 0,
                top: 0,
                width: 0,
              },
              split: 'avoid',
            },
            type: 'box',
          };
        }

        return {
          boxes: defaults.boxes,
          type: 'text',
        };
      },
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    const boxes = layout
      .getSnapshot()
      .blocks.flatMap((block) => block.boxes ?? [])
      .map((box) => ({
        kind: box.kind,
        path: box.path,
        rect: box.rect,
        split: box.split,
      }));

    expect(boxes).toEqual([
      {
        kind: 'image',
        path: [0],
        rect: { height: 320, left: 0, top: 0, width: 480 },
        split: 'avoid',
      },
      {
        kind: 'block',
        path: [1],
        rect: { height: 72, left: 0, top: 0, width: 0 },
        split: 'avoid',
      },
    ]);

    layout.destroy();
  });

  it('paginates provider-owned table row units without splitting the table node', () => {
    const rows = Array.from({ length: 4 }, (_, rowIndex) => ({
      type: 'table-row',
      children: [
        {
          type: 'table-cell',
          children: [{ text: `Row ${rowIndex + 1} cell A` }],
        },
        {
          type: 'table-cell',
          children: [{ text: `Row ${rowIndex + 1} cell B` }],
        },
      ],
    }));
    const editor = createEditor({
      initialValue: [
        {
          type: 'table',
          children: rows,
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      nodeLayout({ defaults, element, path }) {
        if (element.type !== 'table') {
          return { boxes: defaults.boxes, type: 'text' };
        }

        return {
          boxes: defaults.boxes,
          type: 'units',
          units: rows.map((_, rowIndex) => ({
            key: `row-${rowIndex}`,
            kind: 'table-row',
            path: [...path, rowIndex],
            rect: {
              height: 340,
              left: 0,
              top: rowIndex * 340,
              width: 560,
            },
            split: 'avoid',
          })),
        };
      },
      page: { margins: 96, preset: 'a4' },
    }));
    const snapshot = layout.getSnapshot();

    expect(snapshot.pages).toHaveLength(2);
    expect(snapshot.blocks).toHaveLength(1);
    expect(editor.read((state) => state.value.root())).toHaveLength(1);
    expect(
      editor.read((state) => state.value.root()[0]?.children)
    ).toHaveLength(4);
    expect(snapshot.fragments.map((fragment) => fragment.path)).toEqual([
      [0],
      [0],
    ]);
    expect(
      snapshot.fragments.map((fragment) =>
        fragment.units?.map((unit) => unit.path)
      )
    ).toEqual([
      [
        [0, 0],
        [0, 1],
      ],
      [
        [0, 2],
        [0, 3],
      ],
    ]);
    expect(layout.getFragments([0, 2])).toEqual([
      expect.objectContaining({
        pageIndex: 1,
        units: [
          expect.objectContaining({
            path: [0, 2],
            rect: expect.objectContaining({
              top: snapshot.pages[1]!.content.top,
            }),
          }),
        ],
      }),
    ]);
    expect(layout.getFragments([0, 2, 0])).toEqual([
      expect.objectContaining({
        pageIndex: 1,
        units: [
          expect.objectContaining({
            path: [0, 2],
          }),
        ],
      }),
    ]);
    expect(
      layout
        .getFragments([0])
        .map((fragment) => fragment.units?.map((unit) => unit.path))
    ).toEqual([
      [
        [0, 0],
        [0, 1],
      ],
      [
        [0, 2],
        [0, 3],
      ],
    ]);

    layout.destroy();
  });

  it('does not recursively extract text or default cell boxes for provider-owned unit blocks', () => {
    const rows = Array.from({ length: 500 }, (_, rowIndex) => ({
      type: 'table-row',
      children: Array.from({ length: 3 }, (_, cellIndex) => ({
        type: 'table-cell',
        children: [{ text: `Row ${rowIndex + 1} cell ${cellIndex + 1}` }],
      })),
    }));
    let textStyleCalls = 0;
    const editor = createEditor({
      initialValue: [
        {
          type: 'table',
          children: rows,
        },
      ],
    });
    const page = { margins: 96, preset: 'a4' } as const;
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      nodeLayout({ element, path, pageSettings }) {
        if (element.type !== 'table') {
          return { type: 'text' };
        }

        const pageRect = createPlitePage(pageSettings);

        return {
          boxes: [
            {
              kind: 'table',
              path,
              rect: {
                height: rows.length * 36,
                left: 0,
                top: 0,
                width: pageRect.content.width,
              },
              split: 'row',
            },
          ],
          type: 'units',
          units: rows.map((_, rowIndex) => ({
            key: `row-${rowIndex}`,
            kind: 'table-row',
            path: [...path, rowIndex],
            rect: {
              height: 36,
              left: 0,
              top: rowIndex * 36,
              width: pageRect.content.width,
            },
            split: 'avoid',
          })),
        };
      },
      page,
      typography: {
        text() {
          textStyleCalls++;

          return {};
        },
      },
    }));
    const block = layout.getSnapshot().blocks[0]!;

    expect(textStyleCalls).toBeLessThanOrEqual(1);
    expect(block.runs).toEqual([]);
    expect(block.text).toBe('');
    expect(block.boxes).toHaveLength(1);
    expect(block.units).toHaveLength(500);

    layout.destroy();
  });

  it('writes authoritative page breaks for provider-owned unit fragments', () => {
    const pageBreaks = defineStateField<PlitePageBreakSnapshot | null>({
      key: 'layout.unitPageBreaks',
      applyPatch: (_value, patch) => patch as PlitePageBreakSnapshot | null,
      collab: 'shared',
      diff: (_previous, value) => value,
      history: 'skip',
      initial: () => null,
      invertPatch: (_patch, previous) => previous,
      persist: true,
    });
    const rows = Array.from({ length: 4 }, (_, rowIndex) => ({
      type: 'table-row',
      children: [
        {
          type: 'table-cell',
          children: [{ text: `Row ${rowIndex + 1}` }],
        },
      ],
    }));
    const editor = createEditor({
      extensions: [pageBreaks],
      initialValue: [
        {
          type: 'table',
          children: rows,
        },
      ],
    });
    const createLayout = (mode: 'read' | 'write') =>
      createPlitePageLayout(editor, () => ({
        engine: createEstimatedPageLayoutEngine(),
        nodeLayout({ defaults, element, path, pageSettings }) {
          if (element.type !== 'table') {
            return { boxes: defaults.boxes, type: 'text' };
          }

          const page = createPlitePage(pageSettings);

          return {
            boxes: defaults.boxes,
            type: 'units',
            units: rows.map((_, rowIndex) => ({
              key: `row-${rowIndex}`,
              kind: 'table-row',
              path: [...path, rowIndex],
              rect: {
                height: 340,
                left: 0,
                top: rowIndex * 340,
                width: page.content.width,
              },
              split: 'avoid',
            })),
          };
        },
        page: { margins: 96, preset: 'a4' },
        pageBreaks:
          mode === 'write'
            ? { mode, source: pageBreaks, writerId: 'writer-units' }
            : { mode, source: pageBreaks },
      }));
    const writer = createLayout('write');
    const storedSnapshot = editor.read((state) => state.getField(pageBreaks));

    expect(storedSnapshot?.writerId).toBe('writer-units');
    expect(storedSnapshot?.breaks).toEqual([
      expect.objectContaining({
        fragmentId: writer.getSnapshot().fragments[1]!.id,
        pageIndex: 1,
        path: [0],
      }),
    ]);

    writer.destroy();

    const reader = createLayout('read');

    expect(reader.getSnapshot().pageBreaks).toEqual(storedSnapshot);
    expect(reader.getSnapshot().pageBreaksStatus).toBe('accepted');

    reader.destroy();
  });

  it('places oversized provider-owned boxes once and continues on the next page', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'image',
          url: 'https://example.com/tall.png',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'After oversized media.' }],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      nodeLayout({ defaults, element, path, pageSettings }) {
        if (element.type !== 'image') {
          return { boxes: defaults.boxes, type: 'text' };
        }

        const page = createPlitePage(pageSettings);

        return {
          box: {
            kind: 'image',
            path,
            rect: {
              height: page.content.height + 120,
              left: 0,
              top: 0,
              width: page.content.width,
            },
            split: 'avoid',
          },
          type: 'box',
        };
      },
      page: { margins: 96, preset: 'a4' },
    }));
    const snapshot = layout.getSnapshot();

    expect(snapshot.pages).toHaveLength(2);
    expect(snapshot.fragments.map((fragment) => fragment.path)).toEqual([
      [0],
      [1],
    ]);
    expect(snapshot.fragments[0]!.units).toEqual([
      expect.objectContaining({
        kind: 'image',
        path: [0],
        rect: expect.objectContaining({
          height: snapshot.page.content.height + 120,
          top: snapshot.page.content.top,
        }),
      }),
    ]);
    expect(snapshot.fragments[1]!.top).toBe(snapshot.pages[1]!.content.top);

    layout.destroy();
  });
});

describe('paginatePlitePageLayoutBlocks', () => {
  it('moves overflow fragments to later fixed-size pages', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const output = paginatePlitePageLayoutBlocks({
      measuredBlocks: [
        {
          blockIndex: 0,
          element: {
            type: 'paragraph',
            children: [{ text: 'Long' }],
          },
          lineCount: Math.ceil(page.content.height / 24) + 4,
          lineHeight: 24,
          path: [0],
          spacingAfter: 12,
          text: 'Long',
          textStyle: { font: '400 16px Inter' },
        },
      ],
      page,
      settings,
      version: 1,
    });

    expect(output.pages).toHaveLength(2);
    expect(output.pages.map((fragmentPage) => fragmentPage.height)).toEqual([
      page.height,
      page.height,
    ]);
    expect(output.fragments.map((fragment) => fragment.pageIndex)).toEqual([
      0, 1,
    ]);
    expect(output.fragments[1]!.top).toBe(page.content.top);
    expect(output.fragments[0]!.lines[0]!.top).toBe(page.content.top);
    expect(output.fragments[1]!.lines[0]!.top).toBe(page.content.top);
  });

  it('moves avoid-split structured blocks to the next page when they do not fit', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const output = paginatePlitePageLayoutBlocks({
      measuredBlocks: [
        {
          blockIndex: 0,
          element: {
            type: 'paragraph',
            children: [{ text: 'Filler' }],
          },
          lineCount: 37,
          lineHeight: 24,
          path: [0],
          spacingAfter: 12,
          text: 'Filler',
          textStyle: { font: '400 16px Inter' },
        },
        {
          blockIndex: 1,
          boxes: [
            {
              kind: 'block',
              path: [1],
              rect: { height: 48, left: 0, top: 0, width: 0 },
              split: 'avoid',
            },
          ],
          element: {
            type: 'code-block',
            children: [{ text: 'one\ntwo' }],
          },
          lineCount: 2,
          lineHeight: 24,
          lines: [
            {
              end: 3,
              height: 24,
              start: 0,
              text: 'one',
              width: 24,
            },
            {
              end: 7,
              height: 24,
              start: 4,
              text: 'two',
              width: 24,
            },
          ],
          path: [1],
          spacingAfter: 12,
          text: 'one\ntwo',
          textStyle: { font: '400 16px Inter' },
        },
      ],
      page,
      settings,
      version: 1,
    });

    expect(output.fragments.map((fragment) => fragment.pageIndex)).toEqual([
      0, 1,
    ]);
    expect(output.fragments[1]!).toMatchObject({
      blockIndex: 1,
      lineCount: 2,
      pageIndex: 1,
      path: [1],
      top: page.content.top,
    });
  });
});

describe('getPlitePageLayoutProjection', () => {
  it('projects text and native hit rects without changing visual width', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const measuredBlocks = Array.from({ length: 2 }, (_, blockIndex) => ({
      blockIndex,
      element: {
        type: 'paragraph',
        children: [{ text: blockIndex === 0 ? 'Hi' : 'Next' }],
      },
      lineCount: 1,
      lineHeight: 24,
      lines: [
        {
          end: blockIndex === 0 ? 2 : 4,
          height: 24,
          start: 0,
          text: blockIndex === 0 ? 'Hi' : 'Next',
          width: blockIndex === 0 ? 16 : 32,
        },
      ],
      path: [blockIndex],
      spacingAfter: 12,
      text: blockIndex === 0 ? 'Hi' : 'Next',
      textStyle: { font: '400 16px Inter' },
    }));
    const output = paginatePlitePageLayoutBlocks({
      measuredBlocks,
      page,
      settings,
      version: 1,
    });
    const projection = getPlitePageLayoutProjection(
      {
        blocks: measuredBlocks,
        fragments: output.fragments,
        page,
        pages: output.pages,
        root: 'main',
        settings,
        version: 1,
      },
      { hitTesting: { inlineInset: 2 } }
    );

    expect(projection.lines[0]!.textRect).toEqual({
      height: 24,
      left: page.content.left + 2,
      top: page.content.top,
      width: 16,
    });
    expect(projection.lines[0]!.hitRect).toEqual({
      height: 36,
      left: page.content.left + 2,
      top: page.content.top,
      width: page.content.width - 2,
    });
    expect(projection.lines[1]!.hitRect).toEqual({
      height: 24,
      left: page.content.left + 2,
      top: page.content.top + 36,
      width: page.content.width - 2,
    });
  });

  it('builds per-text decorations from projected layout runs', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Bold ', bold: true },
            { text: 'code', code: true },
          ],
        },
      ],
    });
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      page: pageSettings,
    }));
    const projection = getPlitePageLayoutProjection(layout.getSnapshot(), {
      hitTesting: { inlineInset: 2 },
    });
    const decorations = getPlitePageLayoutDecorations(projection, {
      data: ({ rects }) => ({
        paginationLine: {
          hitRect: rects.hitRect,
          textRect: rects.textRect,
        },
      }),
      rects: 'block',
    });

    expect(
      [...decorations.entries()].map(([pathKey, pathDecorations]) => [
        pathKey,
        pathDecorations.map((decoration) => ({
          data: decoration.data,
          key: decoration.key,
          range: decoration.range,
        })),
      ])
    ).toEqual([
      [
        '0.0',
        [
          {
            data: {
              paginationLine: {
                hitRect: {
                  height: 24,
                  left: 2,
                  top: 0,
                  width: 40,
                },
                textRect: {
                  height: 24,
                  left: 2,
                  top: 0,
                  width: 40,
                },
              },
            },
            key: `plite-layout:${projection.lines[0]!.fragmentId}:0:0.0:0-5`,
            range: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 5 },
            },
          },
        ],
      ],
      [
        '0.1',
        [
          {
            data: {
              paginationLine: {
                hitRect: {
                  height: 24,
                  left: 42,
                  top: 0,
                  width: projection.blocks[0]!.width - 42,
                },
                textRect: {
                  height: 24,
                  left: 42,
                  top: 0,
                  width: 32,
                },
              },
            },
            key: `plite-layout:${projection.lines[0]!.fragmentId}:0:0.1:0-4`,
            range: {
              anchor: { path: [0, 1], offset: 0 },
              focus: { path: [0, 1], offset: 4 },
            },
          },
        ],
      ],
    ]);

    expect([
      ...getPlitePageLayoutDecorations(projection, {
        filter: ({ run }) => run.path[1] === 1,
      }).keys(),
    ]).toEqual(['0.1']);

    layout.destroy();
  });

  it('projects repeated empty inserted blocks into separate editable boxes', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const page = createPlitePage(settings);
    const measuredBlocks = Array.from({ length: 4 }, (_, blockIndex) => ({
      blockIndex,
      element: {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      lineCount: 1,
      lineHeight: 24,
      lines: [
        {
          end: 0,
          height: 24,
          start: 0,
          text: '',
          width: 0,
        },
      ],
      path: [blockIndex],
      spacingAfter: 12,
      text: '',
      textStyle: { font: '400 16px Inter' },
    }));
    const output = paginatePlitePageLayoutBlocks({
      measuredBlocks,
      page,
      settings,
      version: 1,
    });
    const projection = getPlitePageLayoutProjection({
      blocks: measuredBlocks,
      fragments: output.fragments,
      page,
      pages: output.pages,
      root: 'main',
      settings,
      version: 1,
    });

    expect(projection.blocks.map((block) => block.path)).toEqual([
      [0],
      [1],
      [2],
      [3],
    ]);
    expect(projection.blocks.map((block) => block.top)).toEqual([
      page.content.top,
      page.content.top + 36,
      page.content.top + 72,
      page.content.top + 108,
    ]);
    expect(
      projection.blocks.every(
        (block) => block.height === 24 && block.width === page.content.width
      )
    ).toBe(true);
    expect(projection.lines.map((line) => line.path)).toEqual([
      [0],
      [1],
      [2],
      [3],
    ]);
    expect(projection.lines.every((line) => line.start === line.end)).toBe(
      true
    );
    expect(projection.lines.every((line) => line.width === 0)).toBe(true);
  });
});

describe('getPlitePageLayoutGeometry', () => {
  it('stacks single-page mode without changing page dimensions', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [createPlitePage(settings, 0), createPlitePage(settings, 1)];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'single',
    });

    expect(geometry.width).toBe(pages[0]!.width);
    expect(geometry.height).toBe(pages[0]!.height * 2 + 24);
    expect(geometry.pagePlacements).toEqual([
      { left: 0, top: 0 },
      { left: 0, top: pages[0]!.height + 24 },
    ]);
  });

  it('places facing pages in rows while keeping odd trailing pages on the left', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [
      createPlitePage(settings, 0),
      createPlitePage(settings, 1),
      createPlitePage(settings, 2),
    ];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'spread',
    });

    expect(geometry.width).toBe(pages[0]!.width * 2 + 24);
    expect(geometry.height).toBe(pages[0]!.height * 2 + 24);
    expect(geometry.pagePlacements).toEqual([
      { left: 0, top: 0 },
      { left: pages[0]!.width + 24, top: 0 },
      { left: 0, top: pages[0]!.height + 24 },
    ]);
  });
});

describe('PagedEditable page mount plan', () => {
  it('creates one mount item per page in single-page mode', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [
      createPlitePage(settings, 0),
      createPlitePage(settings, 1),
      createPlitePage(settings, 2),
    ];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'single',
    });
    const plan = createPagedEditablePageMountPlan({
      fragments: [
        { blockIndex: 0, pageIndex: 0, path: [0] },
        { blockIndex: 1, pageIndex: 1, path: [1] },
        { blockIndex: 2, pageIndex: 2, path: [2] },
      ],
      geometry,
      mode: 'single',
      pages,
    });

    expect(plan.items).toEqual([
      {
        index: 0,
        fragmentPaths: [[0]],
        key: 'page-mount:0',
        pageIndexes: [0],
        size: pages[0]!.height,
        start: 0,
        topLevelIndexes: [0],
        unitPaths: [],
      },
      {
        index: 1,
        fragmentPaths: [[1]],
        key: 'page-mount:1',
        pageIndexes: [1],
        size: pages[1]!.height,
        start: pages[0]!.height + 24,
        topLevelIndexes: [1],
        unitPaths: [],
      },
      {
        index: 2,
        fragmentPaths: [[2]],
        key: 'page-mount:2',
        pageIndexes: [2],
        size: pages[2]!.height,
        start: (pages[0]!.height + 24) * 2,
        topLevelIndexes: [2],
        unitPaths: [],
      },
    ]);
    expect([...plan.itemIndexesByTopLevelIndex]).toEqual([
      [0, [0]],
      [1, [1]],
      [2, [2]],
    ]);
  });

  it('groups facing pages into spread mount items', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [
      createPlitePage(settings, 0),
      createPlitePage(settings, 1),
      createPlitePage(settings, 2),
    ];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'spread',
    });
    const plan = createPagedEditablePageMountPlan({
      fragments: [
        { blockIndex: 0, pageIndex: 0, path: [0] },
        { blockIndex: 1, pageIndex: 1, path: [1] },
        { blockIndex: 2, pageIndex: 2, path: [2] },
        { blockIndex: 3, pageIndex: 2, path: [3] },
      ],
      geometry,
      mode: 'spread',
      pages,
    });

    expect(plan.items).toEqual([
      {
        index: 0,
        fragmentPaths: [[0], [1]],
        key: 'page-mount:0-1',
        pageIndexes: [0, 1],
        size: pages[0]!.height,
        start: 0,
        topLevelIndexes: [0, 1],
        unitPaths: [],
      },
      {
        index: 1,
        fragmentPaths: [[2], [3]],
        key: 'page-mount:2',
        pageIndexes: [2],
        size: pages[2]!.height,
        start: pages[0]!.height + 24,
        topLevelIndexes: [2, 3],
        unitPaths: [],
      },
    ]);
  });

  it('mounts an initial virtualized page window before the viewport is known', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [
      createPlitePage(settings, 0),
      createPlitePage(settings, 1),
      createPlitePage(settings, 2),
      createPlitePage(settings, 3),
    ];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'single',
    });
    const plan = createPagedEditablePageMountPlan({
      fragments: pages.map((page) => ({
        blockIndex: page.index,
        pageIndex: page.index,
        path: [page.index],
      })),
      geometry,
      mode: 'single',
      pages,
    });

    expect(
      getPagedEditableVisiblePageMountItems(plan, {
        gap: 24,
        overscan: 0,
        pages,
        virtualizes: true,
        viewport: null,
      }).map((item) => item.index)
    ).toEqual([0]);
    expect(
      getPagedEditableVisiblePageMountItems(plan, {
        gap: 24,
        overscan: 1,
        pages,
        virtualizes: true,
        viewport: null,
      }).map((item) => item.index)
    ).toEqual([0, 1]);
    expect(
      getPagedEditableVisiblePageMountItems(plan, {
        gap: 24,
        overscan: 0,
        pages,
        virtualizes: true,
        viewport: { bottom: pages[0]!.height / 2, top: 0 },
      }).map((item) => item.index)
    ).toEqual([0]);
  });

  it('retains split blocks on every page that owns one of their fragments', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = [
      createPlitePage(settings, 0),
      createPlitePage(settings, 1),
      createPlitePage(settings, 2),
    ];
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'single',
    });
    const plan = createPagedEditablePageMountPlan({
      fragments: [
        { blockIndex: 0, pageIndex: 0, path: [0] },
        { blockIndex: 0, pageIndex: 1, path: [0] },
        { blockIndex: 1, pageIndex: 1, path: [1] },
        { blockIndex: 2, pageIndex: 2, path: [2] },
      ],
      geometry,
      mode: 'single',
      pages,
    });

    expect(plan.items.map((item) => item.topLevelIndexes)).toEqual([
      [0],
      [0, 1],
      [2],
    ]);
    expect([...plan.itemIndexesByTopLevelIndex]).toEqual([
      [0, [0, 1]],
      [1, [1]],
      [2, [2]],
    ]);
  });

  it('retains visible, selected, promoted, and composing pages', () => {
    const settings = { margins: 96, preset: 'a4' } as const;
    const pages = Array.from({ length: 6 }, (_, index) =>
      createPlitePage(settings, index)
    );
    const geometry = getPlitePageLayoutGeometry(pages, {
      pageGap: 24,
      pageLayoutMode: 'spread',
    });
    const plan = createPagedEditablePageMountPlan({
      fragments: pages.map((page) => ({
        blockIndex: page.index,
        pageIndex: page.index,
        path: [page.index],
      })),
      geometry,
      mode: 'spread',
      pages,
    });

    const mountedPageIndexes = getPagedEditableMountedPageIndexes(plan, {
      composingTopLevelIndex: 5,
      promotedTopLevelIndex: 4,
      selectedTopLevelIndex: 2,
      visibleItemIndexes: [0],
    });

    expect(mountedPageIndexes).toEqual([0, 1, 2, 3, 4, 5]);
    expect(
      getPagedEditableMountedPageIndexes(plan, {
        selectedTopLevelIndex: 4,
        visibleItemIndexes: [0],
      })
    ).toEqual([0, 1, 4, 5]);
  });
});
