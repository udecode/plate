import { runInNewContext } from 'node:vm';

import { act, render, waitFor } from '@testing-library/react';
import { createEditor } from 'plitejs';
import React, { startTransition, Suspense, useLayoutEffect } from 'react';
import { renderToString } from 'react-dom/server';

import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  replace as editorReplace,
} from '../../src/internal';
import {
  Editable,
  Plite,
  type PliteWidget,
  type PliteWidgetStore,
  usePliteAnnotationStore,
  usePliteWidget,
  usePliteWidgetGeometry,
  usePliteWidgetIds,
  usePliteWidgetStore,
  usePliteWidgets,
  useSelectionGeometry,
} from '../../src/react';
import { createPliteAnnotationStore } from '../../src/react/annotation-store';
import { createPliteWidgetStore } from '../../src/react/widget-store';
import {
  createRenderCounts,
  type RenderCounts,
  TextSlice,
} from './render-probes/widget-render-probe';

const createChildren = () => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const MemoTextSlice = React.memo(TextSlice);

const WidgetHarness = ({
  counts,
  editor,
  widgets,
}: {
  counts: RenderCounts;
  editor: ReturnType<typeof createEditor>;
  widgets: ReadonlyArray<
    PliteWidget<{
      label: string;
    }>
  >;
}) => {
  const widgetStore = usePliteWidgetStore(editor, widgets);
  const toolbarWidget = usePliteWidget(widgetStore, 'toolbar-widget');

  return (
    <Plite editor={editor}>
      <MemoTextSlice counts={counts} slot="left" />
      <MemoTextSlice counts={counts} slot="right" />
      <span id="widget-state">
        {toolbarWidget
          ? `${toolbarWidget.id}:${
              toolbarWidget.available ? 'visible' : 'hidden'
            }:${toolbarWidget.data?.label ?? 'none'}`
          : 'none'}
      </span>
    </Plite>
  );
};

const ProjectedWidgetHarness = ({
  counts,
  editor,
  labels,
}: {
  counts: RenderCounts;
  editor: ReturnType<typeof createEditor>;
  labels: readonly string[];
}) => {
  const widgetStore = usePliteWidgetStore(
    editor,
    labels.map((label) => ({
      target: {
        type: 'selection' as const,
      },
      data: {
        label,
      },
      id: 'toolbar-widget',
    }))
  );
  const toolbarWidget = usePliteWidget(widgetStore, 'toolbar-widget');

  return (
    <Plite editor={editor}>
      <MemoTextSlice counts={counts} slot="left" />
      <MemoTextSlice counts={counts} slot="right" />
      <span id="widget-state">
        {toolbarWidget
          ? `${toolbarWidget.id}:${
              toolbarWidget.available ? 'visible' : 'hidden'
            }:${toolbarWidget.data?.label ?? 'none'}`
          : 'none'}
      </span>
    </Plite>
  );
};

const ProjectedWidgetSnapshotHarness = ({
  editor,
  labels,
}: {
  editor: ReturnType<typeof createEditor>;
  labels: readonly string[];
}) => {
  const widgetStore = usePliteWidgetStore(
    editor,
    labels.map((label) => ({
      target: {
        type: 'selection' as const,
      },
      data: {
        label,
      },
      id: 'toolbar-widget',
    }))
  );
  const widgetSnapshot = usePliteWidgets(widgetStore);

  return (
    <Plite editor={editor}>
      <span id="widget-snapshot">
        {widgetSnapshot.allIds.length === 0
          ? 'none'
          : widgetSnapshot.allIds
              .map((id) => {
                const widget = widgetSnapshot.byId.get(id)!;

                return `${widget.id}:${widget.available ? 'visible' : 'hidden'}:${
                  widget.data?.label ?? 'none'
                }`;
              })
              .join('|')}
      </span>
    </Plite>
  );
};

