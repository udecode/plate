import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import type { Descendant } from '@platejs/plite';
import {
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  point as editorPoint,
  range as editorRange,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import { vi } from 'vitest';
import {
  createReactEditor,
  Editable,
  type EditableDOMStrategyMetrics,
  Plite,
} from '../src';
import { createDecorationSource } from '../src/decoration-source';
import { createLayoutVirtualizerSizeMap } from '../src/dom-strategy/use-virtualized-root-plan';
import { syncEditableDOMSelectionToEditor } from '../src/editable/selection-controller';
import { didSyncTextPathToDOM } from '../src/hooks/use-plite-node-ref';
import { createPliteReactRenderCounter } from '../src/render-profiler';

type InternalPartialDOMStrategyForTest = {
  overscan?: number;
  previewChars?: number;
  segmentSize?: number;
  threshold?: number;
  type: 'partial-dom';
};

type TestEditorSurfaceProps = Omit<
  React.ComponentProps<typeof Editable>,
  'domStrategy'
> & {
  domStrategy?:
    | React.ComponentProps<typeof Editable>['domStrategy']
    | InternalPartialDOMStrategyForTest;
  editor: React.ComponentProps<typeof Plite>['editor'];
};

const TestEditorSurface = ({ editor, ...props }: TestEditorSurfaceProps) => (
  <Plite editor={editor}>
    <Editable {...(props as React.ComponentProps<typeof Editable>)} />
  </Plite>
);

const getRuntimeId = (
  editor: ReturnType<typeof createReactEditor>,
  path: number[]
) => {
  const runtimeId = editorGetRuntimeId(editor, path);

  if (!runtimeId) {
    throw new Error(`Missing runtime id at ${path.join('.')}`);
  }

  return runtimeId;
};

const fireEditorSelectAll = (root: HTMLElement) => {
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  fireEvent.keyDown(root, {
    bubbles: true,
    ctrlKey: true,
    key: 'a',
  });
};

const fireEditorPaste = (
  root: HTMLElement,
  clipboardData: {
    getData: (type?: string) => string;
    types: string[];
  }
) => {
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  fireEvent.paste(root, { clipboardData });
};

test('Editable full DOM Ctrl+A keeps select-all native-owned', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface editor={editor} id="full-dom-select-all" />
  );
  const root = rendered.container.querySelector(
    '#full-dom-select-all'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: editorPoint(editor, [], { edge: 'start' }),
    focus: editorPoint(editor, [], { edge: 'end' }),
  });
  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(null);
  expect(
    rendered.container.querySelectorAll('[data-plite-view-selection="true"]')
  ).toHaveLength(0);
});

test('Editable domStrategy partial-DOMs far segments without mounting editable descendants', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-partial-doms"
    />
  );

  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(2);
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(2);
  expect(
    rendered.container
      .querySelector(
        '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
      )
      ?.textContent?.includes('block-3')
  ).toBe(true);

  const partialDOMPlaceholderBoundaries = DOMCoverage.getBoundaries(
    editor
  ).filter((boundary) => boundary.reason === 'partial-dom-aggressive');

  expect(
    partialDOMPlaceholderBoundaries.map((boundary) => boundary.boundaryId)
  ).toEqual(['partial-dom-aggressive:1', 'partial-dom-aggressive:2']);
  expect(
    DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:1')
  ).toMatchObject({
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [2], focus: [3] }],
    coveredRuntimeRanges: [
      {
        anchor: getRuntimeId(editor, [2]),
        focus: getRuntimeId(editor, [3]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
    reason: 'partial-dom-aggressive',
    selectionPolicy: 'model',
    state: 'virtualized',
  });
  expect(
    DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:2')
  ).toMatchObject({
    coveredPathRanges: [{ anchor: [4], focus: [5] }],
    reason: 'partial-dom-aggressive',
    selectionPolicy: 'model',
    state: 'virtualized',
  });
  expect(
    rendered.container
      .querySelector(
        '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
      )
      ?.getAttribute('data-plite-dom-coverage-boundary')
  ).toBe('partial-dom-aggressive:1');
});

test('Editable domStrategy partial-DOM defaults to smaller promotion segments', async () => {
  const editor = createReactEditor();
  const metrics: EditableDOMStrategyMetrics[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 120 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-partial-dom-default-segment-size"
      onDOMStrategyMetrics={(metric) => {
        metrics.push(metric);
      }}
    />
  );

  await waitFor(() => expect(metrics.length).toBeGreaterThan(0));

  expect(metrics.at(-1)).toMatchObject({
    segmentSize: 32,
  });
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(32);
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(3);
});

test('Editable domStrategy partial-DOM updates coverage when the hidden tail runtime changes', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 4,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-partial-dom-tail-runtime"
    />
  );

  const oldTailRuntimeId = getRuntimeId(editor, [7]);

  expect(
    DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:1')
  ).toMatchObject({
    coveredPathRanges: [{ anchor: [4], focus: [7] }],
    coveredRuntimeRanges: [
      {
        anchor: getRuntimeId(editor, [4]),
        focus: oldTailRuntimeId,
      },
    ],
  });

  await act(async () => {
    editor.update((tx) => {
      tx.nodes.remove({ at: [7] });
      tx.nodes.insert(
        {
          type: 'paragraph',
          children: [{ text: 'replacement tail' }],
        } as Descendant,
        { at: [7] }
      );
    });
  });

  const newTailRuntimeId = getRuntimeId(editor, [7]);

  expect(newTailRuntimeId).not.toBe(oldTailRuntimeId);
  await waitFor(() =>
    expect(
      DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:1')
    ).toMatchObject({
      coveredPathRanges: [{ anchor: [4], focus: [7] }],
      coveredRuntimeRanges: [
        {
          anchor: getRuntimeId(editor, [4]),
          focus: newTailRuntimeId,
        },
      ],
    })
  );
  expect(
    DOMCoverage.getBoundaryForPoint(editor, { offset: 0, path: [7, 0] })
      ?.boundaryId
  ).toBe('partial-dom-aggressive:1');
});

