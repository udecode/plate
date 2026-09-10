import { TextApi, createEditor, type NodeKey, RangeApi } from 'plitejs';

import { createPliteAnnotationStore } from '../../src/annotations';
import { getNodeKey, replace } from '../../src/internal';
import {
  createPliteDecorationManager,
  getDecorationPaintChange,
  getNativeMappedDecorationInsertion,
  type PliteDecoration,
  type PliteDecorationSource,
} from '../../src/react/decoration-source';

const createViewEditor = () => {
  const editor = createEditor();

  replace(editor, {
    children: [
      { children: [{ text: 'alpha' }], type: 'paragraph' },
      { children: [{ text: 'beta' }], type: 'paragraph' },
    ],
    selection: null,
  });

  return editor;
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test.each(['native-text-input', 'dom-text-input'])(
  'preserves queued document work when an independent source refreshes during %s',
  (tag) => {
    vi.useFakeTimers();
    const editor = createViewEditor();
    const reads: string[] = [];
    const refreshes = new Map<
      string,
      Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    >();
    const manager = createPliteDecorationManager(
      editor,
      ['syntax', 'selection'].map((id) => ({
        id,
        observe: ({ refresh }) => {
          refreshes.set(id, refresh);
          return () => {};
        },
        read: ({ entry: [node, path] }) => {
          if (!TextApi.isText(node) || id === 'selection') return [];
          reads.push(node.text);
          return [
            {
              attributes: { 'data-text': node.text },
              key: path.join(','),
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: node.text.length },
              },
            },
          ];
        },
      }))
    );
    const unmount = manager.mount();
    reads.length = 0;

    editor.update({ tags: tag }, (tx) =>
      tx.text.insert('X', { at: { path: [0, 0], offset: 3 } })
    );
    refreshes.get('selection')?.({ nodeKeys: 'all' });
    expect(reads).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(reads).toEqual(['alpXha']);
    expect(
      manager.getNodeSnapshot(editor.key([0, 0])!)[0].attributes['data-text']
    ).toBe('alpXha');

    editor.update({ tags: tag }, (tx) =>
      tx.text.insert('Y', { at: { path: [0, 0], offset: 4 } })
    );
    refreshes.get('syntax')?.({ nodeKeys: [editor.key([0, 0])!] });
    expect(reads).toEqual(['alpXha', 'alpXYha']);
    vi.advanceTimersByTime(300);
    expect(reads).toEqual(['alpXha', 'alpXYha']);
    unmount();
    manager.destroy();
  }
);

test('flushes older pending keys with a synchronous programmatic edit and refreshes after remount', () => {
  vi.useFakeTimers();
  const editor = createViewEditor();
  const manager = createPliteDecorationManager(editor, [
    {
      id: 'current-text',
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node)
          ? [
              {
                attributes: { 'data-text': node.text },
                key: path.join(','),
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: node.text.length },
                },
              },
            ]
          : [],
    },
  ]);
  const unmount = manager.mount();

  editor.update({ tags: 'native-text-input' }, (tx) =>
    tx.text.insert('X', { at: { path: [0, 0], offset: 3 } })
  );
  editor.update.text.insert('Y', { at: { path: [1, 0], offset: 2 } });
  expect(
    manager.getNodeSnapshot(editor.key([0, 0])!)[0].attributes['data-text']
  ).toBe('alpXha');
  expect(
    manager.getNodeSnapshot(editor.key([1, 0])!)[0].attributes['data-text']
  ).toBe('beYta');
  editor.update({ tags: 'native-text-input' }, (tx) =>
    tx.text.insert('Z', { at: { path: [0, 0], offset: 4 } })
  );
  unmount();
  const unmountAgain = manager.mount();

  expect(
    manager.getNodeSnapshot(editor.key([0, 0])!)[0].attributes['data-text']
  ).toBe('alpXZha');
  unmountAgain();
  manager.destroy();
  vi.advanceTimersByTime(300);
  expect(manager.getNodeSnapshot(editor.key([0, 0])!)).toEqual([]);
});