const ProjectedAnnotationWidgetHarness = ({
  editor,
  labels,
}: {
  editor: ReturnType<typeof createEditor>;
  labels: readonly string[];
}) => {
  const annotationStore = usePliteAnnotationStore(
    editor,
    labels.map((label) => ({
      anchor: {
        resolve: () => ({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        }),
      },
      data: {
        label,
      },
      id: 'comment-1',
    }))
  );
  const widgetStore = usePliteWidgetStore(
    editor,
    labels.map((label) => ({
      target: {
        annotationId: 'comment-1',
        type: 'annotation' as const,
      },
      data: {
        label,
      },
      id: 'comment-widget',
    })),
    { annotationStore }
  );
  const widgetSnapshot = usePliteWidgets(widgetStore);

  return (
    <Plite annotationStore={annotationStore} editor={editor}>
      <span id="annotation-widget-snapshot">
        {widgetSnapshot.allIds.length === 0
          ? 'none'
          : widgetSnapshot.allIds
              .map((id) => {
                const widget = widgetSnapshot.byId.get(id)!;

                return `${widget.id}:${widget.available ? 'visible' : 'hidden'}:${
                  widget.data?.label ?? 'none'
                }`;
              })
              .join('|')}
      </span>
    </Plite>
  );
};

const WidgetIdsProbe = React.memo(
  ({
    onRender,
    store,
  }: {
    onRender: () => void;
    store: ReturnType<typeof usePliteWidgetStore>;
  }) => {
    onRender();
    const ids = usePliteWidgetIds(store);

    return <span id="widget-ids">{ids.join('|')}</span>;
  }
);

const WidgetIdsHarness = ({
  editor,
  ids,
  label,
  onRender,
}: {
  editor: ReturnType<typeof createEditor>;
  ids: readonly string[];
  label: string;
  onRender: () => void;
}) => {
  const store = usePliteWidgetStore(
    editor,
    ids.map((id) => ({
      data: { label },
      id,
      target: { type: 'selection' as const },
    }))
  );

  return (
    <Plite editor={editor}>
      <WidgetIdsProbe onRender={onRender} store={store} />
    </Plite>
  );
};

const SelectionGeometryProbe = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const geometry = useSelectionGeometry({ editableRef });

  return (
    <span id="selection-geometry">
      {geometry
        ? `${geometry.boundingRect.left},${geometry.boundingRect.top},${geometry.rects.length}`
        : 'none'}
    </span>
  );
};

const SelectionGeometryHarness = ({
  editor,
}: {
  editor: ReturnType<typeof createEditor>;
}) => {
  const editableRef = React.useRef<HTMLDivElement>(null);

  return (
    <Plite editor={editor}>
      <Editable ref={editableRef} />
      <SelectionGeometryProbe editableRef={editableRef} />
    </Plite>
  );
};

const CrossEditorSelectionGeometryHarness = ({
  editor,
  foreignEditor,
}: {
  editor: ReturnType<typeof createEditor>;
  foreignEditor: ReturnType<typeof createEditor>;
}) => {
  const foreignEditableRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <Plite editor={foreignEditor}>
        <Editable ref={foreignEditableRef} />
      </Plite>
      <Plite editor={editor}>
        <SelectionGeometryProbe editableRef={foreignEditableRef} />
      </Plite>
    </>
  );
};

const WidgetGeometryProbe = ({
  editableRef,
  store,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  store: PliteWidgetStore<{ label: string }>;
}) => {
  const geometry = usePliteWidgetGeometry(store, 'node-widget', {
    editableRef,
  });

  return (
    <span id="node-widget-geometry">
      {geometry
        ? `${geometry.boundingRect.left},${geometry.boundingRect.top},${geometry.rects.length}`
        : 'none'}
    </span>
  );
};