test('Editable domStrategy partial-DOM refreshes hidden preview text after model text changes', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 4,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-partial-dom-preview-refresh"
    />
  );
  const partialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  );

  expect(partialDOMPlaceholder?.textContent).toContain('block-5');

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [4, 0], offset: 'block-5'.length } });
    });
  });

  await waitFor(() =>
    expect(partialDOMPlaceholder?.textContent).toContain('block-5!')
  );
});

test('Editable domStrategy mounts active radius corridor segments', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 1,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-active-corridor"
    />
  );

  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(4);
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(1);
  expect(
    rendered.container
      .querySelector(
        '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
      )
      ?.textContent?.includes('block-5')
  ).toBe(true);
});

test('Editable domStrategy experimental virtualized mode uses viewport DOM coverage and materializes selected segments', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-virtualized"
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(0);
  const initialVirtualizedBoundary = DOMCoverage.getBoundaries(editor).find(
    (boundary) => boundary.reason === 'viewport-virtualization'
  );

  expect(initialVirtualizedBoundary).toMatchObject({
    copyPolicy: 'model',
    findPolicy: 'native',
    reason: 'viewport-virtualization',
    selectionPolicy: 'materialize',
    state: 'virtualized',
  });

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      });
    });
  });

  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBe(null);
  expect(
    DOMCoverage.getBoundaryForPoint(editor, { offset: 0, path: [2, 0] })
  ).toBe(null);
  expect(
    DOMCoverage.getBoundaries(editor).some(
      (boundary) => boundary.reason === 'viewport-virtualization'
    )
  ).toBe(true);
  expect(
    DOMCoverage.getBoundaries(editor).find(
      (boundary) => boundary.reason === 'viewport-virtualization'
    )
  ).toMatchObject({
    reason: 'viewport-virtualization',
    selectionPolicy: 'materialize',
    state: 'virtualized',
  });
});

test('Editable domStrategy experimental virtualized mode can use layout-backed item geometry', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 4 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    },
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      domStrategyLayout={{
        getVirtualizedTopLevelItems: () => [
          { index: 0, size: 20, start: 0 },
          { index: 1, size: 80, start: 20 },
          { index: 2, size: 20, start: 100 },
          { index: 3, size: 80, start: 120 },
        ],
      }}
      editor={editor}
      id="dom-strategy-virtualized-layout"
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );

  const virtualizer = rendered.container.querySelector(
    '[data-plite-dom-strategy-virtualizer="true"]'
  ) as HTMLElement | null;

  expect(virtualizer?.style.height).toBe('200px');
  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtual-row="true"][data-index="1"]'
      )
    ).toBeTruthy()
  );

  const secondRow = rendered.container.querySelector(
    '[data-plite-dom-strategy-virtual-row="true"][data-index="1"]'
  ) as HTMLElement | null;
  const secondRowGroup = secondRow?.closest(
    '[data-plite-dom-strategy-virtual-row-group="true"]'
  ) as HTMLElement | null;

  expect(secondRow?.style.minHeight).toBe('80px');
  expect(secondRowGroup?.style.transform).toBe('translateY(20px)');
});

test('Editable domStrategy experimental virtualized mode preserves layout gaps between consecutive rows', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 4 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      domStrategyLayout={{
        getVirtualizedPageItems: () => [
          {
            index: 0,
            key: 'page-0',
            pageIndexes: [0],
            size: 100,
            start: 0,
            topLevelIndexes: [0, 1],
          },
          {
            index: 1,
            key: 'page-1',
            pageIndexes: [1],
            size: 100,
            start: 140,
            topLevelIndexes: [2, 3],
          },
        ],
        getVisibleVirtualizedPageItems: () => [
          {
            index: 0,
            key: 'page-0',
            pageIndexes: [0],
            size: 100,
            start: 0,
            topLevelIndexes: [0, 1],
          },
          {
            index: 1,
            key: 'page-1',
            pageIndexes: [1],
            size: 100,
            start: 140,
            topLevelIndexes: [2, 3],
          },
        ],
        getVirtualizedTopLevelItems: () => [
          { index: 0, size: 20, start: 0 },
          { index: 1, size: 80, start: 20 },
          { index: 2, size: 20, start: 140 },
          { index: 3, size: 80, start: 160 },
        ],
      }}
      editor={editor}
      id="dom-strategy-virtualized-layout-gap"
      style={{ height: 240, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtual-row="true"][data-index="2"]'
      )
    ).toBeTruthy()
  );

  const thirdRow = rendered.container.querySelector(
    '[data-plite-dom-strategy-virtual-row="true"][data-index="2"]'
  ) as HTMLElement | null;
  const thirdRowGroup = thirdRow?.closest(
    '[data-plite-dom-strategy-virtual-row-group="true"]'
  ) as HTMLElement | null;

  expect(thirdRow?.style.minHeight).toBe('20px');
  expect(thirdRowGroup?.style.transform).toBe('translateY(140px)');
});