test('bounds pending input age when frames are delayed and ignores frames after teardown', () => {
  vi.useFakeTimers();
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextFrame += 1;
    frames.set(nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const editor = createViewEditor();
  const reads: string[] = [];
  const manager = createPliteDecorationManager(editor, [
    {
      id: 'deadline',
      read: ({ entry: [node] }) => {
        if (TextApi.isText(node)) reads.push(node.text);
        return [];
      },
    },
  ]);
  const unmount = manager.mount();
  reads.length = 0;

  for (let index = 0; index < 12; index++) {
    editor.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.insert('x', { at: { path: [0, 0], offset: 2 } })
    );
    vi.advanceTimersByTime(20);
  }
  expect(reads).toEqual([]);
  vi.advanceTimersByTime(10);
  expect(reads).toEqual([`al${'x'.repeat(12)}pha`]);
  editor.update({ tags: 'native-text-input' }, (tx) =>
    tx.text.insert('y', { at: { path: [0, 0], offset: 2 } })
  );
  const lateFrames = [...frames.values()];
  unmount();
  manager.destroy();
  lateFrames.forEach((callback) => callback(300));
  vi.advanceTimersByTime(500);
  expect(reads).toHaveLength(1);
  expect(frames.size).toBe(0);
});

test.each([true, false])(
  'coalesces a rapid input burst before reading sources with fast frames=%s',
  (withFrames) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'requestAnimationFrame',
      withFrames
        ? (callback: FrameRequestCallback) =>
            globalThis.setTimeout(() => callback(performance.now()), 2)
        : undefined
    );
    vi.stubGlobal('cancelAnimationFrame', globalThis.clearTimeout);
    const editor = createViewEditor();
    const reads: string[] = [];
    const manager = createPliteDecorationManager(editor, [
      {
        id: 'input-burst',
        read: ({ entry: [node, path] }) => {
          if (TextApi.isText(node) && path[0] === 0) reads.push(node.text);
          return [];
        },
      },
    ]);
    const unmount = manager.mount();
    reads.length = 0;
    for (let index = 0; index < 4; index++) {
      editor.update({ tags: 'dom-text-input' }, (tx) => {
        tx.text.insert(String(index + 1), {
          at: { path: [0, 0], offset: 2 + index },
        });
      });
      vi.advanceTimersByTime(30);
    }
    expect(reads).toEqual([]);
    vi.advanceTimersByTime(20);
    expect(reads).toEqual(['al1234pha']);
    vi.advanceTimersByTime(300);
    expect(reads).toEqual(['al1234pha']);
    unmount();
    manager.destroy();
  }
);

test('invalidates old source observers and discards an older reentrant read', () => {
  const editor = createViewEditor();
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | undefined;
  let editDuringRead = false;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'reentrant',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;
      return () => {};
    },
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node) || path[0] !== 0) return [];
      const { text } = node;
      if (editDuringRead) {
        editDuringRead = false;
        editor.update.text.insert('X', { at: { path, offset: 2 } });
      }
      return [
        {
          attributes: { 'data-text': text },
          key: 'text',
          range: {
            anchor: { path, offset: 0 },
            focus: { path, offset: text.length },
          },
        },
      ];
    },
  };
  const manager = createPliteDecorationManager(editor, [source]);
  const unmount = manager.mount();
  editDuringRead = true;
  refresh?.({ nodeKeys: [editor.key([0, 0])!] });
  expect(
    manager.getNodeSnapshot(editor.key([0, 0])!)[0].attributes['data-text']
  ).toBe('alXpha');
  const oldRefresh = refresh;
  manager.setSources([{ id: 'reentrant', read: () => [] }]);
  oldRefresh?.({ nodeKeys: 'all' });
  expect(manager.getNodeSnapshot(editor.key([0, 0])!)).toEqual([]);
  unmount();
  manager.destroy();
});