const NodeWidgetGeometryHarness = ({
  editor,
  nodeKey,
}: {
  editor: ReturnType<typeof createEditor>;
  nodeKey: NonNullable<ReturnType<typeof editorGetNodeKey>>;
}) => {
  const editableRef = React.useRef<HTMLDivElement>(null);
  const store = usePliteWidgetStore(editor, [
    {
      data: { label: 'Node' },
      id: 'node-widget',
      target: { nodeKey, type: 'node' },
    },
  ]);

  return (
    <Plite editor={editor}>
      <Editable ref={editableRef} />
      <WidgetGeometryProbe editableRef={editableRef} store={store} />
    </Plite>
  );
};

describe('plite-react widget layer contract', () => {
  test('node widget commits visit only targets whose availability changes', () => {
    const count = 1000;
    const editor = createEditor({
      initialValue: Array.from({ length: count }, () => ({
        type: 'paragraph',
        children: [{ text: 'text' }],
      })),
    });
    let targetReads = 0;
    const widgets = Array.from({ length: count }, (_, index) => {
      const nodeKey = editorGetNodeKey(editor, [index]);

      if (!nodeKey) throw new Error('Expected a node key');

      return {
        id: `widget-${index}`,
        get target() {
          targetReads += 1;
          return { nodeKey, type: 'node' as const };
        },
      };
    });
    const store = createPliteWidgetStore(editor, () => widgets);
    let before = store.getMetrics();
    const snapshot = store.getSnapshot();

    targetReads = 0;
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    expect(
      store.getMetrics().widgetResolveCount - before.widgetResolveCount
    ).toBe(0);
    expect(targetReads).toBe(0);
    expect(store.getSnapshot()).toBe(snapshot);

    before = store.getMetrics();
    editor.update.nodes.remove({ at: [0] });
    expect(
      store.getMetrics().widgetResolveCount - before.widgetResolveCount
    ).toBe(1);
    expect(targetReads).toBeLessThanOrEqual(12);
    expect(store.getWidget('widget-0')?.available).toBe(false);
    expect(store.getWidget('widget-999')?.available).toBe(true);
    expect(snapshot.byId.get('widget-0')?.available).toBe(true);

    before = store.getMetrics();
    editor.update.nodes.remove({ at: [998] });
    expect(
      store.getMetrics().widgetResolveCount - before.widgetResolveCount
    ).toBe(1);
    expect(store.getWidget('widget-999')?.available).toBe(false);
    store.destroy();
  });

  test('one annotation publication resolves only its widget targets in one batch', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    const annotations = Array.from({ length: 1000 }, (_, index) => ({
      anchor: { release: () => null, resolve: () => range },
      data: { revision: 0 },
      id: `annotation-${index}`,
    }));
    const annotationStore = createPliteAnnotationStore(
      editor,
      () => annotations
    );
    const widgets = annotations.map((annotation, index) => ({
      id: `widget-${index}`,
      target: { annotationId: annotation.id, type: 'annotation' as const },
    }));
    const store = createPliteWidgetStore(
      editor,
      () => widgets,
      annotationStore
    );
    let wakes = 0;
    store.subscribe(() => {
      wakes += 1;
    });
    const before = store.getMetrics();

    annotations[0] = { ...annotations[0], data: { revision: 1 } };
    annotations[999] = { ...annotations[999], data: { revision: 1 } };
    annotationStore.refresh({ ids: ['annotation-0', 'annotation-999'] });

    expect(
      store.getMetrics().widgetResolveCount - before.widgetResolveCount
    ).toBe(2);
    expect(wakes).toBe(1);
    expect(store.getWidget('widget-0')?.annotation?.data?.revision).toBe(1);
    expect(store.getWidget('widget-1')?.annotation?.data?.revision).toBe(0);
    expect(store.getWidget('widget-999')?.annotation?.data?.revision).toBe(1);

    store.destroy();
    annotationStore.destroy();
  });

  test('widget stores expose the canonical editor they resolve', () => {
    const editor = createEditor();
    const store = createPliteWidgetStore(editor, () => []);

    expect(store.editor).toBe(editor);

    store.destroy();
  });

  test('widget id subscribers wake only for membership or order changes', async () => {
    const editor = createEditor();
    const onRender = vi.fn();
    const mounted = render(
      <WidgetIdsHarness
        editor={editor}
        ids={['a']}
        label="first"
        onRender={onRender}
      />
    );

    expect(mounted.container.querySelector('#widget-ids')?.textContent).toBe(
      'a'
    );
    const initialRenderCount = onRender.mock.calls.length;

    await act(async () => {
      mounted.rerender(
        <WidgetIdsHarness
          editor={editor}
          ids={['a']}
          label="updated"
          onRender={onRender}
        />
      );
    });

    expect(onRender).toHaveBeenCalledTimes(initialRenderCount);

    await act(async () => {
      mounted.rerender(
        <WidgetIdsHarness
          editor={editor}
          ids={['a', 'b']}
          label="updated"
          onRender={onRender}
        />
      );
    });

    expect(mounted.container.querySelector('#widget-ids')?.textContent).toBe(
      'a|b'
    );
    expect(onRender).toHaveBeenCalledTimes(initialRenderCount + 1);
  });

  test('selection geometry reads the current selection in the exact Editable', async () => {
    const editor = createEditor();
    const rangePrototype = window.Range.prototype;
    const previousBoundingRect = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getBoundingClientRect'
    );
    const previousClientRects = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getClientRects'
    );
    const rect = (
      left: number,
      top: number,
      width: number,
      height: number
    ) => ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    });

    Object.defineProperties(rangePrototype, {
      getBoundingClientRect: {
        configurable: true,
        value: () => rect(30, 40, 1, 18),
      },
      getClientRects: {
        configurable: true,
        value(this: Range) {
          return this.collapsed
            ? []
            : [rect(10, 20, 40, 18), rect(10, 40, 20, 18)];
        },
      },
    });

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#selection-geometry')?.textContent
        ).toBe('10,20,2');
      });

      await act(async () => {
        editor.update((tx) => {
          tx.selection.collapse({ edge: 'end' });
        });
      });

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#selection-geometry')?.textContent
        ).toBe('30,40,0');
      });
    } finally {
      if (previousBoundingRect) {
        Object.defineProperty(
          rangePrototype,
          'getBoundingClientRect',
          previousBoundingRect
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getBoundingClientRect');
      }
      if (previousClientRects) {
        Object.defineProperty(
          rangePrototype,
          'getClientRects',
          previousClientRects
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getClientRects');
      }
    }
  });

  test('selection geometry anchors a collapsed empty paragraph to its line break', async () => {
    const editor = createEditor();
    const rangePrototype = window.Range.prototype;
    const elementPrototype = window.HTMLElement.prototype;
    const previousRangeBoundingRect = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getBoundingClientRect'
    );
    const previousClientRects = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getClientRects'
    );
    const previousElementBoundingRect = Object.getOwnPropertyDescriptor(
      elementPrototype,
      'getBoundingClientRect'
    );
    const rect = (
      left: number,
      top: number,
      width: number,
      height: number
    ) => ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    });

    Object.defineProperties(rangePrototype, {
      getBoundingClientRect: {
        configurable: true,
        value: () => rect(0, 0, 0, 0),
      },
      getClientRects: {
        configurable: true,
        value: () => [],
      },
    });
    Object.defineProperty(elementPrototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: HTMLElement) {
        return this.hasAttribute('data-plite-zero-width')
          ? rect(30, 40, 0, 18)
          : rect(0, 0, 0, 0);
      },
    });

    editorReplace(editor, {
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#selection-geometry')?.textContent
        ).toBe('30,40,0');
      });
    } finally {
      if (previousRangeBoundingRect) {
        Object.defineProperty(
          rangePrototype,
          'getBoundingClientRect',
          previousRangeBoundingRect
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getBoundingClientRect');
      }
      if (previousClientRects) {
        Object.defineProperty(
          rangePrototype,
          'getClientRects',
          previousClientRects
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getClientRects');
      }
      if (previousElementBoundingRect) {
        Object.defineProperty(
          elementPrototype,
          'getBoundingClientRect',
          previousElementBoundingRect
        );
      } else {
        Reflect.deleteProperty(elementPrototype, 'getBoundingClientRect');
      }
    }
  });

  test('selection geometry updates after viewport scroll', async () => {
    const editor = createEditor();
    const rangePrototype = window.Range.prototype;
    const previousBoundingRect = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getBoundingClientRect'
    );
    const previousClientRects = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getClientRects'
    );
    let left = 10;
    const rect = (top: number, width: number, height: number) => ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    });

    Object.defineProperties(rangePrototype, {
      getBoundingClientRect: {
        configurable: true,
        value: () => rect(40, 1, 18),
      },
      getClientRects: {
        configurable: true,
        value(this: Range) {
          return this.collapsed ? [] : [rect(20, 40, 18)];
        },
      },
    });

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#selection-geometry')?.textContent
        ).toBe('10,20,1');
      });

      left = 25;
      act(() => {
        document.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#selection-geometry')?.textContent
        ).toBe('25,20,1');
      });
    } finally {
      if (previousBoundingRect) {
        Object.defineProperty(
          rangePrototype,
          'getBoundingClientRect',
          previousBoundingRect
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getBoundingClientRect');
      }
      if (previousClientRects) {
        Object.defineProperty(
          rangePrototype,
          'getClientRects',
          previousClientRects
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getClientRects');
      }
    }
  });

  test('selection geometry rejects an Editable owned by another editor', () => {
    const editor = createEditor();
    const foreignEditor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
    editorReplace(foreignEditor, {
      children: createChildren(),
      selection: null,
    });

    const mounted = render(
      <CrossEditorSelectionGeometryHarness
        editor={editor}
        foreignEditor={foreignEditor}
      />
    );

    expect(
      mounted.container.querySelector('#selection-geometry')?.textContent
    ).toBe('none');
  });

  test('selection geometry has a null server snapshot', () => {
    const editor = createEditor();
    const editableRef = React.createRef<HTMLDivElement>();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const html = renderToString(
      <Plite editor={editor}>
        <SelectionGeometryProbe editableRef={editableRef} />
      </Plite>
    );

    expect(html).toContain('>none</span>');
  });

  test('generic Widget geometry measures a node target', async () => {
    const editor = createEditor();
    const elementPrototype = window.HTMLElement.prototype;
    const previousBoundingRect = Object.getOwnPropertyDescriptor(
      elementPrototype,
      'getBoundingClientRect'
    );

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });
    const nodeKey = editorGetNodeKey(editor, [1]);

    if (!nodeKey) throw new Error('Expected a node key');

    Object.defineProperty(elementPrototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: 32,
        height: 20,
        left: 12,
        right: 52,
        top: 12,
        width: 40,
        x: 12,
        y: 12,
      }),
    });

    try {
      const mounted = render(
        <NodeWidgetGeometryHarness editor={editor} nodeKey={nodeKey} />
      );

      await waitFor(() => {
        expect(
          mounted.container.querySelector('#node-widget-geometry')?.textContent
        ).toBe('12,12,1');
      });
    } finally {
      if (previousBoundingRect) {
        Object.defineProperty(
          elementPrototype,
          'getBoundingClientRect',
          previousBoundingRect
        );
      } else {
        Reflect.deleteProperty(elementPrototype, 'getBoundingClientRect');
      }
    }
  });

  test('selection widgets remain available when collapsed without rerendering text slices', async () => {
    const editor = createEditor();
    const counts = createRenderCounts();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const widgets = [
      {
        target: {
          type: 'selection' as const,
        },
        data: {
          label: 'Toolbar',
        },
        id: 'toolbar-widget',
      },
    ] as const;

    const mounted = render(
      <WidgetHarness counts={counts} editor={editor} widgets={widgets} />
    );

    expect(counts).toEqual({
      left: 1,
      right: 1,
      selection: 0,
    });
    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:hidden:Toolbar'
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        });
      });
    });

    expect(counts).toEqual({
      left: 1,
      right: 1,
      selection: 0,
    });
    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:visible:Toolbar'
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.collapse({ edge: 'end' });
      });
    });

    expect(counts).toEqual({
      left: 1,
      right: 1,
      selection: 0,
    });
    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:visible:Toolbar'
    );

    mounted.unmount();
  });

  test('widget hook projector options refresh without caller memoization', async () => {
    const editor = createEditor();
    const counts = createRenderCounts();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const mounted = render(
      <ProjectedWidgetHarness
        counts={counts}
        editor={editor}
        labels={['Toolbar']}
      />
    );

    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:visible:Toolbar'
    );

    await act(async () => {
      mounted.rerender(
        <ProjectedWidgetHarness
          counts={counts}
          editor={editor}
          labels={['Updated']}
        />
      );
    });

    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:visible:Updated'
    );
  });

  test('an abandoned widget-store render cannot publish data or error options', () => {
    const editor = createEditor();
    const suspended = new Promise<never>(() => {});
    const committedOnError = vi.fn();
    const abandonedOnError = vi.fn();
    let shouldThrow = false;
    let abandonedDataReadCount = 0;
    let abandonedRenderCount = 0;
    let committedStore: ReturnType<typeof usePliteWidgetStore> | null = null;
    const abandonedStores = new Set<ReturnType<typeof usePliteWidgetStore>>();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const widgets = (
      label: string
    ): ReadonlyArray<PliteWidget<{ label: string }>> => [
      {
        target: { type: 'selection' },
        get data() {
          if (label === 'abandoned') abandonedDataReadCount += 1;
          if (shouldThrow) throw new Error('widget source failed');

          return { label };
        },
        id: 'toolbar-widget',
      },
    ];
    const HookProbe = ({ abandoned }: { abandoned: boolean }) => {
      const store = usePliteWidgetStore(
        editor,
        widgets(abandoned ? 'abandoned' : 'committed'),
        {
          id: abandoned ? 'abandoned' : 'committed',
          onError: abandoned ? abandonedOnError : committedOnError,
        }
      );

      useLayoutEffect(() => {
        committedStore = store;
      }, [store]);

      if (abandoned) {
        abandonedRenderCount += 1;
        abandonedStores.add(store);
        throw suspended;
      }

      return null;
    };
    const tree = (abandoned: boolean) => (
      <Suspense fallback={null}>
        <HookProbe abandoned={abandoned} />
      </Suspense>
    );
    const mounted = render(tree(false));

    act(() => {
      startTransition(() => {
        mounted.rerender(tree(true));
      });
    });

    expect(abandonedRenderCount).toBeGreaterThan(0);
    expect(abandonedDataReadCount).toBe(0);
    expect(
      [...abandonedStores].every((store) => store !== committedStore)
    ).toBe(true);

    act(() => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        });
      });
    });
    expect(abandonedDataReadCount).toBe(0);

    act(() => {
      committedStore?.refresh();
    });
    expect(committedStore?.getWidget('toolbar-widget')?.data?.label).toBe(
      'committed'
    );

    shouldThrow = true;
    act(() => {
      committedStore?.refresh();
    });
    expect(committedOnError).toHaveBeenCalledOnce();
    expect(abandonedOnError).not.toHaveBeenCalled();

    mounted.unmount();
    abandonedStores.forEach((store) => {
      store.destroy();
    });
  });

  test('widget-store inputs publish before child layout refreshes', () => {
    const editor = createEditor();
    const firstOnError = vi.fn();
    const secondOnError = vi.fn();
    let shouldThrow = false;
    let observedLabel: string | undefined;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const widgets = (
      label: string
    ): ReadonlyArray<PliteWidget<{ label: string }>> => [
      {
        target: { type: 'selection' },
        get data() {
          if (shouldThrow) throw new Error('widget source failed');

          return { label };
        },
        id: 'toolbar-widget',
      },
    ];
    const RefreshFromChildLayout = ({
      enabled,
      store,
    }: {
      enabled: boolean;
      store: ReturnType<typeof usePliteWidgetStore>;
    }) => {
      useLayoutEffect(() => {
        if (!enabled) return;

        store.refresh();
        observedLabel = store.getWidget('toolbar-widget')?.data?.label;
        shouldThrow = true;
        store.refresh();
      }, [enabled, store]);

      return null;
    };
    const HookProbe = ({
      label,
      onError,
      refresh,
    }: {
      label: string;
      onError: (error: unknown) => void;
      refresh: boolean;
    }) => {
      const store = usePliteWidgetStore(editor, widgets(label), {
        id: 'committed',
        onError,
      });

      return <RefreshFromChildLayout enabled={refresh} store={store} />;
    };
    const mounted = render(
      <HookProbe label="first" onError={firstOnError} refresh={false} />
    );

    mounted.rerender(
      <HookProbe label="second" onError={secondOnError} refresh />
    );

    expect(observedLabel).toBe('second');
    expect(firstOnError).not.toHaveBeenCalled();
    expect(secondOnError).toHaveBeenCalledOnce();

    mounted.unmount();
  });

  test('widget hook projector options refresh from empty to populated', async () => {
    const editor = createEditor();
    const counts = createRenderCounts();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const mounted = render(
      <ProjectedWidgetHarness counts={counts} editor={editor} labels={[]} />
    );

    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'none'
    );

    await act(async () => {
      mounted.rerender(
        <ProjectedWidgetHarness
          counts={counts}
          editor={editor}
          labels={['Toolbar']}
        />
      );
    });

    expect(mounted.container.querySelector('#widget-state')?.textContent).toBe(
      'toolbar-widget:visible:Toolbar'
    );
  });

  test('whole widget snapshots refresh from empty to populated', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const mounted = render(
      <ProjectedWidgetSnapshotHarness editor={editor} labels={[]} />
    );

    expect(
      mounted.container.querySelector('#widget-snapshot')?.textContent
    ).toBe('none');

    await act(async () => {
      mounted.rerender(
        <ProjectedWidgetSnapshotHarness editor={editor} labels={['Toolbar']} />
      );
    });

    expect(
      mounted.container.querySelector('#widget-snapshot')?.textContent
    ).toBe('toolbar-widget:visible:Toolbar');
  });

  test('annotation-backed widget snapshots refresh from empty to populated', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const mounted = render(
      <ProjectedAnnotationWidgetHarness editor={editor} labels={[]} />
    );

    expect(
      mounted.container.querySelector('#annotation-widget-snapshot')
        ?.textContent
    ).toBe('none');

    await act(async () => {
      mounted.rerender(
        <ProjectedAnnotationWidgetHarness
          editor={editor}
          labels={['Comment']}
        />
      );
    });

    expect(
      mounted.container.querySelector('#annotation-widget-snapshot')
        ?.textContent
    ).toBe('comment-widget:visible:Comment');
  });

  test('selection widget stores ignore unrelated text changes', async () => {
    const editor = createEditor();
    let notifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const store = createPliteWidgetStore(editor, () => [
      {
        target: {
          type: 'selection' as const,
        },
        data: {
          label: 'Toolbar',
        },
        id: 'toolbar-widget',
      },
    ]);
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 5 },
        });
      });
    });

    expect(notifications).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 3 },
        });
      });
    });

    expect(notifications).toBe(1);
    expect(store.getSnapshot().byId.get('toolbar-widget')?.available).toBe(
      true
    );

    unsubscribe();
    store.destroy();
  });

  test('widget stores subscribe to commits without forcing snapshot subscribers', () => {
    const editor = createEditor();
    const originalSubscribe = editor.subscribe;
    const originalSubscribeCommit = editor.subscribeCommit;
    let commitSubscriptions = 0;
    let snapshotSubscriptions = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    Object.defineProperties(editor, {
      subscribe: {
        value: ((...args) => {
          snapshotSubscriptions += 1;
          return originalSubscribe(...args);
        }) satisfies typeof editor.subscribe,
      },
      subscribeCommit: {
        value: ((...args) => {
          commitSubscriptions += 1;
          return originalSubscribeCommit(...args);
        }) satisfies typeof editor.subscribeCommit,
      },
    });

    const store = createPliteWidgetStore(editor, () => [
      {
        target: {
          type: 'selection' as const,
        },
        id: 'toolbar-widget',
      },
    ]);

    expect(commitSubscriptions).toBe(1);
    expect(snapshotSubscriptions).toBe(0);

    store.destroy();
  });

  test('node widgets stay attached by node key through structural moves', async () => {
    const editor = createEditor();
    let notifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const nodeKey = editorGetNodeKey(editor, [1]);

    if (!nodeKey) {
      throw new Error('Expected node key for node widget move proof');
    }

    const widgets = [
      {
        target: {
          nodeKey,
          type: 'node' as const,
        },
        data: {
          label: 'Node menu',
        },
        id: 'node-widget',
      },
    ] as const;
    const store = createPliteWidgetStore(editor, () => widgets);

    store.subscribeWidget('node-widget', () => {
      notifications += 1;
    });

    expect(store.getWidget('node-widget')).toMatchObject({
      id: 'node-widget',
      available: true,
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [1], to: [0] });
      });
    });

    expect(editorGetPathByNodeKey(editor, nodeKey)).toEqual([0]);
    expect(store.getWidget('node-widget')).toMatchObject({
      id: 'node-widget',
      available: true,
    });
    expect(notifications).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
      });
    });

    expect(store.getWidget('node-widget')).toMatchObject({
      id: 'node-widget',
      available: false,
    });
    expect(notifications).toBe(1);

    store.destroy();
  });

  test('widget metadata ignores equivalent cross-realm JSON and wakes for a changed leaf', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    let metadata = runInNewContext(`({
      nested: {
        label: 'Toolbar',
        values: [1, 2],
      },
      active: true,
    })`) as {
      active: boolean;
      nested: {
        label: string;
        values: number[];
      };
    };
    const store = createPliteWidgetStore(editor, () => [
      {
        target: {
          type: 'selection' as const,
        },
        data: metadata,
        id: 'toolbar-widget',
      },
    ]);
    let notifications = 0;

    store.subscribeWidget('toolbar-widget', () => {
      notifications += 1;
    });

    metadata = {
      active: true,
      nested: {
        label: 'Toolbar',
        values: [1, 2],
      },
    };
    store.refresh();

    expect(notifications).toBe(0);

    metadata = {
      ...metadata,
      nested: {
        ...metadata.nested,
        label: 'Changed',
      },
    };
    store.refresh();

    expect(notifications).toBe(1);
    expect(store.getWidget('toolbar-widget')?.data?.nested.label).toBe(
      'Changed'
    );

    store.destroy();
  });

  test('widget metrics count changed ids and widget subscriber wakes', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const store = createPliteWidgetStore(editor, () => [
      {
        target: {
          type: 'selection' as const,
        },
        data: {
          label: 'Toolbar',
        },
        id: 'toolbar-widget',
      },
    ]);
    let widgetNotifications = 0;

    store.subscribeWidget('toolbar-widget', () => {
      widgetNotifications += 1;
    });
    const baseline = store.getMetrics();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 3 },
        });
      });
    });

    expect(widgetNotifications).toBe(1);
    expect(store.getMetrics()).toMatchObject({
      recomputeCount: 2,
      widgetResolveCount: 2,
      widgetSubscriberWakeCount: 1,
    });
    expect(
      store.getMetrics().changedWidgetCount - baseline.changedWidgetCount
    ).toBe(1);

    store.destroy();
  });
});