test('Editable domStrategy experimental virtualized mode materializes layout-backed targets through exact offsets', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      domStrategyLayout={{
        getVirtualizedTopLevelItems: () => [
          { index: 0, size: 20, start: 0 },
          { index: 1, size: 80, start: 20 },
          { index: 2, size: 20, start: 100 },
          { index: 3, size: 80, start: 120 },
          { index: 4, size: 20, start: 200 },
          { index: 5, size: 80, start: 220 },
          { index: 6, size: 20, start: 300 },
          { index: 7, size: 80, start: 320 },
        ],
      }}
      editor={editor}
      id="dom-strategy-virtualized-layout-scroll"
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-virtualized-layout-scroll'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  Object.defineProperties(root!, {
    clientHeight: {
      configurable: true,
      value: 48,
    },
    scrollHeight: {
      configurable: true,
      value: 400,
    },
  });

  const scrollTo = vi.fn((options?: ScrollToOptions) => {
    root!.scrollTop = Number(options?.top ?? 0);
  });

  Object.defineProperty(root!, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  });

  const targetRange = {
    anchor: { offset: 0, path: [5, 0] },
    focus: { offset: 0, path: [5, 0] },
  };

  const boundary = await waitFor(() => {
    const nextBoundary = DOMCoverage.getBoundaryForPoint(
      editor,
      targetRange.anchor
    );

    expect(nextBoundary).toMatchObject({
      reason: 'viewport-virtualization',
      selectionPolicy: 'materialize',
    });

    return nextBoundary;
  });

  scrollTo.mockClear();

  await act(async () => {
    expect(
      DOMCoverage.materializeBoundary(
        editor,
        boundary!.boundaryId,
        'selection',
        {
          range: targetRange,
        }
      )
    ).toMatchObject({ status: 'handled' });
  });

  await waitFor(() => expect(scrollTo).toHaveBeenCalled());
  expect(scrollTo).toHaveBeenLastCalledWith({
    behavior: 'auto',
    top: 236,
  });
});

test('Editable domStrategy experimental virtualized mode materializes estimated targets through virtualizer index scrolling', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-virtualized-estimated-scroll"
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-virtualized-estimated-scroll'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  Object.defineProperties(root!, {
    clientHeight: {
      configurable: true,
      value: 48,
    },
    scrollHeight: {
      configurable: true,
      value: 192,
    },
  });

  const scrollTo = vi.fn((options?: ScrollToOptions) => {
    root!.scrollTop = Number(options?.top ?? 0);
  });

  Object.defineProperty(root!, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  });

  const targetRange = {
    anchor: { offset: 0, path: [5, 0] },
    focus: { offset: 0, path: [5, 0] },
  };

  const boundary = await waitFor(() => {
    const nextBoundary = DOMCoverage.getBoundaryForPoint(
      editor,
      targetRange.anchor
    );

    expect(nextBoundary).toMatchObject({
      reason: 'viewport-virtualization',
      selectionPolicy: 'materialize',
    });

    return nextBoundary;
  });

  scrollTo.mockClear();

  await act(async () => {
    expect(
      DOMCoverage.materializeBoundary(
        editor,
        boundary!.boundaryId,
        'selection',
        {
          range: targetRange,
        }
      )
    ).toMatchObject({ status: 'handled' });
  });

  await waitFor(() => expect(scrollTo).toHaveBeenCalled());
  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtual-row="true"][data-index="5"]'
      )
    ).toBeTruthy()
  );
});

test('Editable domStrategy experimental virtualized mode estimates layout-backed page gaps', () => {
  const sizeByIndex = createLayoutVirtualizerSizeMap([
    { index: 0, size: 20, start: 0 },
    { index: 1, size: 20, start: 120 },
    { index: 2, size: 20, start: 240 },
    { index: 3, size: 20, start: 360 },
    { index: 4, size: 20, start: 480 },
  ]);

  expect([...sizeByIndex]).toEqual([
    [0, 120],
    [1, 120],
    [2, 120],
    [3, 120],
    [4, 20],
  ]);
});

test('Editable domStrategy experimental virtualized mode keeps broad selections model-backed', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-virtualized-select-all"
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-virtualized-select-all'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: editorPoint(editor, [], { edge: 'start' }),
    focus: editorPoint(editor, [], { edge: 'end' }),
  });
  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(
    'partial-dom-backed'
  );
  expect(
    DOMCoverage.getBoundariesForRange(editor, editorRange(editor, []))
      .filter((boundary) => boundary.reason === 'viewport-virtualization')
      .every((boundary) => boundary.copyPolicy === 'model')
  ).toBe(true);
});

test('Editable reports domStrategy metrics for experimental virtualized surfaces', async () => {
  const editor = createReactEditor();
  const recordedMetrics: EditableDOMStrategyMetrics[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 24,
        overscan: 0,
        type: 'virtualized',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-virtualized-metrics"
      onDOMStrategyMetrics={(metric) => {
        recordedMetrics.push(metric);
      }}
      style={{ height: 48, overflowY: 'auto' }}
    />
  );

  await waitFor(() => expect(recordedMetrics.length).toBeGreaterThan(0));

  const latest = recordedMetrics.at(-1)!;

  expect(latest).toMatchObject({
    activeSegmentIndex: null,
    overscan: 0,
    cohort: 'normal',
    degradationMode: 'virtualized',
    documentSize: 6,
    effectiveStrategy: 'virtualized',
    estimatedBlockSize: 24,
    segmentSize: null,
    nativeSurfaceComplete: false,
    requestedStrategy: 'virtualized',
    threshold: 1,
    viewportVirtualizationBoundaryCount: 1,
  });
  expect(latest.mountedTopLevelCount).toBeGreaterThanOrEqual(0);
  expect(latest.pendingTopLevelCount).toBe(
    latest.documentSize - latest.mountedTopLevelCount
  );
  expect(latest.virtualizerMeasuredCount).toBeGreaterThanOrEqual(0);
  expect(latest.domCoverageBoundaryCount).toBeGreaterThanOrEqual(1);
  expect(latest.domCoverageBoundaryElementCount).toBe(1);
  expect(latest.domNodeCount).toBeGreaterThan(0);
  expect(latest.editableDescendantCount).toBeGreaterThanOrEqual(0);
});