test('refreshes descendant text inputs for a parent property change without reading sibling text', () => {
  const editor = createViewEditor();
  const reads: string[] = [];
  const manager = createPliteDecorationManager(editor, [
    {
      id: 'parent-property',
      read: ({ entry: [node, path] }) => {
        if (!TextApi.isText(node)) return [];
        reads.push(node.text);
        const parent = editor.read.nodes.get(path.slice(0, -1))?.[0];
        const language =
          parent && 'language' in parent && typeof parent.language === 'string'
            ? parent.language
            : 'plain';
        return [
          {
            attributes: { 'data-language': language },
            key: path.join(','),
            range: {
              anchor: { path, offset: 0 },
              focus: { path, offset: node.text.length },
            },
          },
        ];
      },
    },
  ]);
  const unmount = manager.mount();
  reads.length = 0;
  editor.update.nodes.set({ language: 'javascript' }, { at: [0] });
  expect(reads).toEqual(['alpha']);
  expect(
    manager.getNodeSnapshot(editor.key([0, 0])!)[0].attributes['data-language']
  ).toBe('javascript');
  unmount();
  manager.destroy();
});

test('retains immutable compiled inputs while checking duplicate keys and current text bounds', () => {
  const editor = createViewEditor();
  const nodeKey = editor.key([0, 0])!;
  const path = Object.freeze([0, 0]);
  const stable = Object.freeze({
    attributes: Object.freeze({ className: 'stable' }),
    key: 'stable',
    range: Object.freeze({
      anchor: Object.freeze({ path, offset: 0 }),
      focus: Object.freeze({ path, offset: 3 }),
    }),
  });
  let revision = 0;
  let duplicate = false;
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | undefined;
  const errors: unknown[] = [];
  const manager = createPliteDecorationManager(
    editor,
    [
      {
        id: 'immutable',
        observe: ({ refresh: nextRefresh }) => {
          refresh = nextRefresh;
          return () => {};
        },
        read: ({ entry: [node, entryPath] }) =>
          TextApi.isText(node) && entryPath[0] === 0
            ? [
                stable,
                ...(duplicate
                  ? [stable]
                  : [
                      {
                        attributes: { 'data-revision': revision },
                        key: 'tail',
                        range: {
                          anchor: { path, offset: 3 },
                          focus: { path, offset: 5 },
                        },
                      },
                    ]),
              ]
            : [],
      },
    ],
    {
      onError: (error) => {
        errors.push(error);
      },
    }
  );
  const unmount = manager.mount();
  const before = manager.getNodeSnapshot(nodeKey);

  revision += 1;
  refresh?.({ nodeKeys: [nodeKey] });
  const after = manager.getNodeSnapshot(nodeKey);

  expect(after).not.toBe(before);
  expect(after[0]).toBe(before[0]);
  expect(getDecorationPaintChange(before, after)).toEqual({ start: 3, end: 5 });
  duplicate = true;
  refresh?.({ nodeKeys: [nodeKey] });
  expect(errors).toHaveLength(1);
  duplicate = false;
  refresh?.({ nodeKeys: [nodeKey] });
  editor.update.text.delete({
    at: { anchor: { path, offset: 1 }, focus: { path, offset: 5 } },
  });
  expect(manager.getNodeSnapshot(nodeKey)).toEqual([]);

  unmount();
  manager.destroy();
});

