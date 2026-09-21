import { act, render } from '@testing-library/react';
import {
  createEditor as createModelEditor,
  createEditorView,
  type Editor,
  type Range,
} from 'plitejs';
import { StrictMode, Suspense } from 'react';

import {
  createAnnotationStore,
  type AnnotationStore,
} from '../../src/annotations';
import { authored } from '../../src/authored';
import { history } from '../../src/history';
import {
  getAnnotationStoreMetrics,
  replace as editorReplace,
} from '../../src/internal';
import {
  createEditor,
  type Annotation,
  useAnnotation,
  useAnnotationStore,
  useAnnotations,
} from '../../src/react';

type CommentData = {
  body?: string;
  label: string;
};

const createRangeAnchor = (editor: Pick<Editor, 'anchor'>, range: Range) =>
  editor.anchor(range, {
    association: 'inward',
    deletion: 'drop',
  });

const createChildren = () => [
  { type: 'paragraph', children: [{ text: 'alpha' }] },
  { type: 'paragraph', children: [{ text: 'beta' }] },
];

const formatRange = (range: Range | null) =>
  range
    ? `${range.anchor.path.join('.')}:${range.anchor.offset}|${range.focus.path.join('.')}:${range.focus.offset}`
    : 'none';

const AnnotationProbe = ({
  store,
}: {
  store: AnnotationStore<CommentData>;
}) => {
  const comment = useAnnotation(store, 'comment-1');
  const snapshot = useAnnotations(store);

  return (
    <>
      <span data-testid="comment">
        {comment
          ? `${comment.data?.label}:${formatRange(comment.range)}`
          : 'none'}
      </span>
      <span data-testid="all">{snapshot.allIds.join('|') || 'none'}</span>
    </>
  );
};

const AnnotationHarness = ({
  annotations,
  editor,
}: {
  annotations: ReadonlyArray<Annotation<CommentData>>;
  editor: ReturnType<typeof createEditor>;
}) => {
  const store = useAnnotationStore(editor, annotations);

  return <AnnotationProbe store={store} />;
};