test('Editable reports domStrategy metrics for staged active DOM group surfaces', async () => {
  const editor = createReactEditor();
  const recordedMetrics: EditableDOMStrategyMetrics[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-metrics"
      onDOMStrategyMetrics={(metric) => {
        recordedMetrics.push(metric);
      }}
    />
  );

  await waitFor(() => expect(recordedMetrics.length).toBeGreaterThan(0));

  const latest = recordedMetrics.at(-1)!;

  expect(latest).toMatchObject({
    cohort: 'medium',
    degradationMode: 'staged-warmup',
    documentSize: 1001,
    effectiveStrategy: 'staged',
    mountedGroupCount: 1,
    mountedTopLevelCount: 16,
    nativeSurfaceComplete: false,
    pendingGroupCount: 62,
    pendingTopLevelCount: 985,
    requestedStrategy: 'staged',
  });
  expect(latest.domStrategyStagedBoundaryCount).toBeGreaterThan(0);
  expect(latest.domCoverageBoundaryElementCount).toBeGreaterThan(0);
  expect(latest.domNodeCount).toBeGreaterThan(0);
  expect(latest.editableDescendantCount).toBeGreaterThan(0);
});

test('Editable auto keeps large documents DOM-bounded instead of staged background mounting', async () => {
  const editor = createReactEditor();
  const recordedMetrics: EditableDOMStrategyMetrics[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="auto"
      editor={editor}
      id="dom-strategy-auto-bounded"
      onDOMStrategyMetrics={(metric) => {
        recordedMetrics.push(metric);
      }}
    />
  );

  await waitFor(() => expect(recordedMetrics.length).toBeGreaterThan(0));

  const latest = recordedMetrics.at(-1)!;

  expect(latest).toMatchObject({
    cohort: 'medium',
    degradationMode: 'partial-dom',
    documentSize: 1001,
    effectiveStrategy: 'partial-dom',
    mountedGroupCount: 1,
    mountedTopLevelCount: 32,
    nativeSurfaceComplete: false,
    pendingTopLevelCount: 969,
    requestedStrategy: 'auto',
    segmentSize: 32,
  });
  expect(latest.aggressiveDomCoverageBoundaryCount).toBeGreaterThan(0);
  expect(latest.domStrategyStagedBoundaryCount).toBe(0);
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(32);
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBeGreaterThan(0);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 750));
  });

  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(32);
});

