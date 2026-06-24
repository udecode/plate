import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor } from '@platejs/plite';
import {
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  replace as editorReplace,
} from '@platejs/plite/internal';

import {
  Plite,
  type PliteWidget,
  useEditorSelector,
  usePliteAnnotationStore,
  usePliteWidget,
  usePliteWidgetStore,
  usePliteWidgets,
} from '../src';
import { createPliteWidgetStore } from '../src/widget-store';

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

const createRenderCounts = () => ({
  left: 0,
  right: 0,
  selection: 0,
});

const TextSlice = ({
  counts,
  slot,
}: {
  counts: ReturnType<typeof createRenderCounts>;
  slot: 'left' | 'right';
}) => {
  const value = useEditorSelector((snapshot) =>
    snapshot?.children?.[slot === 'left' ? 0 : 1] &&
    'children' in snapshot.children[slot === 'left' ? 0 : 1]
      ? String(
          (
            snapshot.children[slot === 'left' ? 0 : 1] as {
              children: { text: string }[];
            }
          ).children[0]?.text ?? ''
        )
      : ''
  );

  counts[slot] += 1;

  return <span id={`${slot}-text`}>{value}</span>;
};

const MemoTextSlice = React.memo(TextSlice);

const WidgetHarness = ({
  counts,
  editor,
  widgets,
}: {
  counts: ReturnType<typeof createRenderCounts>;
  editor: ReturnType<typeof createEditor>;
  widgets: readonly PliteWidget<{
    label: string;
  }>[];
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
  counts: ReturnType<typeof createRenderCounts>;
  editor: ReturnType<typeof createEditor>;
  labels: readonly string[];
}) => {
  const widgetStore = usePliteWidgetStore(editor, {
    deps: [labels],
    project: () =>
      labels.map((label) => ({
        anchor: {
          type: 'selection' as const,
        },
        data: {
          label,
        },
        id: 'toolbar-widget',
      })),
  });
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
  const widgetStore = usePliteWidgetStore(editor, {
    deps: [labels],
    project: () =>
      labels.map((label) => ({
        anchor: {
          type: 'selection' as const,
        },
        data: {
          label,
        },
        id: 'toolbar-widget',
      })),
  });
  const widgetSnapshot = usePliteWidgets(widgetStore);

  return (
    <Plite editor={editor}>
      <span id="widget-snapshot">
        {widgetSnapshot.allIds.length === 0
          ? 'none'
          : widgetSnapshot.allIds
              .map((id) => {
                const widget = widgetSnapshot.byId.get(id)!;

                return `${widget.id}:${
                  widget.visible ? 'visible' : 'hidden'
                }:${widget.data?.label ?? 'none'}`;
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
  const annotationStore = usePliteAnnotationStore(editor, {
    deps: [labels],
    project: () =>
      labels.map((label) => ({
        anchor: {
          resolve: () => ({
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 4 },
          }),
        },
        data: {
          label,
        },
        id: 'comment-1',
      })),
  });
  const widgetStore = usePliteWidgetStore(editor, {
    annotationStore,
    deps: [labels],
    project: () =>
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
  });
  const widgetSnapshot = usePliteWidgets(widgetStore);

  return (
    <Plite annotationStore={annotationStore} editor={editor}>
      <span id="annotation-widget-snapshot">
        {widgetSnapshot.allIds.length === 0
          ? 'none'
          : widgetSnapshot.allIds
              .map((id) => {
                const widget = widgetSnapshot.byId.get(id)!;

                return `${widget.id}:${
                  widget.visible ? 'visible' : 'hidden'
                }:${widget.data?.label ?? 'none'}`;
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

  test('widget hook projector options refresh from empty to populated', async () => {
    const editor = createEditor();
    const counts = createRenderCounts();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
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

  test('node widgets stay attached by runtime id through structural moves', async () => {
    const editor = createEditor();
    let notifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [1]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for node widget move proof');
    }

    const widgets = [
      {
        anchor: {
          runtimeId,
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

    expect(editorGetPathByRuntimeId(editor, runtimeId)).toEqual([0]);
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