test.each(['getter', 'inherited', 'mutable-path'] as const)(
  'snapshots mutable decoration inputs without trusting a frozen %s shell',
  (kind) => {
    const editor = createViewEditor();
    const nodeKey = editor.key([0, 0])!;
    const path = [0, 0];
    const inherited = { offset: 3 };
    let className = 'before';
    const attributes =
      kind === 'getter'
        ? Object.freeze({
            get className() {
              return className;
            },
          })
        : Object.freeze({ className: 'match' });
    const decoration: PliteDecoration = Object.freeze({
      attributes,
      key: 'match',
      range: Object.freeze({
        anchor: Object.freeze({
          offset: 0,
          path: kind === 'mutable-path' ? path : Object.freeze([0, 0]),
        }),
        focus:
          kind === 'inherited'
            ? Object.freeze(
                Object.assign(Object.create(inherited), {
                  path: Object.freeze([0, 0]),
                })
              )
            : Object.freeze({
                offset: 3,
                path: kind === 'mutable-path' ? path : Object.freeze([0, 0]),
              }),
      }),
    });
    let refresh:
      | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
      | undefined;
    const manager = createPliteDecorationManager(editor, [
      {
        id: 'mutable',
        observe: ({ refresh: nextRefresh }) => {
          refresh = nextRefresh;
          return () => {};
        },
        read: ({ entry: [node, entryPath] }) =>
          TextApi.isText(node) && entryPath[0] === 0 ? [decoration] : [],
      },
    ]);
    const unmount = manager.mount();
    const before = manager.getNodeSnapshot(nodeKey);

    className = 'after';
    inherited.offset = 4;
    path[0] = 1;
    expect(before[0].attributes.className).toBe(
      kind === 'getter' ? 'before' : 'match'
    );
    refresh?.({ nodeKeys: [nodeKey] });
    const after = manager.getNodeSnapshot(nodeKey);

    if (kind === 'getter') expect(after[0].attributes.className).toBe('after');
    else if (kind === 'inherited') expect(after[0].end).toBe(4);
    else {
      expect(after).toEqual([]);
      expect(manager.getNodeSnapshot(editor.key([1, 0])!)[0].end).toBe(3);
    }
    unmount();
    manager.destroy();
  }
);

test('reads mapped annotations once per editor commit without observer duplication', () => {
  const editor = createViewEditor();
  const textKey = getNodeKey(editor, [0, 0])!;
  const anchor = editor.anchor(
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    },
    { association: 'inward', deletion: 'drop' }
  );
  const annotations = createPliteAnnotationStore(editor, [
    { anchor, id: 'comment-1' },
  ]);
  let observerRefreshes = 0;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'comments',
    observe: ({ refresh }) =>
      annotations.subscribeChanges(({ nodeKeys, reason }) => {
        if (reason === 'editor') return;

        observerRefreshes += 1;
        refresh({ nodeKeys });
      }),
    read: ({ editor: sourceEditor, entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];

      const nodeKey = sourceEditor.key(path);
      if (!nodeKey) return [];

      const textRange = {
        anchor: { path, offset: 0 },
        focus: { path, offset: node.text.length },
      };

      return annotations.getAnnotationsAt(nodeKey).flatMap((annotation) => {
        const range = annotation.range
          ? RangeApi.intersection(annotation.range, textRange)
          : null;

        return range
          ? [
              {
                attributes: { 'data-comment-id': annotation.id },
                key: `${annotation.id}:${nodeKey}`,
                range,
              },
            ]
          : [];
      });
    },
  };
  const manager = createPliteDecorationManager(editor, [source]);
  const unmount = manager.mount();
  const baselineReads = manager.getMetrics().sourceReadCount;
  let wakes = 0;
  const unsubscribe = manager.subscribeNodeKey(textKey, () => {
    wakes += 1;
  });

  editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });

  expect(annotations.getAnnotation('comment-1')?.range).toEqual({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 5 },
  });
  expect(manager.getNodeSnapshot(textKey)).toEqual([
    {
      attributes: { 'data-comment-id': 'comment-1' },
      end: 5,
      key: `comment-1:${textKey}`,
      start: 2,
    },
  ]);
  expect(manager.getMetrics().sourceReadCount - baselineReads).toBe(2);
  expect(observerRefreshes).toBe(0);
  expect(wakes).toBe(1);

  unsubscribe();
  unmount();
  manager.destroy();
  annotations.destroy();
  anchor.release();
});