test('Editable reports domStrategy degradation mode for plain and internal partial DOM surfaces', async () => {
  const plainEditor = createReactEditor();
  const partialDOMPlaceholderEditor = createReactEditor();
  const plainMetrics: EditableDOMStrategyMetrics[] = [];
  const partialDOMMetrics: EditableDOMStrategyMetrics[] = [];

  const children = Array.from({ length: 6 }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index + 1}` }],
  }));

  editorReplace(plainEditor, {
    children,
    selection: null,
  });
  editorReplace(partialDOMPlaceholderEditor, {
    children,
    selection: null,
  });

  render(
    <>
      <TestEditorSurface
        editor={plainEditor}
        id="dom-strategy-plain-metrics"
        onDOMStrategyMetrics={(metric) => {
          plainMetrics.push(metric);
        }}
      />
      <TestEditorSurface
        domStrategy={{
          overscan: 0,
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        editor={partialDOMPlaceholderEditor}
        id="dom-strategy-partial-dom-metrics"
        onDOMStrategyMetrics={(metric) => {
          partialDOMMetrics.push(metric);
        }}
      />
    </>
  );

  await waitFor(() => expect(plainMetrics.length).toBeGreaterThan(0));
  await waitFor(() => expect(partialDOMMetrics.length).toBeGreaterThan(0));

  expect(plainMetrics.at(-1)).toMatchObject({
    degradationMode: 'none',
    effectiveStrategy: 'plain',
    nativeSurfaceComplete: true,
  });
  expect(partialDOMMetrics.at(-1)).toMatchObject({
    degradationMode: 'partial-dom',
    effectiveStrategy: 'partial-dom',
    nativeSurfaceComplete: false,
    requestedStrategy: 'internal-partial-dom',
  });
});

test('Editable marks only default plain text as DOM-sync capable', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-default-dom-sync"
    />
  );

  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync')
  ).toBe('true');
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync-reason')
  ).toBe(false);
});

test('Editable disables DOM text sync for app-owned text renderers', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-custom-render-text"
      renderText={({ attributes, children }) => (
        <span {...attributes} data-custom-text="true">
          {children}
        </span>
      )}
    />
  );

  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('custom-text');
});

test('Editable disables DOM text sync for custom leaf renderers', async () => {
  const leafEditor = createReactEditor();

  const children: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
  ];

  editorReplace(leafEditor, {
    children,
    selection: null,
  });

  const leafRendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={leafEditor}
      id="dom-strategy-custom-render-leaf"
      renderLeaf={({ attributes, children }) => (
        <span {...attributes} data-custom-leaf="true">
          {children}
        </span>
      )}
    />
  );

  expect(
    leafRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    leafRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('custom-leaf');
});

test('Editable enables DOM text sync for text-invariant custom leaf renderers', async () => {
  const leafEditor = createReactEditor();

  editorReplace(leafEditor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const leafRendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        textSync: { renderLeaf: 'text-invariant' },
        threshold: 1,
        type: 'virtualized',
      }}
      editor={leafEditor}
      id="dom-strategy-text-invariant-render-leaf"
      renderLeaf={({ attributes, children }) => (
        <span {...attributes} data-custom-leaf="true">
          {children}
        </span>
      )}
    />
  );

  expect(
    leafRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync')
  ).toBe('true');
  expect(
    leafRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync-reason')
  ).toBe(false);
});

test('Editable disables DOM text sync for app-owned segment renderers', async () => {
  const segmentEditor = createReactEditor();

  editorReplace(segmentEditor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const segmentRendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={segmentEditor}
      id="dom-strategy-custom-render-segment"
      renderSegment={(_segment, children) => (
        <span data-custom-segment="true">{children}</span>
      )}
    />
  );

  expect(
    segmentRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    segmentRendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('custom-segment');
});

test('Editable disables DOM text sync when projections affect the text node', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createDecorationSource(editor, {
    id: 'highlight-alpha',
    read: () => [
      {
        key: 'highlight-alpha',
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      },
    ],
  });

  const rendered = render(
    <Plite decorationSources={[highlightSource]} editor={editor}>
      <Editable
        domStrategy={{
          overscan: 0,
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        id="dom-strategy-projection-dom-sync"
      />
    </Plite>
  );

  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('projection');

  highlightSource.destroy();
});

test('Editable treats native-updated projected text as synced without rewriting DOM', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createDecorationSource(editor, {
    id: 'highlight-alpha',
    read: () => [
      {
        key: 'highlight-alpha',
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      },
    ],
  });

  const rendered = render(
    <Plite decorationSources={[highlightSource]} editor={editor}>
      <Editable
        domStrategy={{
          overscan: 0,
          textSync: {
            projections: 'range-transform',
            renderLeaf: 'text-invariant',
          },
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        id="dom-strategy-native-projected-dom-sync"
      />
    </Plite>
  );
  const textElement = rendered.container.querySelector(
    '[data-plite-node="text"]'
  );
  const firstString = rendered.container.querySelector('[data-plite-string]');

  expect(textElement?.getAttribute('data-plite-dom-sync-reason')).toBe(
    'projection'
  );
  expect(textElement?.getAttribute('data-plite-projected-dom-sync')).toBe(
    'true'
  );
  expect(firstString?.textContent).toBe('alpha');

  if (!firstString) {
    throw new Error('Expected a projected Plite string.');
  }

  firstString.textContent = 'alpha!';

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(true);
  expect(firstString.textContent).toBe('alpha!');

  highlightSource.destroy();
});

test('Editable syncs projected leaf strings for Plite-owned text input', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createDecorationSource(editor, {
    id: 'highlight-alpha',
    read: () => [
      {
        key: 'highlight-alpha',
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      },
    ],
  });

  const rendered = render(
    <Plite decorationSources={[highlightSource]} editor={editor}>
      <Editable
        domStrategy={{
          overscan: 0,
          textSync: {
            projections: 'range-transform',
            renderLeaf: 'text-invariant',
          },
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        id="dom-strategy-projected-range-dom-sync"
      />
    </Plite>
  );

  expect(
    [...rendered.container.querySelectorAll('[data-plite-string]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha', ' beta']);

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(true);
  expect(
    [...rendered.container.querySelectorAll('[data-plite-string]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha!', ' beta']);

  highlightSource.destroy();
});

test('Editable disables DOM text sync for empty zero-width text', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-empty-dom-sync"
      placeholder="Write something"
    />
  );

  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('empty-text');
  expect(
    rendered.container.querySelector('[data-plite-zero-width]')
  ).toBeTruthy();
});

test('Editable falls back to React when text sync reaches empty text', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-empty-text-fallback"
      placeholder="Write something"
    />
  );

  expect(rendered.container.textContent).toContain('alpha');

  await act(async () => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      });
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(rendered.container.textContent).not.toContain('alpha');
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.hasAttribute('data-plite-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason')
  ).toBe('empty-text');
  expect(
    rendered.container.querySelector('[data-plite-zero-width]')
  ).toBeTruthy();
});

test('Editable falls back to React updates while composing', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-composition-dom-sync"
    />
  );

  IS_COMPOSING.set(editor, true);

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!');
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(rendered.container.textContent).toContain('alpha!');

  IS_COMPOSING.set(editor, false);
});

test('Editable staged full-document replacement removes stale far DOM immediately', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-replace"
    />
  );

  expect(rendered.container.textContent).toContain('line 15');
  expect(rendered.container.textContent).not.toContain('line 16');
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"]'
    )
  ).toBe(null);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 750));
  });

  expect(rendered.container.textContent).not.toContain('line 1000');

  await act(async () => {
    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'replacement marker' }],
          },
        ],
        selection: {
          anchor: { offset: 'replacement marker'.length, path: [0, 0] },
          focus: { offset: 'replacement marker'.length, path: [0, 0] },
        },
      });
    });
  });

  expect(editorString(editor, [])).toBe('replacement marker');
  expect(rendered.container.textContent).toContain('replacement marker');
  expect(rendered.container.textContent).not.toContain('line 1000');
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"]'
    )
  ).toBe(null);
});

test('Editable staged full-document replacement resets staged coverage without stale far DOM', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `old line ${index}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-large-replace"
    />
  );

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 750));
  });

  expect(rendered.container.textContent).not.toContain('old line 1000');
  expect(DOMCoverage.getBoundaries(editor)).toHaveLength(1);

  await act(async () => {
    editor.update((tx) => {
      tx.value.replace({
        children: Array.from({ length: 1001 }, (_, index) => ({
          type: 'paragraph',
          children: [{ text: `fresh line ${index}` }],
        })),
        selection: {
          anchor: { offset: 'fresh line 0'.length, path: [0, 0] },
          focus: { offset: 'fresh line 0'.length, path: [0, 0] },
        },
      });
    });
  });

  expect(editorString(editor, [])).toContain('fresh line 1000');
  expect(rendered.container.textContent).toContain('fresh line 0');
  expect(rendered.container.textContent).toContain('fresh line 15');
  expect(rendered.container.textContent).not.toContain('fresh line 16');
  expect(rendered.container.textContent).not.toContain('fresh line 1000');
  expect(rendered.container.textContent).not.toContain('old line 1000');
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"]'
    )
  ).toBe(null);

  const [boundary] = DOMCoverage.getBoundaries(editor);

  expect(boundary).toMatchObject({
    copyPolicy: 'materialize',
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
    reason: 'rendering-staged',
    selectionPolicy: 'materialize',
    state: 'pending-mount',
  });
  expect(boundary?.coveredPathRanges).toEqual([
    { anchor: [16], focus: [1000] },
  ]);
});

