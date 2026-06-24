import { act, render } from '@testing-library/react';
import { createEditor } from '@platejs/plite';
import {
  bookmark as editorBookmark,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '@platejs/plite/internal';
import {
  createReactEditor,
  Plite,
  type PliteAnnotation,
  useEditor,
  usePliteAnnotation,
  usePliteAnnotationStore,
  usePliteAnnotations,
  usePliteProjectionEntries,
} from '../src';
import { createPliteAnnotationStore } from '../src/annotation-store';

type CommentData = {
  body?: string;
  kind: string;
  label: string;
  tone?: string;
};

type CommentProjection = {
  kind: string;
  tone?: string;
};

type NonJsonProjection = {
  kind: string;
  payload?: Map<string, number>;
};

const formatProjection = (
  projections: readonly {
    key: string;
    start: number;
    end: number;
    data?: { annotationId?: string; kind?: string; tone?: string };
  }[]
) =>
  projections.length === 0
    ? 'none'
    : projections
        .map(
          (projection) =>
            `${projection.key}:${projection.start}-${projection.end}:${
              projection.data?.kind ?? 'unknown'
            }:${projection.data?.tone ?? 'none'}:${
              projection.data?.annotationId ?? 'none'
            }`
        )
        .join('|');

const formatRange = (
  range: {
    anchor: { path: number[]; offset: number };
    focus: { path: number[]; offset: number };
  } | null
) =>
  range
    ? `${range.anchor.path.join('.')}:${range.anchor.offset}|${range.focus.path.join(
        '.'
      )}:${range.focus.offset}`
    : 'none';

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

const AnnotationOverlaySlices = () => {
  const editor = useEditor();
  const leftId = editorGetSnapshot(editor).index.pathToId['0.0'] ?? '';
  const comment = usePliteAnnotation<CommentData, CommentProjection>(
    'comment-1'
  );
  const annotationSnapshot = usePliteAnnotations<
    CommentData,
    CommentProjection
  >();
  const projections = usePliteProjectionEntries<{
    annotationId: string;
    kind: string;
    tone?: string;
  }>(leftId);

  return (
    <>
      <span id="inline-projection">{formatProjection(projections)}</span>
      <span id="single-annotation">
        {comment
          ? `${comment.id}:${comment.data?.label ?? 'none'}:${formatRange(comment.range)}`
          : 'none'}
      </span>
      <span id="annotation-sidebar">
        {annotationSnapshot.allIds.length === 0
          ? 'none'
          : annotationSnapshot.allIds
              .map((id) => {
                const annotation = annotationSnapshot.byId.get(id)!;

                return `${annotation.id}:${annotation.data?.label ?? 'none'}:${formatRange(annotation.range)}`;
              })
              .join('|')}
      </span>
    </>
  );
};

const AnnotationHarness = ({
  annotations,
  editor,
}: {
  annotations: readonly PliteAnnotation<CommentData, CommentProjection>[];
  editor: ReturnType<typeof createEditor>;
}) => {
  const annotationStore = usePliteAnnotationStore(editor, annotations);

  return (
    <Plite annotationStore={annotationStore} editor={editor}>
      <AnnotationOverlaySlices />
    </Plite>
  );
};

type CommentSource = {
  anchor: PliteAnnotation<CommentData, CommentProjection>['anchor'];
  id: string;
  label: string;
  tone: string;
};

const ProjectedAnnotationHarness = ({
  comments,
  editor,
}: {
  comments: readonly CommentSource[];
  editor: ReturnType<typeof createEditor>;
}) => {
  const annotationStore = usePliteAnnotationStore<
    CommentData,
    CommentProjection
  >(editor, {
    deps: [comments],
    project: () =>
      comments.map((comment) => ({
        anchor: comment.anchor,
        data: {
          kind: 'annotation',
          label: comment.label,
          tone: comment.tone,
        },
        id: comment.id,
        projection: {
          kind: 'annotation',
          tone: comment.tone,
        },
      })),
  });

  return (
    <Plite annotationStore={annotationStore} editor={editor}>
      <AnnotationOverlaySlices />
    </Plite>
  );
};

describe('plite-react annotation store contract', () => {
  test('one annotation entity drives inline projection and sidebar state from one store', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const annotations = [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'persistent',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
          tone: 'persistent',
        },
      },
    ] as const;

    const mounted = render(
      <AnnotationHarness annotations={annotations} editor={editor} />
    );

    expect(
      mounted.container.querySelector('#inline-projection')?.textContent
    ).toBe('comment-1:1-4:annotation:persistent:comment-1');
    expect(
      mounted.container.querySelector('#annotation-sidebar')?.textContent
    ).toBe('comment-1:Comment 1:0.0:1|0.0:4');
    expect(
      mounted.container.querySelector('#single-annotation')?.textContent
    ).toBe('comment-1:Comment 1:0.0:1|0.0:4');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('>', {
          at: { path: [0, 0], offset: 0 },
        });
      });
    });

    expect(
      mounted.container.querySelector('#inline-projection')?.textContent
    ).toBe('comment-1:2-5:annotation:persistent:comment-1');
    expect(
      mounted.container.querySelector('#annotation-sidebar')?.textContent
    ).toBe('comment-1:Comment 1:0.0:2|0.0:5');
    expect(
      mounted.container.querySelector('#single-annotation')?.textContent
    ).toBe('comment-1:Comment 1:0.0:2|0.0:5');
  });

  test('annotation hook projector options refresh without caller memoization', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const comments = [
      {
        anchor: bookmark,
        id: 'comment-1',
        label: 'Comment 1',
        tone: 'draft',
      },
    ] as const;

    const mounted = render(
      <ProjectedAnnotationHarness comments={comments} editor={editor} />
    );

    expect(
      mounted.container.querySelector('#annotation-sidebar')?.textContent
    ).toBe('comment-1:Comment 1:0.0:1|0.0:4');
    expect(
      mounted.container.querySelector('#inline-projection')?.textContent
    ).toBe('comment-1:1-4:annotation:draft:comment-1');

    await act(async () => {
      mounted.rerender(
        <ProjectedAnnotationHarness
          comments={[
            {
              ...comments[0],
              label: 'Updated',
              tone: 'reviewed',
            },
          ]}
          editor={editor}
        />
      );
    });

    expect(
      mounted.container.querySelector('#annotation-sidebar')?.textContent
    ).toBe('comment-1:Updated:0.0:1|0.0:4');
    expect(
      mounted.container.querySelector('#inline-projection')?.textContent
    ).toBe('comment-1:1-4:annotation:reviewed:comment-1');
  });

  test('annotation stores ignore selection-only changes and update when bookmark ranges rebase', async () => {
    const editor = createEditor();
    let notifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });
    const baselineMetrics = store.getMetrics();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        });
      });
    });

    expect(notifications).toBe(0);
    expect(store.getMetrics().annotationResolveCount).toBe(
      baselineMetrics.annotationResolveCount
    );
    expect(store.getMetrics().fullFallbackCount).toBe(
      baselineMetrics.fullFallbackCount
    );
    expect(
      formatRange(store.getSnapshot().byId.get('comment-1')?.range ?? null)
    ).toBe('0.0:1|0.0:4');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [1, 0], offset: 1 },
        });
      });
    });

    expect(notifications).toBe(0);
    expect(store.getMetrics().annotationResolveCount).toBe(
      baselineMetrics.annotationResolveCount
    );

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('>', {
          at: { path: [0, 0], offset: 0 },
        });
      });
    });

    expect(notifications).toBe(1);
    expect(
      formatRange(store.getSnapshot().byId.get('comment-1')?.range ?? null)
    ).toBe('0.0:2|0.0:5');

    unsubscribe();
    store.destroy();
  });

  test('annotation stores normalize stale resolved ranges that no longer fit committed text', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);
    const staleRange = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: {
          resolve: () => staleRange,
        },
        data: {
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for stale annotation range proof');
    }

    expect(formatRange(store.getAnnotation('comment-1')?.range ?? null)).toBe(
      '0.0:1|0.0:4'
    );
    expect(store.projectionStore.getRuntimeSnapshot(runtimeId)).toEqual([
      {
        data: {
          annotationId: 'comment-1',
          kind: 'annotation',
        },
        end: 4,
        key: 'comment-1',
        start: 1,
      },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 4 },
          },
        });
      });
    });

    expect(store.getAnnotation('comment-1')?.range).toBeNull();
    expect(store.projectionStore.getRuntimeSnapshot(runtimeId)).toEqual([]);

    store.destroy();
  });

  test('annotation stores refresh when root runtime order changes', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        tx.fragment.insert([
          {
            type: 'paragraph',
            children: [{ text: 'intro-a' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'intro-b' }],
          },
        ]);
      });
    });

    expect(
      formatRange(store.getSnapshot().byId.get('comment-1')?.range ?? null)
    ).toBe('1.0:8|1.0:11');

    store.destroy();
  });

  test('annotation stores receive editor changes through the source bus', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const originalSubscribe = editor.subscribe;
    editor.subscribe = (() => {
      throw new Error('Unexpected broad editor.subscribe fan-in');
    }) as typeof editor.subscribe;

    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);

    try {
      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('>', {
            at: { path: [0, 0], offset: 0 },
          });
        });
      });

      expect(
        formatRange(store.getSnapshot().byId.get('comment-1')?.range ?? null)
      ).toBe('0.0:2|0.0:5');
      expect(store.getMetrics().recomputeCount).toBe(1);
    } finally {
      store.destroy();
      editor.subscribe = originalSubscribe;
    }
  });

  test('annotation projection store reprojects touched interior runtime ids even when the resolved range is unchanged', async () => {
    const editor = createEditor();
    const data = {
      kind: 'annotation',
      label: 'Comment 1',
    };

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'aa' },
            { text: 'bb', bold: true },
            { text: 'cc' },
          ],
        },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const middleId = snapshot.index.pathToId['0.1'];
    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 2 },
    });
    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: bookmark,
        data,
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);

    expect(middleId).toBeTruthy();
    expect(store.projectionStore.getSnapshot()[middleId!]).toEqual([
      {
        key: 'comment-1',
        start: 0,
        end: 2,
        data: {
          annotationId: 'comment-1',
          kind: 'annotation',
        },
      },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('xx', {
          at: { path: [0, 1], offset: 1 },
        });
      });
    });

    expect(
      formatRange(store.getSnapshot().byId.get('comment-1')?.range ?? null)
    ).toBe('0.0:0|0.2:2');
    expect(store.projectionStore.getSnapshot()[middleId!]).toEqual([
      {
        key: 'comment-1',
        start: 0,
        end: 4,
        data: {
          annotationId: 'comment-1',
          kind: 'annotation',
        },
      },
    ]);

    store.destroy();
    bookmark.unref();
  });

  test('external refresh targets annotation ids and treats an empty id list as a no-op', () => {
    const editor = createEditor();
    let annotationNotifications = 0;
    let unrelatedNotifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const commentBookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const unrelatedBookmark = editorBookmark(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    let annotations: readonly PliteAnnotation<
      CommentData,
      CommentProjection
    >[] = [
      {
        anchor: commentBookmark,
        data: {
          body: 'first body',
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
      {
        anchor: unrelatedBookmark,
        data: {
          body: 'unrelated body',
          kind: 'annotation',
          label: 'Comment 2',
        },
        id: 'comment-2',
        projection: {
          kind: 'annotation',
        },
      },
    ];
    const store = createPliteAnnotationStore(editor, () => annotations);
    const baselineMetrics = store.getMetrics();

    store.subscribeAnnotation('comment-1', () => {
      annotationNotifications += 1;
    });
    store.subscribeAnnotation('comment-2', () => {
      unrelatedNotifications += 1;
    });

    annotations = [
      {
        ...annotations[0]!,
        data: {
          ...annotations[0]!.data!,
          body: 'edited body',
        },
      },
      annotations[1]!,
    ];

    store.refresh({ ids: [], reason: 'annotation' });

    expect(annotationNotifications).toBe(0);
    expect(store.getMetrics()).toBe(baselineMetrics);
    expect(store.getAnnotation('comment-1')?.data?.body).toBe('first body');

    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(1);
    expect(unrelatedNotifications).toBe(0);
    expect(store.getAnnotation('comment-1')?.data?.body).toBe('edited body');
    expect(store.getMetrics()).toMatchObject({
      annotationResolveCount: baselineMetrics.annotationResolveCount + 1,
      fullFallbackCount: baselineMetrics.fullFallbackCount,
    });

    store.destroy();
    commentBookmark.unref();
    unrelatedBookmark.unref();
  });

  test('annotation data changes wake annotation subscribers without repainting stable projections', () => {
    const editor = createEditor();
    let annotationNotifications = 0;
    let projectionNotifications = 0;
    let runtimeNotifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for projection split proof');
    }

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    let annotations: readonly PliteAnnotation<
      CommentData,
      CommentProjection
    >[] = [
      {
        anchor: bookmark,
        data: {
          body: 'first body',
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'review',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
          tone: 'review',
        },
      },
    ];
    const store = createPliteAnnotationStore(editor, () => annotations);
    const baselineMetrics = store.getMetrics();

    store.subscribeAnnotation('comment-1', () => {
      annotationNotifications += 1;
    });
    store.projectionStore.subscribe(() => {
      projectionNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(runtimeId, () => {
      runtimeNotifications += 1;
    });

    annotations = [
      {
        ...annotations[0]!,
        data: {
          ...annotations[0]!.data!,
          body: 'edited body',
        },
      },
    ];

    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(1);
    expect(projectionNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);
    expect(store.getAnnotation('comment-1')?.data?.body).toBe('edited body');
    expect(store.getMetrics()).toMatchObject({
      annotationSubscriberWakeCount:
        baselineMetrics.annotationSubscriberWakeCount + 1,
      changedAnnotationCount: baselineMetrics.changedAnnotationCount + 1,
      changedRuntimeBucketCount: baselineMetrics.changedRuntimeBucketCount,
      projectionSubscriberWakeCount:
        baselineMetrics.projectionSubscriberWakeCount,
      runtimeSubscriberWakeCount: baselineMetrics.runtimeSubscriberWakeCount,
    });

    store.destroy();
    bookmark.unref();
  });

  test('partial annotation projection refresh preserves annotation order in shared runtime buckets', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for annotation order proof');
    }

    const firstBookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const secondBookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    let annotations: readonly PliteAnnotation<
      CommentData,
      CommentProjection
    >[] = [
      {
        anchor: firstBookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'draft',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
          tone: 'draft',
        },
      },
      {
        anchor: secondBookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 2',
          tone: 'review',
        },
        id: 'comment-2',
        projection: {
          kind: 'annotation',
          tone: 'review',
        },
      },
    ];
    const store = createPliteAnnotationStore(editor, () => annotations);
    const projectionKeys = () =>
      store.projectionStore
        .getRuntimeSnapshot(runtimeId)
        .map((entry) => `${entry.key}:${entry.data?.tone ?? 'none'}`);

    expect(projectionKeys()).toEqual(['comment-1:draft', 'comment-2:review']);

    annotations = [
      {
        ...annotations[0]!,
        data: {
          ...annotations[0]!.data!,
          tone: 'approved',
        },
        projection: {
          kind: 'annotation',
          tone: 'approved',
        },
      },
      annotations[1]!,
    ];

    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(projectionKeys()).toEqual([
      'comment-1:approved',
      'comment-2:review',
    ]);

    store.destroy();
    firstBookmark.unref();
    secondBookmark.unref();
  });

  test('annotation metadata uses reference equality for non-JSON data', () => {
    const editor = createEditor();
    let annotationNotifications = 0;
    let projectionNotifications = 0;
    let runtimeNotifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for annotation metadata proof');
    }

    const circularData: Record<string, unknown> = {};
    circularData.self = circularData;

    let metadata: unknown = circularData;
    let projection: NonJsonProjection = {
      kind: 'annotation',
      payload: new Map([['value', 0]]),
    };
    const store = createPliteAnnotationStore<unknown, NonJsonProjection>(
      editor,
      () => [
        {
          anchor: {
            resolve: () => ({
              anchor: { path: [0, 0], offset: 1 },
              focus: { path: [0, 0], offset: 4 },
            }),
          },
          data: metadata,
          id: 'comment-1',
          projection,
        },
      ]
    );

    store.subscribeAnnotation('comment-1', () => {
      annotationNotifications += 1;
    });
    store.projectionStore.subscribe(() => {
      projectionNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(runtimeId, () => {
      runtimeNotifications += 1;
    });

    expect(() => {
      store.refresh({ ids: ['comment-1'], reason: 'annotation' });
    }).not.toThrow();
    expect(annotationNotifications).toBe(0);
    expect(projectionNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);

    metadata = new Map([['value', 1]]);
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(1);
    expect(projectionNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);

    metadata = new Map([['value', 2]]);
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(2);
    expect(projectionNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);

    projection = {
      kind: 'annotation',
      payload: new Map([['value', 1]]),
    };
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(3);
    expect(projectionNotifications).toBe(1);
    expect(runtimeNotifications).toBe(1);

    projection = {
      kind: 'annotation',
      payload: new Map([['value', 2]]),
    };
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(annotationNotifications).toBe(4);
    expect(projectionNotifications).toBe(2);
    expect(runtimeNotifications).toBe(2);

    store.destroy();
  });

  test('annotation projection changes wake only affected runtime buckets', () => {
    const editor = createEditor();
    let commentNotifications = 0;
    let unrelatedNotifications = 0;
    let projectionNotifications = 0;
    let commentRuntimeNotifications = 0;
    let unrelatedRuntimeNotifications = 0;

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const commentRuntimeId = editorGetRuntimeId(editor, [0, 0]);
    const unrelatedRuntimeId = editorGetRuntimeId(editor, [1, 0]);

    if (!commentRuntimeId || !unrelatedRuntimeId) {
      throw new Error('Expected runtime ids for scoped annotation proof');
    }

    const commentBookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const unrelatedBookmark = editorBookmark(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    let annotations: readonly PliteAnnotation<
      CommentData,
      CommentProjection
    >[] = [
      {
        anchor: commentBookmark,
        data: {
          body: 'first body',
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'review',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
          tone: 'review',
        },
      },
      {
        anchor: unrelatedBookmark,
        data: {
          body: 'unrelated body',
          kind: 'annotation',
          label: 'Comment 2',
          tone: 'question',
        },
        id: 'comment-2',
        projection: {
          kind: 'annotation',
          tone: 'question',
        },
      },
    ];
    const store = createPliteAnnotationStore(editor, () => annotations);
    const baselineMetrics = store.getMetrics();

    store.subscribeAnnotation('comment-1', () => {
      commentNotifications += 1;
    });
    store.subscribeAnnotation('comment-2', () => {
      unrelatedNotifications += 1;
    });
    store.projectionStore.subscribe(() => {
      projectionNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(commentRuntimeId, () => {
      commentRuntimeNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(unrelatedRuntimeId, () => {
      unrelatedRuntimeNotifications += 1;
    });

    annotations = [
      {
        ...annotations[0]!,
        data: {
          ...annotations[0]!.data!,
          tone: 'question',
        },
        projection: {
          kind: 'annotation',
          tone: 'question',
        },
      },
      annotations[1]!,
    ];

    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(commentNotifications).toBe(1);
    expect(unrelatedNotifications).toBe(0);
    expect(projectionNotifications).toBe(1);
    expect(commentRuntimeNotifications).toBe(1);
    expect(unrelatedRuntimeNotifications).toBe(0);
    expect(store.projectionStore.getRuntimeSnapshot(commentRuntimeId)).toEqual([
      {
        data: {
          annotationId: 'comment-1',
          kind: 'annotation',
          tone: 'question',
        },
        end: 4,
        key: 'comment-1',
        start: 1,
      },
    ]);
    expect(
      store.projectionStore.getRuntimeSnapshot(unrelatedRuntimeId)
    ).toEqual([
      {
        data: {
          annotationId: 'comment-2',
          kind: 'annotation',
          tone: 'question',
        },
        end: 3,
        key: 'comment-2',
        start: 1,
      },
    ]);
    expect(store.getMetrics()).toMatchObject({
      annotationProjectCount: baselineMetrics.annotationProjectCount + 1,
      annotationResolveCount: baselineMetrics.annotationResolveCount + 1,
      annotationSubscriberWakeCount:
        baselineMetrics.annotationSubscriberWakeCount + 1,
      changedAnnotationCount: baselineMetrics.changedAnnotationCount + 1,
      changedRuntimeBucketCount: baselineMetrics.changedRuntimeBucketCount + 1,
      fullFallbackCount: baselineMetrics.fullFallbackCount,
      projectionSubscriberWakeCount:
        baselineMetrics.projectionSubscriberWakeCount + 1,
      runtimeSubscriberWakeCount:
        baselineMetrics.runtimeSubscriberWakeCount + 1,
    });

    store.destroy();
    commentBookmark.unref();
    unrelatedBookmark.unref();
  });

  test('editor text changes rebase only annotations in impacted runtime buckets', async () => {
    const editor = createEditor();
    const blockCount = 40;
    const targetIndex = 23;
    let targetAnnotationNotifications = 0;
    let unrelatedAnnotationNotifications = 0;
    let targetRuntimeNotifications = 0;
    let unrelatedRuntimeNotifications = 0;

    editorReplace(editor, {
      children: Array.from({ length: blockCount }, (_, index) => ({
        type: 'paragraph',
        children: [{ text: `block-${index}` }],
      })),
      selection: null,
    });

    const targetRuntimeId = editorGetRuntimeId(editor, [targetIndex, 0]);
    const unrelatedRuntimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!targetRuntimeId || !unrelatedRuntimeId) {
      throw new Error(
        'Expected runtime ids for large annotation locality proof'
      );
    }

    const bookmarks = Array.from({ length: blockCount }, (_, index) =>
      editorBookmark(editor, {
        anchor: { path: [index, 0], offset: 1 },
        focus: { path: [index, 0], offset: 4 },
      })
    );
    const annotations: readonly PliteAnnotation<
      CommentData,
      CommentProjection
    >[] = bookmarks.map((anchor, index) => ({
      anchor,
      data: {
        body: `body ${index}`,
        kind: 'annotation',
        label: `Comment ${index}`,
        tone: index === targetIndex ? 'review' : 'question',
      },
      id: `comment-${index}`,
      projection: {
        kind: 'annotation',
        tone: index === targetIndex ? 'review' : 'question',
      },
    }));
    const store = createPliteAnnotationStore(editor, () => annotations);
    const baselineMetrics = store.getMetrics();

    store.subscribeAnnotation(`comment-${targetIndex}`, () => {
      targetAnnotationNotifications += 1;
    });
    store.subscribeAnnotation('comment-0', () => {
      unrelatedAnnotationNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(targetRuntimeId, () => {
      targetRuntimeNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(unrelatedRuntimeId, () => {
      unrelatedRuntimeNotifications += 1;
    });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('>', {
          at: { path: [targetIndex, 0], offset: 0 },
        });
      });
    });

    expect(targetAnnotationNotifications).toBe(1);
    expect(unrelatedAnnotationNotifications).toBe(0);
    expect(targetRuntimeNotifications).toBe(1);
    expect(unrelatedRuntimeNotifications).toBe(0);
    expect(store.projectionStore.getRuntimeSnapshot(targetRuntimeId)).toEqual([
      {
        data: {
          annotationId: `comment-${targetIndex}`,
          kind: 'annotation',
          tone: 'review',
        },
        end: 5,
        key: `comment-${targetIndex}`,
        start: 2,
      },
    ]);
    expect(store.getMetrics()).toMatchObject({
      annotationProjectCount: baselineMetrics.annotationProjectCount + 1,
      annotationResolveCount: baselineMetrics.annotationResolveCount + 1,
      annotationSubscriberWakeCount:
        baselineMetrics.annotationSubscriberWakeCount + 1,
      changedAnnotationCount: baselineMetrics.changedAnnotationCount + 1,
      changedRuntimeBucketCount: baselineMetrics.changedRuntimeBucketCount + 1,
      fullFallbackCount: baselineMetrics.fullFallbackCount,
      recomputeCount: baselineMetrics.recomputeCount + 1,
      runtimeSubscriberWakeCount:
        baselineMetrics.runtimeSubscriberWakeCount + 1,
    });

    store.destroy();
    bookmarks.forEach((bookmark) => {
      bookmark.unref();
    });
  });

  test('annotation metrics count changed ids and runtime subscriber wakes', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for annotation metrics proof');
    }

    const bookmark = editorBookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const store = createPliteAnnotationStore(editor, () => [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
        },
      },
    ]);
    let annotationNotifications = 0;
    let runtimeNotifications = 0;

    store.subscribeAnnotation('comment-1', () => {
      annotationNotifications += 1;
    });
    store.projectionStore.subscribeRuntimeId?.(runtimeId, () => {
      runtimeNotifications += 1;
    });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('>', {
          at: { path: [0, 0], offset: 0 },
        });
      });
    });

    expect(annotationNotifications).toBe(1);
    expect(runtimeNotifications).toBe(1);
    expect(store.getMetrics()).toMatchObject({
      annotationProjectCount: 2,
      annotationResolveCount: 2,
      annotationSubscriberWakeCount: 1,
      changedAnnotationCount: 1,
      changedRuntimeBucketCount: 1,
      recomputeCount: 1,
      runtimeSubscriberWakeCount: 1,
    });

    store.destroy();
    bookmark.unref();
  });
});