test('compiles sources once and refreshes one merged node bucket', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  const secondKey = getNodeKey(editor, [1, 0])!;
  const observers = new Set<
    (input: { nodeKeys: 'all' | readonly NodeKey[] }) => void
  >();
  let revision = 0;
  let reads = 0;
  let cleanups = 0;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'search',
    observe: ({ refresh }) => {
      observers.add(refresh);

      return () => {
        cleanups += 1;
        observers.delete(refresh);
      };
    },
    read: ({ entry: [node, path] }) => {
      reads += 1;

      if (!TextApi.isText(node) || path[0] !== 0) return [];

      return [
        {
          attributes: {
            className: 'match',
            'data-revision': revision,
          },
          key: 'match:alpha',
          range: {
            anchor: { offset: 0, path },
            focus: { offset: node.text.length, path },
          },
        },
      ];
    },
  };
  const manager = createPliteDecorationManager(editor, [source]);
  const unmount = manager.mount();

  expect(observers.size).toBe(1);
  expect(manager.getNodeSnapshot(firstKey)).toEqual([
    {
      attributes: {
        className: 'match',
        'data-revision': 0,
      },
      end: 5,
      key: 'match:alpha',
      start: 0,
    },
  ]);
  expect(manager.getNodeSnapshot(secondKey)).toEqual([]);

  const initialReads = reads;
  const firstBucket = manager.getNodeSnapshot(firstKey);
  const secondBucket = manager.getNodeSnapshot(secondKey);
  let firstWakes = 0;
  let secondWakes = 0;
  const unsubscribeFirst = manager.subscribeNodeKey(firstKey, () => {
    firstWakes += 1;
  });
  const unsubscribeSecond = manager.subscribeNodeKey(secondKey, () => {
    secondWakes += 1;
  });

  editor.update.selection.set({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
  expect(reads).toBe(initialReads);

  revision = 1;
  observers.forEach((refresh) => refresh({ nodeKeys: [firstKey] }));

  expect(reads - initialReads).toBe(1);
  expect(firstWakes).toBe(1);
  expect(secondWakes).toBe(0);
  expect(manager.getNodeSnapshot(firstKey)).not.toBe(firstBucket);
  expect(manager.getNodeSnapshot(secondKey)).toBe(secondBucket);
  expect(manager.getMetrics()).toMatchObject({
    bucketReadCount: 6,
    changedBucketCount: 2,
    downstreamNodeSubscriptionCount: 2,
    sourceCount: 1,
    sourceObserverCount: 1,
    sourceReadCount: initialReads + 1,
    wakeCount: 1,
  });

  unsubscribeFirst();
  unsubscribeSecond();
  unmount();
  manager.destroy();

  expect(observers.size).toBe(0);
  expect(cleanups).toBe(1);
});

test('wakes one shared listener once for a multi-bucket publication', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  const secondKey = getNodeKey(editor, [1, 0])!;
  const refresh: {
    current: ((input: { nodeKeys: 'all' | readonly NodeKey[] }) => void) | null;
  } = { current: null };
  let revision = 0;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'shared-listener',
    observe: ({ refresh: nextRefresh }) => {
      refresh.current = nextRefresh;

      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              attributes: { 'data-revision': revision },
              key: `shared:${path[0]}`,
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: node.text.length },
              },
            },
          ]
        : [],
  };
  const manager = createPliteDecorationManager(editor, [source]);
  const unmount = manager.mount();
  const listener = vi.fn();
  const unsubscribeFirst = manager.subscribeNodeKey(firstKey, listener);
  const unsubscribeSecond = manager.subscribeNodeKey(secondKey, listener);

  revision = 1;
  refresh.current?.({ nodeKeys: [firstKey, secondKey] });

  expect(listener).toHaveBeenCalledOnce();
  expect(manager.getMetrics().wakeCount).toBe(1);

  unsubscribeFirst();
  unsubscribeSecond();
  unmount();
  manager.destroy();
});