test('Editable staged stages far root groups without partial-DOM placeholders', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-staged"
    />
  );

  expect(rendered.container.textContent).toContain('line 0');
  expect(rendered.container.textContent).toContain('line 15');
  expect(rendered.container.textContent).not.toContain('line 16');
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-root-group-state="pending-mount"]'
    ).length
  ).toBe(1);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 750));
  });

  expect(rendered.container.textContent).not.toContain('line 1000');
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-root-group-state="pending-mount"]'
    ).length
  ).toBe(1);
});

test('Editable staged registers pending root groups as DOM coverage boundaries', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: null,
  });

  render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-coverage"
    />
  );

  const [boundary] = DOMCoverage.getBoundaries(editor);

  expect(boundary).toMatchObject({
    copyPolicy: 'materialize',
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
    reason: 'rendering-staged',
    selectionPolicy: 'materialize',
    state: 'pending-mount',
  });
  expect(boundary?.coveredPathRanges).toEqual([
    { anchor: [16], focus: [1000] },
  ]);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 750));
  });

  expect(DOMCoverage.getBoundaries(editor)).toHaveLength(1);
});

test('Editable staged selection export consults DOM coverage before raw DOM lookup', () => {
  const editor = createReactEditor();
  const materialized: string[] = [];
  const root = document.createElement('div');
  const selection = {
    anchor: { offset: 0, path: [1, 0] },
    focus: { offset: 0, path: [1, 0] },
  };

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'mounted block' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'pending block' }],
      },
    ],
    selection,
  });

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-plite-editor', 'true');
  document.body.append(root);
  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  try {
    const domSelection = document.getSelection();
    const rootRange = document.createRange();

    rootRange.selectNodeContents(root);
    domSelection?.removeAllRanges();
    domSelection?.addRange(rootRange);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder', runtimeId: getRuntimeId(editor, [1]) },
      boundaryId: 'rendering-staged:pending',
      copyPolicy: 'materialize',
      coveredPathRanges: [{ anchor: [1], focus: [1] }],
      coveredRuntimeRanges: [
        {
          anchor: getRuntimeId(editor, [1]),
          focus: getRuntimeId(editor, [1]),
        },
      ],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'rendering-staged',
      selectionPolicy: 'materialize',
      state: 'pending-mount',
      version: 1,
    });
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason) => {
      materialized.push(`${boundary.boundaryId}:${reason}`);
      return true;
    });

    syncEditableDOMSelectionToEditor({
      editor,
      scrollSelectionIntoView: () => {},
      partialDOMBackedSelection: false,
      state: {
        isUpdatingSelection: false,
        selectionChangeOrigin: null,
      },
    });

    expect(materialized).toEqual(['rendering-staged:pending:selection']);
    expect(domSelection?.rangeCount).toBe(0);
  } finally {
    DOMCoverage.clear(editor);
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(root);
    NODE_TO_ELEMENT.delete(editor);
    root.remove();
  }
});

test('Editable staged materializes pending root groups through DOM coverage', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-coverage-materialize"
    />
  );

  const [boundary] = DOMCoverage.getBoundaries(editor);

  expect(rendered.container.textContent).not.toContain('line 1000');
  expect(boundary?.reason).toBe('rendering-staged');

  await act(async () => {
    expect(
      DOMCoverage.materializeBoundary(editor, boundary!.boundaryId, 'selection')
    ).toMatchObject({ status: 'handled' });
  });

  expect(rendered.container.textContent).toContain('line 1000');
  expect(DOMCoverage.getBoundaries(editor)).toHaveLength(0);
});

test('Editable staged materializes the selected root group urgently', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1001 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-select"
    />
  );

  expect(rendered.container.textContent).not.toContain('line 1000');

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [1000, 0] },
        focus: { offset: 0, path: [1000, 0] },
      });
    });
  });

  expect(rendered.container.textContent).toContain('line 1000');
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"]'
    )
  ).toBe(null);
});

test('Editable domStrategy promotes a partial-DOM segment on mouse down', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  );

  expect(
    targetPartialDOMPlaceholder instanceof
      rendered.container.ownerDocument.defaultView!.HTMLElement
  ).toBe(true);

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new rendered.container.ownerDocument.defaultView!.MouseEvent(
        'mousedown',
        {
          bubbles: true,
        }
      )
    );
  });

  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBe(null);
  expect(DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:1')).toBe(
    null
  );
  expect(
    DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:2')
  ).toMatchObject({
    reason: 'partial-dom-aggressive',
    selectionPolicy: 'model',
    state: 'virtualized',
  });
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(2);
  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [2, 0] },
    focus: { offset: 0, path: [2, 0] },
  });
});

