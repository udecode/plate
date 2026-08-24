import { runInNewContext } from 'node:vm';

import { createEditor } from '@platejs/plite';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { act, render } from '@testing-library/react';
import React, { startTransition, Suspense, useLayoutEffect } from 'react';

import {
  Plite,
  type PliteWidget,
  usePliteAnnotationStore,
  usePliteWidget,
  usePliteWidgetStore,
  usePliteWidgets,
} from '../src';
import { createPliteWidgetStore } from '../src/widget-store';
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
              toolbarWidget.visible ? 'visible' : 'hidden'
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
      anchor: {
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
              toolbarWidget.visible ? 'visible' : 'hidden'
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
      anchor: {
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

                return `${widget.id}:${widget.visible ? 'visible' : 'hidden'}:${
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
      anchor: {
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

                return `${widget.id}:${widget.visible ? 'visible' : 'hidden'}:${
                  widget.data?.label ?? 'none'
                }`;
              })
              .join('|')}
      </span>
    </Plite>
  );
};

describe('plite-react widget layer contract', () => {
  test('selection widgets toggle without rerendering text slices', async () => {
    const editor = createEditor();
    const counts = createRenderCounts();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const widgets = [
      {
        anchor: {
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
      'toolbar-widget:hidden:Toolbar'
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
        anchor: { type: 'selection' },
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
        anchor: { type: 'selection' },
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
        anchor: {
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
    expect(store.getSnapshot().byId.get('toolbar-widget')?.visible).toBe(true);

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
        anchor: {
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
        anchor: {
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
      visible: true,
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [1], to: [0] });
      });
    });

    expect(editorGetPathByNodeKey(editor, nodeKey)).toEqual([0]);
    expect(store.getWidget('node-widget')).toMatchObject({
      id: 'node-widget',
      visible: true,
    });
    expect(notifications).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
      });
    });

    expect(store.getWidget('node-widget')).toMatchObject({
      id: 'node-widget',
      visible: false,
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
        anchor: {
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
        anchor: {
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
