import { act, render } from '@testing-library/react';
import type { Editor, Range } from 'plitejs';

import { createPliteAnnotationStore } from '../../src/annotations';
import { history } from '../../src/history';
import { replace as editorReplace } from '../../src/internal';
import {
  createEditor,
  type PliteAnnotation,
  PliteAnnotationProvider,
  usePliteAnnotation,
  usePliteAnnotationStore,
  usePliteAnnotations,
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

const AnnotationProbe = () => {
  const comment = usePliteAnnotation<CommentData>('comment-1');
  const snapshot = usePliteAnnotations<CommentData>();

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
  annotations: ReadonlyArray<PliteAnnotation<CommentData>>;
  editor: ReturnType<typeof createEditor>;
}) => {
  const store = usePliteAnnotationStore(editor, annotations);

  return (
    <PliteAnnotationProvider store={store}>
      <AnnotationProbe />
    </PliteAnnotationProvider>
  );
};

describe('plite-react annotation store contract', () => {
  test('publishes exact nearest annotation ranges through undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
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
    const store = createPliteAnnotationStore(editor, [
      { anchor, id: 'comment-1' },
    ]);

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({ at: { ...before, kind: 'text' } });
    });
    expect(store.getAnnotation('comment-1')?.range).toEqual(after);

    editor.update((tx) => tx.history.undo());
    expect(store.getAnnotation('comment-1')?.range).toEqual(before);

    editor.update((tx) => tx.history.redo());
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
    const store = createPliteAnnotationStore(editor, [
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
    const store = createPliteAnnotationStore(editor, () => annotations);

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
    const annotation = (label: string): PliteAnnotation<CommentData> => ({
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
    const store = createPliteAnnotationStore(editor, [
      { anchor, id: 'comment-1' },
    ]);
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
    let annotations: ReadonlyArray<PliteAnnotation<CommentData>> = [
      { anchor: firstAnchor, data: { label: 'one' }, id: 'one' },
      { anchor: secondAnchor, data: { label: 'two' }, id: 'two' },
    ];
    const store = createPliteAnnotationStore(editor, () => annotations);
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
    const store = createPliteAnnotationStore(editor, [
      {
        anchor: {
          release() {
            return null;
          },
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
    let annotations: readonly PliteAnnotation[] = [first, second];
    const store = createPliteAnnotationStore(editor, () => annotations);
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
    const store = createPliteAnnotationStore(editor, () => [
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
    const store = createPliteAnnotationStore(editor, [
      { anchor, id: 'comment-1' },
    ]);
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

  test('non-JSON data uses reference equality', () => {
    const editor = createEditor({ initialValue: createChildren() });
    const anchor = createRangeAnchor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const payload = new Map([['count', 1]]);
    let data = { label: 'one', payload };
    const store = createPliteAnnotationStore(editor, () => [
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
    const store = createPliteAnnotationStore(editor, () => [
      { anchor, data: { label }, id: 'comment-1' },
    ]);
    const baseline = store.getMetrics();

    store.subscribe(() => {});
    store.subscribeAnnotation('comment-1', () => {});
    label = 'after';
    store.refresh({ ids: ['comment-1'] });

    expect(store.getMetrics()).toMatchObject({
      annotationSubscriberWakeCount: baseline.annotationSubscriberWakeCount + 2,
      changedAnnotationCount: baseline.changedAnnotationCount + 1,
      recomputeCount: baseline.recomputeCount + 1,
    });

    store.destroy();
    anchor.release();
  });
});