test('Editable domStrategy mounts only the target partial-DOM segment during the promotion frame', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 1,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-fast-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
  );

  expect(targetPartialDOMPlaceholder).toBeTruthy();

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.MouseEvent('mousedown', {
        bubbles: true,
      })
    );
  });

  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(2);
  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [4, 0] },
    focus: { offset: 0, path: [4, 0] },
  });

  await act(async () => {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
  });

  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(6);
});

test('Editable domStrategy promotes partial-DOM segments without a second root-plan pass', async () => {
  const editor = createReactEditor();
  const counter = createPliteReactRenderCounter();
  const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
  let rendered: ReturnType<typeof render> | null = null;

  editorReplace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

  try {
    rendered = render(
      <TestEditorSurface
        domStrategy={{
          overscan: 1,
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        editor={editor}
        id="dom-strategy-single-pass-promotion"
      />
    );

    const targetPartialDOMPlaceholder = rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
    );

    expect(targetPartialDOMPlaceholder).toBeTruthy();
    counter.reset();

    await act(async () => {
      targetPartialDOMPlaceholder!.dispatchEvent(
        new window.MouseEvent('mousedown', {
          bubbles: true,
        })
      );
    });

    expect(editorGetSnapshot(editor).selection).toEqual({
      anchor: { offset: 0, path: [4, 0] },
      focus: { offset: 0, path: [4, 0] },
    });
    expect(
      rendered.container.querySelectorAll('[data-plite-node="text"]').length
    ).toBe(2);
    expect(
      counter
        .snapshot()
        .events.filter(
          (event) =>
            event.kind === 'root-plan' &&
            event.id === 'dom-strategy-root-sources'
        )
    ).toHaveLength(1);
  } finally {
    rendered?.unmount();
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }
});

test('Editable domStrategy keeps model inserts stable after partial-DOM promotion', async () => {
  const editor = createReactEditor();
  const blockIndex = 2496;

  editorReplace(editor, {
    children: Array.from({ length: 5000 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-promotion-model-insert"
    />
  );
  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="78"]'
  );

  expect(targetPartialDOMPlaceholder).toBeTruthy();

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.MouseEvent('mousedown', {
        bubbles: true,
      })
    );
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [blockIndex, 0] },
    focus: { offset: 0, path: [blockIndex, 0] },
  });

  for (let index = 0; index < 10; index += 1) {
    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('X', { at: { path: [blockIndex, 0], offset: index } });
      });
    });
  }

  expect(editorString(editor, [blockIndex]).match(/X/g) ?? []).toHaveLength(10);
});

test('Editable domStrategy promotes large partial-DOM segments as bounded windows with tail coverage', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 96 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 32,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-large-window-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
  );

  expect(targetPartialDOMPlaceholder).toBeTruthy();

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.MouseEvent('mousedown', {
        bubbles: true,
      })
    );
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [64, 0] },
    focus: { offset: 0, path: [64, 0] },
  });
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(8);
  expect(DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:2')).toBe(
    null
  );
  expect(
    DOMCoverage.getBoundary(editor, 'partial-dom-aggressive:2:after')
  ).toMatchObject({
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [72], focus: [95] }],
    reason: 'partial-dom-aggressive',
    selectionPolicy: 'model',
    state: 'virtualized',
  });

  const tailPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="2:after"]'
  );

  expect(tailPlaceholder).toBeTruthy();

  await act(async () => {
    tailPlaceholder!.dispatchEvent(
      new window.MouseEvent('mousedown', {
        bubbles: true,
      })
    );
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [72, 0] },
    focus: { offset: 0, path: [72, 0] },
  });
  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(8);
});

test('Editable domStrategy partial-DOM focus does not activate or change model selection', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-focus-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  );

  expect(targetPartialDOMPlaceholder).toBeTruthy();

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.FocusEvent('focusin', { bubbles: true })
    );
  });

  expect(
    rendered.container.querySelectorAll('[data-plite-node="text"]').length
  ).toBe(2);
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBeTruthy();
  expect(editorGetSnapshot(editor).selection).toBe(null);
});

test('Editable domStrategy partial-DOM interaction does not promote during composition', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-composition-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  );

  expect(targetPartialDOMPlaceholder).toBeTruthy();

  IS_COMPOSING.set(editor, true);

  try {
    await act(async () => {
      targetPartialDOMPlaceholder!.dispatchEvent(
        new window.MouseEvent('mousedown', {
          bubbles: true,
        })
      );
    });

    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
      )
    ).toBeTruthy();
    expect(editorGetSnapshot(editor).selection).toBe(null);
  } finally {
    IS_COMPOSING.set(editor, false);
  }
});

test('Editable domStrategy promotes a partial-DOM segment with keyboard activation', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-keyboard-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  ) as HTMLElement | null;

  expect(targetPartialDOMPlaceholder).toBeTruthy();
  expect(targetPartialDOMPlaceholder!.getAttribute('role')).toBe('button');
  expect(targetPartialDOMPlaceholder!.getAttribute('tabindex')).toBe('0');
  expect(targetPartialDOMPlaceholder!.getAttribute('aria-expanded')).toBe(
    'false'
  );
  expect(targetPartialDOMPlaceholder!.getAttribute('aria-label')).toContain(
    'Open document section 2'
  );

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Enter',
      })
    );
  });

  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBe(null);
  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [2, 0] },
    focus: { offset: 0, path: [2, 0] },
  });
});