describe('plite-react annotation store contract', () => {
  test('reads an unobserved index once per document and observes only until its last subscriber leaves', () => {
    const editor = createModelEditor({ initialValue: createChildren() });
    const subscribe = editor.subscribeCommit.bind(editor);
    const stopped = vi.fn();
    const subscriptions = vi
      .spyOn(editor, 'subscribeCommit')
      .mockImplementation((listener) => {
        const stop = subscribe(listener);
        return () => {
          stopped();
          stop();
        };
      });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const store = createAnnotationStore(editor, [{ anchor, id: 'comment' }]);
    const initialMetrics = getAnnotationStoreMetrics(store);
    const initialSnapshot = store.getSnapshot();
    expect(subscriptions).not.toHaveBeenCalled();
    for (let index = 0; index < 10; index += 1) {
      store.getAnnotationsAt(editor.key([0, 0])!);
      expect(store.getSnapshot()).toBe(initialSnapshot);
    }
    expect(getAnnotationStoreMetrics(store)).toBe(initialMetrics);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(store.getSnapshot()).toBe(initialSnapshot);
    expect(getAnnotationStoreMetrics(store)).toBe(initialMetrics);
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 0 } });
    expect(getAnnotationStoreMetrics(store)).toBe(initialMetrics);
    expect(store.getAnnotation('comment')?.range).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    const refreshed = getAnnotationStoreMetrics(store);
    expect(refreshed.annotationResolveCount).toBe(
      initialMetrics.annotationResolveCount + 1
    );
    store.getAnnotationsAt(editor.key([0, 0])!);
    store.getSnapshot();
    expect(getAnnotationStoreMetrics(store)).toBe(refreshed);
    expect(subscriptions).not.toHaveBeenCalled();

    const globalChanged = vi.fn();
    const stopGlobal = store.subscribe(globalChanged);
    const stopEntity = store.subscribeAnnotation('comment', () => {});
    const stopChanges = store.subscribeChanges(() => {});
    expect(subscriptions).toHaveBeenCalledTimes(1);
    stopGlobal();
    stopEntity();
    expect(stopped).not.toHaveBeenCalled();
    stopChanges();
    stopChanges();
    expect(stopped).toHaveBeenCalledTimes(1);
    editor.update.text.insert('?', { at: { path: [0, 0], offset: 0 } });
    expect(getAnnotationStoreMetrics(store)).toBe(refreshed);
    const resume = store.subscribe(globalChanged);
    expect(subscriptions).toHaveBeenCalledTimes(2);
    expect(store.getAnnotation('comment')?.range?.anchor.offset).toBe(3);
    expect(globalChanged).not.toHaveBeenCalled();
    store.destroy();
    resume();
    expect(stopped).toHaveBeenCalledTimes(2);
    subscriptions.mockRestore();
    anchor.release();
  });

  test('one retained target resolves independently in two authored views', async () => {
    const model = createModelEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: createChildren(),
    });
    const first = createEditorView(model);
    const second = createEditorView(model, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const projected = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 6 },
    };
    const anchor = createRangeAnchor(model, range);
    second.update.text.insert('++', { at: { path: [0, 0], offset: 0 } });
    const data = Object.freeze({ label: 'shared conversation' });
    const source = [{ anchor, data, id: 'comment' }];
    const firstStore = createAnnotationStore(first, source);
    const secondStore = createAnnotationStore(second, source);
    const firstChanges = vi.fn();
    const secondChanges = vi.fn();
    const stopFirst = firstStore.subscribeChanges(firstChanges);
    const stopSecond = secondStore.subscribeChanges(secondChanges);
    const commits = vi.fn();
    const semanticChanges = vi.fn();
    const stopCommits = model.subscribeCommit(commits);
    const stopSemantic = model.api.authored.subscribeChanges(semanticChanges);
    const before = model.read.value();

    expect(firstStore.getAnnotation('comment')?.range).toEqual(range);
    expect(secondStore.getAnnotation('comment')?.range).toEqual(projected);

    first.api.authored.setView({ intent: 'edit', projection: 'markup' });
    await Promise.resolve();
    expect(firstStore.getAnnotation('comment')?.range).toEqual(projected);
    expect(firstChanges).toHaveBeenCalledTimes(1);
    expect(secondChanges).not.toHaveBeenCalled();

    second.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    await Promise.resolve();
    expect(firstStore.getAnnotation('comment')?.range).toEqual(projected);
    expect(secondStore.getAnnotation('comment')?.range).toEqual(range);
    expect(secondChanges).toHaveBeenCalledTimes(1);
    expect(firstStore.getAnnotation('comment')?.data).toBe(data);
    expect(secondStore.getAnnotation('comment')?.data).toBe(data);
    expect(model.read.value()).toEqual(before);
    expect(commits).not.toHaveBeenCalled();
    expect(semanticChanges).not.toHaveBeenCalled();

    const firstMetrics = getAnnotationStoreMetrics(firstStore);
    const secondMetrics = getAnnotationStoreMetrics(secondStore);
    first.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await Promise.resolve();
    expect(getAnnotationStoreMetrics(firstStore)).toBe(firstMetrics);
    expect(getAnnotationStoreMetrics(secondStore)).toBe(secondMetrics);

    stopFirst();
    stopSecond();
    first.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    expect(getAnnotationStoreMetrics(firstStore)).toBe(firstMetrics);
    expect(firstStore.getAnnotation('comment')?.range).toEqual(range);
    const passiveMetrics = getAnnotationStoreMetrics(firstStore);
    expect(passiveMetrics.annotationResolveCount).toBe(
      firstMetrics.annotationResolveCount + 1
    );
    firstStore.getAnnotationsAt(first.key([0, 0])!);
    await Promise.resolve();
    expect(getAnnotationStoreMetrics(firstStore)).toBe(passiveMetrics);
    expect(firstChanges).toHaveBeenCalledTimes(1);
    expect(secondChanges).toHaveBeenCalledTimes(1);

    stopCommits();
    stopSemantic();
    firstStore.destroy();
    secondStore.destroy();
    anchor.release();
  });

  test('native commits update the affected view index without a manual refresh', () => {
    const model = createModelEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: createChildren(),
    });
    const accepted = createEditorView(model);
    const proposed = createEditorView(model, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    const anchor = createRangeAnchor(model, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const annotations = [{ anchor, id: 'comment' }];
    const acceptedStore = createAnnotationStore(accepted, annotations);
    const proposedStore = createAnnotationStore(proposed, annotations);
    const before = acceptedStore.getSnapshot();
    const acceptedChanged = vi.fn();
    const proposedChanged = vi.fn();
    acceptedStore.subscribeChanges(acceptedChanged);
    proposedStore.subscribeChanges(proposedChanged);

    proposed.update.text.insert('++', { at: { path: [0, 0], offset: 0 } });
    expect(model.read.text.string([0])).toBe('alpha');
    expect(acceptedStore.getSnapshot()).toBe(before);
    expect(acceptedChanged).not.toHaveBeenCalled();
    expect(proposedStore.getAnnotation('comment')?.range).toEqual({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 6 },
    });
    expect(proposedChanged).toHaveBeenCalledTimes(1);
    expect(proposedStore.getAnnotationsAt(proposed.key([0, 0])!)).toEqual([
      proposedStore.getAnnotation('comment'),
    ]);

    accepted.update.text.insert('!', { at: { path: [0, 0], offset: 0 } });
    expect(acceptedStore.getAnnotation('comment')?.range).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    expect(proposedStore.getAnnotation('comment')?.range).toEqual({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 7 },
    });
    expect(acceptedChanged).toHaveBeenCalledTimes(1);
    expect(proposedChanged).toHaveBeenCalledTimes(2);

    acceptedStore.destroy();
    proposedStore.destroy();
    anchor.release();
  });

  test('abandoned and unmounted React stores do not observe commits or view changes', async () => {
    const model = createModelEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: createChildren(),
    });
    const view = createEditorView(model);
    const anchor = createRangeAnchor(model, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const annotations = [{ anchor, id: 'comment' }];
    const suspended = new Promise<never>(() => {});
    const abandoned: AnnotationStore[] = [];
    const Abandoned = () => {
      abandoned.push(useAnnotationStore(view, annotations));
      throw suspended;
    };
    const pending = render(
      <Suspense fallback="loading">
        <Abandoned />
      </Suspense>
    );
    expect(abandoned.length).toBeGreaterThan(0);
    pending.unmount();
    let active: AnnotationStore | undefined;
    const Mounted = () => {
      active = useAnnotationStore(view, annotations);
      return null;
    };
    const mounted = render(
      <StrictMode>
        <Mounted />
      </StrictMode>
    );
    expect(active?.getAnnotation('comment')?.range).toEqual(anchor.resolve());
    expect(active).not.toHaveProperty('destroy');
    expect(active).not.toHaveProperty('getMetrics');
    expect(active).not.toHaveProperty('getSourceStatus');
    expect(active).not.toHaveProperty('retry');
    mounted.unmount();
    await Promise.resolve();
    const metrics = active ? getAnnotationStoreMetrics(active) : undefined;

    model.update.text.insert('!', { at: { path: [0, 0], offset: 0 } });
    view.api.authored.setView({ intent: 'propose', projection: 'markup' });
    await Promise.resolve();

    expect(active ? getAnnotationStoreMetrics(active) : undefined).toBe(
      metrics
    );
    for (const store of abandoned) {
      expect(getAnnotationStoreMetrics(store).annotationResolveCount).toBe(0);
      expect(store.getSnapshot().allIds).toEqual([]);
    }
    expect(anchor.resolve()).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
    anchor.release();
  });

  test('publishes changed node membership when projection preserves annotation coordinates', async () => {
    const model = createModelEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: createChildren(),
    });
    const view = createEditorView(model);
    model.update((tx) => {
      tx.authored.propose();
      tx.nodes.replace(
        { type: 'paragraph', children: [{ text: 'other' }] },
        { at: [0] }
      );
    });
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const store = createAnnotationStore(view, [
      {
        id: 'position',
        anchor: { resolve: () => range },
      },
    ]);
    const oldKey = view.key([0, 0])!;
    const annotation = store.getAnnotation('position');
    const changed = vi.fn();
    const entityChanged = vi.fn();
    store.subscribeChanges(changed);
    store.subscribeAnnotation('position', entityChanged);

    view.api.authored.setView({ intent: 'propose', projection: 'markup' });
    await Promise.resolve();
    const newKey = view.key([0, 0])!;
    expect(newKey).not.toBe(oldKey);
    expect(store.getAnnotation('position')).toBe(annotation);
    expect(store.getAnnotationsAt(oldKey)).toEqual([]);
    expect(store.getAnnotationsAt(newKey)).toEqual([annotation]);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({
      ids: [],
      nodeKeys: expect.arrayContaining([oldKey, newKey]),
      reason: 'editor',
    });
    expect(entityChanged).not.toHaveBeenCalled();
    store.destroy();
  });

  test('publishes exact nearest annotation ranges through undo and redo', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [{ type: 'paragraph', children: [{ text: 'This' }] }],
    });
    const before = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as const;
    const after = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as const;
    const anchor = editor.anchor(before, {
      association: 'inward',
      deletion: 'nearest',
    });
    const store = createAnnotationStore(editor, [{ anchor, id: 'comment-1' }]);

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    expect(store.getAnnotation('comment-1')?.range).toEqual(after);

    editor.api.history.undo();
    expect(store.getAnnotation('comment-1')?.range).toEqual(before);

    editor.api.history.redo();
    expect(store.getAnnotation('comment-1')?.range).toEqual(after);

    store.destroy();
    anchor.release();
  });

  test('reads annotations at a text node in source order', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const firstAnchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    const secondAnchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const otherAnchor = createRangeAnchor(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 4 },
    });
    const store = createAnnotationStore(editor, [
      { anchor: secondAnchor, id: 'second' },
      { anchor: otherAnchor, id: 'other' },
      { anchor: firstAnchor, id: 'first' },
    ]);

    expect(
      store
        .getAnnotationsAt(editor.key([0, 0])!)
        .map((annotation) => annotation.id)
    ).toEqual(['second', 'first']);

    store.destroy();
    firstAnchor.release();
    secondAnchor.release();
    otherAnchor.release();
  });

  test('document commits do not scan a stable annotation source', () => {
    const count = 1000;
    const editor = createEditor({
      initialValue: Array.from({ length: count }, () => ({
        type: 'paragraph',
        children: [{ text: 'text' }],
      })),
    });
    let idReads = 0;
    const annotations = Array.from({ length: count }, (_, index) => ({
      anchor: createRangeAnchor(editor, {
        anchor: { path: [index, 0], offset: 0 },
        focus: { path: [index, 0], offset: 4 },
      }),
      get id() {
        idReads += 1;
        return `annotation-${index}`;
      },
    }));
    const store = createAnnotationStore(editor, () => annotations);
    const stop = store.subscribe(() => {});

    idReads = 0;
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    expect(idReads).toBeLessThanOrEqual(8);
    expect(store.getAnnotation('annotation-999')?.range).toEqual({
      anchor: { path: [999, 0], offset: 0 },
      focus: { path: [999, 0], offset: 4 },
    });

    idReads = 0;
    editor.update.text.insert('y', { at: { path: [999, 0], offset: 0 } });
    expect(idReads).toBeLessThanOrEqual(8);
    expect(store.getAnnotation('annotation-999')?.range).toEqual({
      anchor: { path: [999, 0], offset: 1 },
      focus: { path: [999, 0], offset: 5 },
    });
    expect(idReads).toBeLessThanOrEqual(8);

    stop();
    store.destroy();
    annotations.forEach(({ anchor }) => anchor.release());
  });

  test('one annotation store feeds individual and collection hooks', async () => {
    const editor = createEditor();

    editorReplace(editor, { children: createChildren(), selection: null });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const annotation = (label: string): Annotation<CommentData> => ({
      anchor,
      data: { label },
      id: 'comment-1',
    });
    const mounted = render(
      <AnnotationHarness annotations={[annotation('draft')]} editor={editor} />
    );

    expect(mounted.getByTestId('comment').textContent).toBe(
      'draft:0.0:0|0.0:5'
    );
    expect(mounted.getByTestId('all').textContent).toBe('comment-1');

    await act(async () => {
      mounted.rerender(
        <AnnotationHarness
          annotations={[annotation('review')]}
          editor={editor}
        />
      );
    });

    expect(mounted.getByTestId('comment').textContent).toBe(
      'review:0.0:0|0.0:5'
    );
    anchor.release();
  });

  test('selection changes stay silent while text edits rebase anchors', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 4 },
    });
    const store = createAnnotationStore(editor, [{ anchor, id: 'comment-1' }]);
    const changes: unknown[] = [];
    let wakes = 0;

    store.subscribeChanges((change) => changes.push(change));
    store.subscribe(() => {
      wakes += 1;
    });
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(wakes).toBe(0);

    editor.update.text.insert('x', { at: { path: [1, 0], offset: 0 } });
    expect(store.getAnnotation('comment-1')?.range).toEqual({
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 5 },
    });
    expect(wakes).toBe(1);
    expect(changes).toEqual([
      {
        ids: ['comment-1'],
        nodeKeys: [editor.key([1, 0])],
        reason: 'editor',
      },
    ]);

    store.destroy();
    anchor.release();
  });

  test('targeted refresh publishes exact ids, node keys, and reason', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const firstAnchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const secondAnchor = createRangeAnchor(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 4 },
    });
    let annotations: ReadonlyArray<Annotation<CommentData>> = [
      { anchor: firstAnchor, data: { label: 'one' }, id: 'one' },
      { anchor: secondAnchor, data: { label: 'two' }, id: 'two' },
    ];
    const store = createAnnotationStore(editor, () => annotations);
    const changes: unknown[] = [];
    let firstWakes = 0;
    let secondWakes = 0;

    store.subscribeChanges((change) => changes.push(change));
    store.subscribeAnnotation('one', () => {
      firstWakes += 1;
    });
    store.subscribeAnnotation('two', () => {
      secondWakes += 1;
    });
    annotations = [
      { anchor: firstAnchor, data: { label: 'updated' }, id: 'one' },
      annotations[1],
    ];
    store.refresh({ ids: ['one'], reason: 'external' });

    expect(store.getAnnotation('one')?.data?.label).toBe('updated');
    expect(changes).toEqual([
      {
        ids: ['one'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'external',
      },
    ]);
    expect(firstWakes).toBe(1);
    expect(secondWakes).toBe(0);

    store.destroy();
    firstAnchor.release();
    secondAnchor.release();
  });

  test('range movement reports the exact old and new text-node keys', () => {
    const editor = createEditor({ initialValue: createChildren() });
    let range: Range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const store = createAnnotationStore(editor, [
      {
        anchor: {
          resolve: () => range,
        },
        id: 'comment-1',
      },
    ]);
    const changes: unknown[] = [];

    store.subscribeChanges((change) => changes.push(change));
    range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });
    range = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 2 },
    };
    store.refresh({ ids: ['comment-1'], reason: 'annotation' });

    expect(changes).toEqual([
      {
        ids: ['comment-1'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'annotation',
      },
      {
        ids: ['comment-1'],
        nodeKeys: [editor.key([0, 0]), editor.key([1, 0])],
        reason: 'annotation',
      },
    ]);
    store.destroy();
  });

  test('source membership and order changes report affected text nodes', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const firstAnchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    const secondAnchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const first = { anchor: firstAnchor, id: 'first' };
    const second = { anchor: secondAnchor, id: 'second' };
    let annotations: readonly Annotation[] = [first, second];
    const store = createAnnotationStore(editor, () => annotations);
    const changes: unknown[] = [];

    store.subscribeChanges((change) => changes.push(change));
    annotations = [second, first];
    store.refresh({ reason: 'external' });
    annotations = [second];
    store.refresh({ reason: 'external' });
    annotations = [first, second];
    store.refresh({ reason: 'external' });

    expect(changes).toEqual([
      {
        ids: [],
        nodeKeys: [editor.key([0, 0])],
        reason: 'external',
      },
      {
        ids: ['first'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'external',
      },
      {
        ids: ['first'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'external',
      },
    ]);

    store.destroy();
    firstAnchor.release();
    secondAnchor.release();
  });

  test('an empty targeted refresh is a no-op', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    let label = 'before';
    const store = createAnnotationStore(editor, () => [
      { anchor, data: { label }, id: 'comment-1' },
    ]);

    label = 'after';
    store.refresh({ ids: [] });
    expect(store.getAnnotation('comment-1')?.data?.label).toBe('before');

    store.destroy();
    anchor.release();
  });

  test('invalid resolved ranges normalize to null and can recover', () => {
    const editor = createEditor({ initialValue: createChildren() });
    let range: Range = {
      anchor: { path: [0, 0], offset: 99 },
      focus: { path: [0, 0], offset: 100 },
    };
    const anchor = {
      release() {
        return null;
      },
      resolve: () => range,
    };
    const store = createAnnotationStore(editor, [{ anchor, id: 'comment-1' }]);
    const changes: unknown[] = [];

    expect(store.getAnnotation('comment-1')?.range).toBeNull();
    store.subscribeChanges((change) => changes.push(change));
    range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    store.refresh();
    expect(store.getAnnotation('comment-1')?.range).toEqual(range);
    range = {
      anchor: { path: [0, 0], offset: 99 },
      focus: { path: [0, 0], offset: 100 },
    };
    store.refresh();
    expect(changes).toEqual([
      {
        ids: ['comment-1'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'refresh',
      },
      {
        ids: ['comment-1'],
        nodeKeys: [editor.key([0, 0])],
        reason: 'refresh',
      },
    ]);
    store.destroy();
  });

  test('duplicate ids are invalid input and recover after correction', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = { resolve: () => null };

    expect(() =>
      createAnnotationStore(editor, [
        { anchor, id: 'duplicate' },
        { anchor, id: 'duplicate' },
      ])
    ).toThrow('Annotation IDs must be unique: "duplicate".');

    let annotations: readonly Annotation[] = [{ anchor, id: 'first' }];
    const store = createAnnotationStore(editor, () => annotations);
    annotations = [
      { anchor, id: 'duplicate' },
      { anchor, id: 'duplicate' },
    ];
    expect(() => store.refresh()).toThrow(
      'Annotation IDs must be unique: "duplicate".'
    );
    expect(store.getSnapshot().allIds).toEqual(['first']);

    annotations = [{ anchor, id: 'recovered' }];
    store.refresh();
    expect(store.getSnapshot().allIds).toEqual(['recovered']);
    store.destroy();
  });

  test('non-JSON data uses reference equality', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const payload = new Map([['count', 1]]);
    let data = { label: 'one', payload };
    const store = createAnnotationStore(editor, () => [
      { anchor, data, id: 'comment-1' },
    ]);
    let wakes = 0;

    store.subscribeAnnotation('comment-1', () => {
      wakes += 1;
    });
    store.refresh();
    expect(wakes).toBe(0);

    data = { label: 'one', payload: new Map([['count', 1]]) };
    store.refresh();
    expect(wakes).toBe(1);

    store.destroy();
    anchor.release();
  });

  test('metrics count changed ids and subscriber wakes', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    let label = 'before';
    const store = createAnnotationStore(editor, () => [
      { anchor, data: { label }, id: 'comment-1' },
    ]);
    const baseline = getAnnotationStoreMetrics(store);

    store.subscribe(() => {});
    store.subscribeAnnotation('comment-1', () => {});
    label = 'after';
    store.refresh({ ids: ['comment-1'] });

    expect(getAnnotationStoreMetrics(store)).toMatchObject({
      annotationSubscriberWakeCount: baseline.annotationSubscriberWakeCount + 2,
      changedAnnotationCount: baseline.changedAnnotationCount + 1,
      recomputeCount: baseline.recomputeCount + 1,
    });

    store.destroy();
    anchor.release();
  });
});