test('rereads observed sources after subscribing on mount', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  let ready = false;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'late-ready',
    observe: () => () => {},
    read: ({ entry: [node, path] }) => {
      if (!ready || !TextApi.isText(node) || path[0] !== 0) return [];

      return [
        {
          attributes: { 'data-ready': true },
          key: 'late-ready:alpha',
          range: {
            anchor: { offset: 0, path },
            focus: { offset: node.text.length, path },
          },
        },
      ];
    },
  };
  const manager = createPliteDecorationManager(editor, [source]);

  ready = true;
  const unmount = manager.mount();

  expect(manager.getNodeSnapshot(firstKey)).toEqual([
    {
      attributes: { 'data-ready': true },
      end: 5,
      key: 'late-ready:alpha',
      start: 0,
    },
  ]);

  unmount();
  manager.destroy();
});

test('maps native insertions immediately and revalidates the source after input settles', () => {
  vi.useFakeTimers();
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  let reads = 0;
  const manager = createPliteDecorationManager(editor, [
    {
      id: 'native-map',
      read: ({ entry: [node, path] }) => {
        reads += 1;
        if (!TextApi.isText(node) || path[0] !== 0) return [];

        return [
          {
            attributes: { 'data-token': 'before' },
            key: 'before',
            range: {
              anchor: { offset: 0, path },
              focus: { offset: 2, path },
            },
          },
          {
            attributes: { 'data-token': 'after' },
            key: 'after',
            range: {
              anchor: { offset: node.text.length - 2, path },
              focus: { offset: node.text.length, path },
            },
          },
        ];
      },
    },
  ]);
  const unmount = manager.mount();
  const readsBeforeInput = reads;
  const before = manager.getNodeSnapshot(firstKey);
  let wakes = 0;
  const unsubscribe = manager.subscribeNodeKey(firstKey, () => {
    wakes += 1;
  });

  editor.update({ tags: 'native-text-input' }, (tx) => {
    tx.text.insert('X', { at: { path: [0, 0], offset: 3 } });
  });

  expect(reads).toBe(readsBeforeInput);
  const mapped = manager.getNodeSnapshot(firstKey);

  expect(mapped).toEqual([
    expect.objectContaining({ end: 2, key: 'before', start: 0 }),
    expect.objectContaining({ end: 6, key: 'after', start: 4 }),
  ]);
  expect(getNativeMappedDecorationInsertion(before, mapped)).toEqual({
    length: 1,
    offset: 3,
  });
  expect(wakes).toBe(1);

  vi.advanceTimersByTime(120);

  expect(reads).toBeGreaterThan(readsBeforeInput);
  expect(manager.getNodeSnapshot(firstKey)).toEqual([
    expect.objectContaining({ end: 2, key: 'before', start: 0 }),
    expect.objectContaining({ end: 6, key: 'after', start: 4 }),
  ]);
  expect(wakes).toBe(1);

  unsubscribe();
  unmount();
  manager.destroy();
  vi.useRealTimers();
});

test('rejects duplicate source ids before observation', () => {
  const editor = createViewEditor();
  const source: PliteDecorationSource<typeof editor> = {
    id: 'duplicate',
    read: () => [],
  };

  expect(() => createPliteDecorationManager(editor, [source, source])).toThrow(
    'Duplicate Plite decoration source id "duplicate".'
  );
});

test('isolates an observer that does not return cleanup', () => {
  const editor = createViewEditor();
  const failures: Array<{ cause: unknown }> = [];
  const manager = createPliteDecorationManager(
    editor,
    [
      {
        id: 'invalid-observer',
        observe: (() => undefined) as never,
        read: () => [],
      },
    ],
    { onError: (error) => failures.push(error) }
  );
  const unmount = manager.mount();

  expect(failures).toHaveLength(1);
  expect(String(failures[0].cause)).toContain(
    'observe must return a cleanup function'
  );
  expect(manager.getMetrics()).toMatchObject({
    failureCount: 1,
    sourceObserverCount: 0,
  });

  unmount();
  manager.destroy();
});