test('Editable domStrategy promotes a partial-DOM segment with Space keyboard activation', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-keyboard-space-promotion"
    />
  );

  const targetPartialDOMPlaceholder = rendered.container.querySelector(
    '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
  ) as HTMLElement | null;

  expect(targetPartialDOMPlaceholder).toBeTruthy();
  expect(targetPartialDOMPlaceholder!.getAttribute('role')).toBe('button');
  expect(targetPartialDOMPlaceholder!.getAttribute('aria-expanded')).toBe(
    'false'
  );

  await act(async () => {
    targetPartialDOMPlaceholder!.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        bubbles: true,
        key: ' ',
      })
    );
  });

  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="1"]'
    )
  ).toBe(null);
  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: { offset: 0, path: [2, 0] },
    focus: { offset: 0, path: [2, 0] },
  });
});

test('Editable domStrategy maps Ctrl+A to a full-document model selection without expanding partial-DOM placeholders', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-select-all"
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-select-all'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  const snapshot = editorGetSnapshot(editor);

  expect(snapshot.selection).toEqual({
    anchor: editorPoint(editor, [], { edge: 'start' }),
    focus: editorPoint(editor, [], { edge: 'end' }),
  });
  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(
    'partial-dom-backed'
  );
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(2);
});

test('Editable domStrategy derives partial-dom-backed state for programmatic broad selections', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-programmatic-partial-dom-selection"
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-programmatic-partial-dom-selection'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();
  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(null);

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        anchor: editorPoint(editor, [], { edge: 'start' }),
        focus: editorPoint(editor, [], { edge: 'end' }),
      });
    });
  });

  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(
    'partial-dom-backed'
  );
});

test('Editable domStrategy keeps broad select-all from replanning the active segment', async () => {
  const editor = createReactEditor();
  const counter = createPliteReactRenderCounter();
  const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
  let rendered: ReturnType<typeof render> | null = null;

  editorReplace(editor, {
    children: Array.from({ length: 200 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

  try {
    rendered = render(
      <TestEditorSurface
        domStrategy={{
          overscan: 0,
          type: 'partial-dom',
          segmentSize: 2,
          threshold: 1,
        }}
        editor={editor}
        id="dom-strategy-broad-select-all"
      />
    );

    const root = rendered.container.querySelector(
      '#dom-strategy-broad-select-all'
    ) as HTMLElement | null;

    expect(root).toBeTruthy();
    counter.reset();

    await act(async () => {
      fireEditorSelectAll(root!);
    });

    const snapshot = editorGetSnapshot(editor);

    expect(snapshot.selection).toEqual({
      anchor: editorPoint(editor, [], { edge: 'start' }),
      focus: editorPoint(editor, [], { edge: 'end' }),
    });
    expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(
      'partial-dom-backed'
    );
    expect(
      counter.snapshot().events.filter((event) => event.kind === 'root-plan')
    ).toHaveLength(0);
  } finally {
    rendered?.unmount();
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }
});

test('Editable staged domStrategy keeps broad select-all model-backed', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1200 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy="staged"
      editor={editor}
      id="dom-strategy-staged-select-all"
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-staged-select-all'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    anchor: editorPoint(editor, [], { edge: 'start' }),
    focus: editorPoint(editor, [], { edge: 'end' }),
  });
  expect(root!.getAttribute('data-plite-dom-strategy-selection')).toBe(
    'partial-dom-backed'
  );
});

test('Editable domStrategy preserves multiline plain text over a full-document partial-dom-backed selection', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-paste-full-doc"
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-paste-full-doc'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  await act(async () => {
    fireEditorPaste(root!, {
      types: ['text/plain'],
      getData: (type = 'text/plain') =>
        type === 'text/plain' ? 'one\ntwo' : '',
    });
  });

  expect(rendered.container.textContent?.includes('one')).toBe(true);
  expect(rendered.container.textContent?.includes('two')).toBe(true);
  expect(
    rendered.container.querySelectorAll(
      '[data-plite-dom-strategy-placeholder="true"]'
    ).length
  ).toBe(0);
  expect(editorGetSnapshot(editor).children).toEqual([
    {
      type: 'paragraph',
      children: [{ text: 'one' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'two' }],
    },
  ]);
});

test('Editable domStrategy preserves Plite fragment data for partial-dom-backed paste', async () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        overscan: 0,
        type: 'partial-dom',
        segmentSize: 2,
        threshold: 1,
      }}
      editor={editor}
      id="dom-strategy-paste-fragment"
    />
  );

  const root = rendered.container.querySelector(
    '#dom-strategy-paste-fragment'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  const encodedFragment = window.btoa(
    encodeURIComponent(
      JSON.stringify([
        {
          type: 'paragraph',
          children: [{ text: 'fragment marker' }],
        },
      ])
    )
  );

  await act(async () => {
    fireEditorPaste(root!, {
      types: ['application/x-plite-fragment', 'text/plain'],
      getData: (type = 'text/plain') =>
        type === 'application/x-plite-fragment'
          ? encodedFragment
          : type === 'text/plain'
            ? 'plain fallback'
            : '',
    });
  });

  expect(editorString(editor, [])).toBe('fragment marker');
});

test('Editable forwards scrollSelectionIntoView to app-owned code', async () => {
  const editor = createReactEditor();
  const seen: string[] = [];

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ] as Descendant[],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      id="scroll-forwarding"
      scrollSelectionIntoView={(_editor, domRange) => {
        seen.push(domRange.toString());
      }}
    />
  );

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 4 },
      });
    });
  });

  expect(seen).toEqual(['eta']);
  rendered.unmount();
});
