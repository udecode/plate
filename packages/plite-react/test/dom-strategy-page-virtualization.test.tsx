import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Editor } from '@platejs/plite/internal';

import {
  createReactEditor,
  Editable,
  type EditableDOMStrategyMetrics,
  Plite,
} from '../src';
import { createPageItemIndexesForPath } from '../src/dom-strategy/use-virtualized-root-plan';

type TestEditorSurfaceProps = React.ComponentProps<typeof Editable> & {
  editor: React.ComponentProps<typeof Plite>['editor'];
};

const TestEditorSurface = ({ editor, ...props }: TestEditorSurfaceProps) => (
  <Plite editor={editor}>
    <Editable {...props} />
  </Plite>
);

const createPageVirtualizedLayout = (
  count: number,
  options: { visiblePageIndexes?: readonly number[] } = {}
) => {
  const pageItems = Array.from(
    { length: Math.ceil(count / 2) },
    (_, index) => ({
      index,
      key: `page-${index}`,
      pageIndexes: [index],
      size: 100,
      start: index * 100,
      topLevelIndexes: [index * 2, index * 2 + 1].filter(
        (topLevelIndex) => topLevelIndex < count
      ),
    })
  );

  return {
    getVirtualizedPageItems: () => pageItems,
    getVisibleVirtualizedPageItems: options.visiblePageIndexes
      ? () =>
          pageItems.filter((item) =>
            options.visiblePageIndexes!.includes(item.index)
          )
      : undefined,
    getVirtualizedTopLevelItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        size: 20,
        start: index * 20,
      })),
  };
};

const createSplitTableVirtualizedLayout = () => ({
  getVirtualizedPageItems: () =>
    [0, 1, 2].map((index) => ({
      index,
      key: `table-page-${index}`,
      pageIndexes: [index],
      size: 100,
      start: index * 100,
      topLevelIndexes: index === 0 ? [0, 1] : [1],
      unitPaths: [[1, index]],
    })),
  getVirtualizedTopLevelItems: () => [
    {
      index: 0,
      size: 20,
      start: 0,
    },
    {
      index: 1,
      size: 300,
      start: 20,
    },
  ],
});

test('Editable virtualized strategy owns deferred native text repair', () => {
  const editableSource = readFileSync(
    resolve(process.cwd(), 'src/components/editable-text-blocks.tsx'),
    'utf8'
  );

  expect(editableSource).toMatch(
    /deferNativeTextInputRepair=\{\s*domStrategyType === 'virtualized'\s*\}/
  );
});