test('keeps the last valid buckets when an incremental source read fails', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  const refresh: {
    current: ((input: { nodeKeys: readonly NodeKey[] }) => void) | null;
  } = { current: null };
  let fail = false;
  let revision = 0;
  const failures: unknown[] = [];
  const source: PliteDecorationSource<typeof editor> = {
    id: 'recoverable',
    observe: ({ refresh: nextRefresh }) => {
      refresh.current = nextRefresh;

      return () => {};
    },
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node) || path[0] !== 0) return [];
      if (fail) throw new Error('failed refresh');

      return [
        {
          attributes: { 'data-revision': revision },
          key: 'recoverable:alpha',
          range: {
            anchor: { offset: 0, path },
            focus: { offset: node.text.length, path },
          },
        },
      ];
    },
  };
  const manager = createPliteDecorationManager(editor, [source], {
    onError: (error) => failures.push(error),
  });
  const unmount = manager.mount();
  const before = manager.getNodeSnapshot(firstKey);
  let wakes = 0;
  const unsubscribe = manager.subscribeNodeKey(firstKey, () => {
    wakes += 1;
  });

  fail = true;
  refresh.current?.({ nodeKeys: [firstKey] });
  expect(manager.getNodeSnapshot(firstKey)).toBe(before);
  expect(wakes).toBe(0);
  expect(failures).toHaveLength(1);

  fail = false;
  revision = 1;
  refresh.current?.({ nodeKeys: [firstKey] });
  expect(manager.getNodeSnapshot(firstKey)).toEqual([
    expect.objectContaining({ attributes: { 'data-revision': 1 } }),
  ]);
  expect(wakes).toBe(1);
  expect(manager.getMetrics().failureCount).toBe(1);

  unsubscribe();
  unmount();
  manager.destroy();
});

test('drops empty and out-of-bounds ranges without dropping valid output', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  const manager = createPliteDecorationManager(editor, [
    {
      id: 'validated-ranges',
      read: ({ entry: [node, path] }) => {
        if (!TextApi.isText(node) || path[0] !== 0) return [];

        return [
          {
            attributes: { 'data-valid': true },
            key: 'valid',
            range: {
              anchor: { offset: 0, path },
              focus: { offset: node.text.length, path },
            },
          },
          {
            attributes: {},
            key: 'empty',
            range: {
              anchor: { offset: 1, path },
              focus: { offset: 1, path },
            },
          },
          {
            attributes: {},
            key: 'outside',
            range: {
              anchor: { offset: 0, path },
              focus: { offset: node.text.length + 1, path },
            },
          },
        ];
      },
    },
  ]);

  expect(manager.getNodeSnapshot(firstKey)).toEqual([
    expect.objectContaining({ key: 'valid' }),
  ]);
  expect(manager.getMetrics().invalidRangeDropCount).toBe(2);
  manager.destroy();
});

test('isolates a source that returns unsupported DOM attributes', () => {
  const editor = createViewEditor();
  const firstKey = getNodeKey(editor, [0, 0])!;
  const failures: Array<{ cause: unknown }> = [];
  const manager = createPliteDecorationManager(
    editor,
    [
      {
        id: 'invalid-attributes',
        read: ({ entry: [node, path] }) =>
          TextApi.isText(node) && path[0] === 0
            ? [
                {
                  attributes: { onClick: 'not allowed' } as never,
                  key: 'invalid-attributes',
                  range: {
                    anchor: { offset: 0, path },
                    focus: { offset: node.text.length, path },
                  },
                },
              ]
            : [],
      },
    ],
    { onError: (error) => failures.push(error) }
  );

  expect(manager.getNodeSnapshot(firstKey)).toEqual([]);
  expect(manager.getMetrics().failureCount).toBe(1);
  expect(String(failures[0]?.cause)).toContain(
    'Unsupported Decoration attribute "onClick".'
  );
  manager.destroy();
});