test('Editable domStrategy virtualized mode uses page layout items as the retained range unit', async () => {
  const editor = createReactEditor();

  Editor.replace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index + 1}` }],
    })),
    selection: {
      anchor: { offset: 0, path: [4, 0] },
      focus: { offset: 0, path: [4, 0] },
    },
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 20,
        overscan: 0,
        threshold: 1,
        type: 'virtualized',
      }}
      domStrategyLayout={createPageVirtualizedLayout(6)}
      editor={editor}
      id="dom-strategy-page-virtualized"
      style={{ height: 100, overflowY: 'auto' }}
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

  expect(virtualizer?.style.height).toBe('300px');
  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtual-row="true"][data-index="4"]'
      )
    ).toBeTruthy()
  );
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="2"]'
    )
  ).toBe(null);
});

test('Editable domStrategy virtualized mode retains expanded selection endpoints outside the visible page window', async () => {
  const editor = createReactEditor();

  Editor.replace(editor, {
    children: Array.from({ length: 8 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `endpoint-block-${index + 1}` }],
    })),
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [6, 0] },
    },
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 20,
        overscan: 0,
        threshold: 1,
        type: 'virtualized',
      }}
      domStrategyLayout={createPageVirtualizedLayout(8, {
        visiblePageIndexes: [1],
      })}
      editor={editor}
      id="dom-strategy-expanded-selection-retention"
      style={{ height: 100, overflowY: 'auto' }}
    />
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );
  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtual-row="true"][data-index="0"]'
      )
    ).toBeTruthy()
  );
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="1"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="2"]'
    )
  ).toBeTruthy();
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="3"]'
    )
  ).toBeTruthy();
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="6"]'
    )
  ).toBeTruthy();
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="7"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="4"]'
    )
  ).toBe(null);
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="5"]'
    )
  ).toBe(null);
});

test('Editable domStrategy virtualized mode maps a selected split-table row path to its page item', () => {
  const pageItems =
    createSplitTableVirtualizedLayout().getVirtualizedPageItems();

  expect(createPageItemIndexesForPath(pageItems, [1])).toEqual([0, 1, 2]);
  expect(createPageItemIndexesForPath(pageItems, [1, 2, 0, 0])).toEqual([2]);
});

test('Editable domStrategy virtualized mode can share a layout-owned visible page window', async () => {
  const editor = createReactEditor();

  Editor.replace(editor, {
    children: Array.from({ length: 6 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `shared-window-block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      domStrategy={{
        estimatedBlockSize: 20,
        overscan: 0,
        threshold: 1,
        type: 'virtualized',
      }}
      domStrategyLayout={createPageVirtualizedLayout(6, {
        visiblePageIndexes: [2],
      })}
      editor={editor}
      id="dom-strategy-shared-page-window"
      style={{ height: 100, overflowY: 'auto' }}
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
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="4"]'
    )
  ).toBeTruthy();
  expect(
    rendered.container.querySelector(
      '[data-plite-dom-strategy-virtual-row="true"][data-index="0"]'
    )
  ).toBe(null);
});

test('Editable domStrategy virtualized mode can use an outer scroll container', async () => {
  const editor = createReactEditor();

  Editor.replace(editor, {
    children: Array.from({ length: 4 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `outer-scroll-block-${index + 1}` }],
    })),
    selection: null,
  });

  const rendered = render(
    <div style={{ height: 100, overflowY: 'auto' }}>
      <TestEditorSurface
        domStrategy={{
          estimatedBlockSize: 20,
          overscan: 0,
          threshold: 1,
          type: 'virtualized',
        }}
        domStrategyLayout={createPageVirtualizedLayout(4)}
        editor={editor}
        id="dom-strategy-outer-scroll-virtualized"
      />
    </div>
  );

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );
});

test('Editable domStrategy metrics do not re-emit unchanged virtualized metrics after consumer state updates', async () => {
  const editor = createReactEditor();
  const metrics: EditableDOMStrategyMetrics[] = [];

  Editor.replace(editor, {
    children: Array.from({ length: 4 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `metrics-block-${index + 1}` }],
    })),
    selection: null,
  });

  const MetricsConsumer = () => {
    const [latestMetrics, setLatestMetrics] =
      React.useState<EditableDOMStrategyMetrics | null>(null);

    return (
      <>
        <TestEditorSurface
          domStrategy={{
            estimatedBlockSize: 20,
            overscan: 0,
            threshold: 1,
            type: 'virtualized',
          }}
          domStrategyLayout={createPageVirtualizedLayout(4)}
          editor={editor}
          id="dom-strategy-metrics-loop"
          onDOMStrategyMetrics={(nextMetrics) => {
            metrics.push(nextMetrics);
            setLatestMetrics(nextMetrics);
          }}
          style={{ height: 100, overflowY: 'auto' }}
        />
        <output>{latestMetrics?.effectiveStrategy}</output>
      </>
    );
  };

  const rendered = render(<MetricsConsumer />);

  await waitFor(() =>
    expect(
      rendered.container.querySelector(
        '[data-plite-dom-strategy-virtualizer="true"]'
      )
    ).toBeTruthy()
  );
  await waitFor(() =>
    expect(rendered.container.querySelector('output')?.textContent).toBe(
      'virtualized'
    )
  );
  await new Promise((resolve) => setTimeout(resolve, 25));

  expect(metrics).toHaveLength(1);
});
