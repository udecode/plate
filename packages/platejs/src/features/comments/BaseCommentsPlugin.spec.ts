import { createEditor, defineBasePlugin, type Range } from '../../core';
import { BaseCommentsPlugin, type CommentThread } from './BaseCommentsPlugin';

const range: Range = {
  anchor: { path: [0, 0], offset: 1 },
  focus: { path: [0, 0], offset: 4 },
};
const thread = (id = 'thread'): CommentThread => ({
  createdAt: '2026-09-09T12:00:00.000Z',
  excerpt: 'lph',
  id,
  messages: [
    {
      body: [{ type: 'paragraph', children: [{ text: 'A comment' }] }],
      createdAt: '2026-09-09T12:00:00.000Z',
      id: `${id}-message`,
      userId: 'alice',
    },
  ],
  resolved: false,
  status: 'published',
  target: { type: 'range', range },
  userId: 'alice',
});

describe('Comments records', () => {
  it('rejects invalid initial records while constructing the editor', () => {
    expect(() =>
      createEditor({
        plugins: [
          BaseCommentsPlugin.configure({
            initialState: { initialThreads: [thread(), thread()] },
          }),
        ],
        initialValue: [
          { type: 'paragraph', children: [{ text: 'Alpha Beta' }] },
        ],
      })
    ).toThrow('Duplicate comment thread ID: thread');
  });

  it('loads fetched records and saves current ranges through edits and history', () => {
    const fetched = JSON.parse(JSON.stringify([thread()]));
    const editor = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: fetched, currentUserId: 'alice' },
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    expect(api.getThreads()).toEqual(fetched);
    expect(api.range('thread')).toEqual(range);
    const changes: string[] = [];
    api.subscribeThreads(({ reason }) => changes.push(reason));
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } })
    );
    const shifted = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    };
    expect(api.getThread('thread')?.target).toEqual({
      type: 'range',
      range: shifted,
    });
    expect(api.range('thread')).toEqual(shifted);
    editor.update((tx) => tx.history.undo());
    expect(api.getThread('thread')?.target).toEqual({ type: 'range', range });
    editor.update((tx) => tx.history.redo());
    expect(api.getThread('thread')?.target).toEqual({
      type: 'range',
      range: shifted,
    });
    expect(changes).toEqual(['document', 'document', 'document']);
    expect(
      api.edit('thread', 'thread-message', [
        { type: 'paragraph', children: [{ text: 'Edited' }] },
      ])
    ).toBe(true);
    const stored = JSON.parse(JSON.stringify(api.getThreads()));
    expect(stored).toEqual(api.getThreads());
    const reopened = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: stored },
        }),
      ],
      initialValue: editor.read.value(),
    });
    expect(reopened.plugin(BaseCommentsPlugin).api.range('thread')).toEqual(
      shifted
    );
  });

  it('rejects ranges outside the primary document without replacing records', () => {
    const editor = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: [thread()] },
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    const before = api.getThread('thread');
    expect(() =>
      api.setThreads([
        {
          ...thread(),
          target: {
            type: 'range',
            range: {
              anchor: { ...range.anchor, root: 'caption:1' },
              focus: { ...range.focus, root: 'caption:1' },
            },
          },
        },
      ])
    ).toThrow('Comment ranges must address the primary document');
    expect(api.getThread('thread')).toBe(before);
    expect(api.range('thread')).toEqual(range);
  });

  it('binds the same fetched records independently for each editor', () => {
    const records = [thread()];
    const plugin = BaseCommentsPlugin.configure({
      initialState: { initialThreads: records },
    });
    const first = createEditor({
      plugins: [plugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const second = createEditor({
      plugins: [plugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    first.update((tx) =>
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } })
    );
    expect(
      first.plugin(BaseCommentsPlugin).api.range('thread')?.anchor.offset
    ).toBe(2);
    expect(second.plugin(BaseCommentsPlugin).api.range('thread')).toEqual(
      range
    );
    first.plugin(BaseCommentsPlugin).api.setThreads([]);
    expect(second.plugin(BaseCommentsPlugin).api.getThreads()).toEqual(records);
    expect(records[0].target).toEqual({ type: 'range', range });
  });

  it('keeps metadata writes local and membership snapshots stable', async () => {
    const editor = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: {
            initialThreads: [thread('first'), thread('second')],
            currentUserId: 'alice',
          },
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    const initial = api.getSnapshot();
    const second = api.getThread('second');
    const firstChanged = mock();
    const secondChanged = mock();
    const membershipChanged = mock();
    const rangeChanged = mock();
    api.subscribeThread('first', firstChanged);
    api.subscribeThread('second', secondChanged);
    api.subscribeVisibleThreadIds(membershipChanged);
    api.subscribe(rangeChanged);
    await api.edit('first', 'first-message', [
      { type: 'paragraph', children: [{ text: 'Edited' }] },
    ]);
    expect(api.getSnapshot()).toBe(initial);
    expect(api.getThread('second')).toBe(second);
    expect(firstChanged).toHaveBeenCalledTimes(1);
    expect(secondChanged).not.toHaveBeenCalled();
    expect(membershipChanged).not.toHaveBeenCalled();
    expect(rangeChanged).not.toHaveBeenCalled();
  });

  it('rejects an invalid replacement without losing records or pending input', () => {
    const editor = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: [thread()], currentUserId: 'alice' },
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    api.begin(range);
    const snapshot = api.getSnapshot();
    expect(() => api.setThreads([thread('same'), thread('same')])).toThrow(
      'Duplicate comment thread ID: same'
    );
    expect(api.getSnapshot()).toBe(snapshot);
    expect(api.range('thread')).toEqual(range);
    expect(api.pendingRange()).toEqual(range);
    api.setThreads([]);
    expect(api.pendingRange()).toEqual(range);
    expect(
      api.create([{ type: 'paragraph', children: [{ text: 'New' }] }])
    ).toEqual(expect.any(String));
    expect(api.getSnapshot().pending).toBeNull();
    expect(api.getThreads()).toHaveLength(1);
  });

  it('retains deleted and resolved positions through undo without sharing live handles', () => {
    const editor = createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: [thread()], currentUserId: 'alice' },
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    api.resolve('thread');
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.delete({ at: { ...range, kind: 'text' } })
    );
    expect(api.getThread('thread')?.target).toEqual({
      type: 'range',
      range: { anchor: range.anchor, focus: range.anchor },
    });
    expect(api.getThread('thread')?.resolved).toBe(true);
    editor.update((tx) => tx.history.undo());
    expect(api.getThread('thread')?.target).toEqual({ type: 'range', range });
    expect(api.getThread('thread')?.resolved).toBe(true);
    api.resolve('thread', false);
    expect(api.idsAt(range)).toEqual(['thread']);
  });
});

it('owns loaded and returned nested records without leaking mutable aliases', () => {
  const input = structuredClone(thread());
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: [input] },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  const { api } = editor.plugin(BaseCommentsPlugin);
  const loaded = api.getThread('thread')!;
  input.messages[0].body[0].children[0].text = 'Changed outside';
  expect(loaded.messages[0].body[0].children[0]).toEqual({ text: 'A comment' });
  expect(
    Reflect.set(
      loaded.messages[0].body[0].children[0],
      'text',
      'Changed through read'
    )
  ).toBe(false);
  expect(Reflect.set(api.range('thread')!.anchor, 'offset', 9)).toBe(false);
  expect(api.range('thread')).toEqual(range);
  editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } });
  expect(Reflect.set(api.range('thread')!.anchor.path, '0', 99)).toBe(false);
  expect(api.getThread('thread')?.messages).toBe(loaded.messages);
  expect(api.getThreads()).toEqual(
    JSON.parse(JSON.stringify(api.getThreads()))
  );
});

it('keeps existing records and pending input intact when a new range is invalid', () => {
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: [thread()], currentUserId: 'alice' },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  const { api } = editor.plugin(BaseCommentsPlugin);
  api.begin(range);
  const current = api.getThread('thread');
  const { pending } = api.getSnapshot();
  const invalid = { anchor: { path: [0, 0], offset: 200 }, focus: range.focus };
  const changed = mock();
  api.subscribeThreads(changed);
  expect(() =>
    api.setThreads([{ ...thread(), target: { type: 'range', range: invalid } }])
  ).toThrow('Invalid comment range');
  expect(() =>
    api.createThread({
      body: thread().messages[0].body,
      target: { type: 'range', range: invalid },
    })
  ).toThrow('Invalid comment range');
  expect(api.getThread('thread')).toBe(current);
  expect(api.getSnapshot().pending).toBe(pending);
  expect(api.pendingRange()).toEqual(range);
  expect(changed).not.toHaveBeenCalled();
});

it('keeps invalid initial ranges unavailable instead of exposing an empty successful load', () => {
  const errors: unknown[] = [];
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: {
          initialThreads: [
            {
              ...thread(),
              target: {
                type: 'range',
                range: {
                  anchor: { path: [0, 0], offset: 200 },
                  focus: range.focus,
                },
              },
            },
          ],
        },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    lifecycleErrorSink: (error) => errors.push(error),
  });
  expect(errors).toHaveLength(1);
  expect(() => editor.plugin(BaseCommentsPlugin).api.getThreads()).toThrow(
    'Invalid comment range'
  );
  expect(() => editor.plugin(BaseCommentsPlugin).api.getThreads()).toThrow(
    'Invalid comment range'
  );
});

it('enforces message ownership, preserves rich replies, and publishes or discards drafts', async () => {
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { currentUserId: 'alice' },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  const { api, store } = editor.plugin(BaseCommentsPlugin);
  const body = [
    { type: 'paragraph', children: [{ bold: true, text: 'Rich body' }] },
  ];
  const id = await api.createThread({
    body,
    target: { type: 'suggestion', id: 'suggestion' },
    status: 'draft',
  });
  expect(id).not.toBeNull();
  const message = api.getThread(id!)!.messages[0];
  body[0].children[0].text = 'Changed input';
  expect(message.body[0].children[0]).toEqual({
    bold: true,
    text: 'Rich body',
  });
  const anchorChanges = mock();
  api.subscribe(anchorChanges);
  store.set({ currentUserId: 'bob' });
  expect(api.edit(id!, message.id, body)).toBe(false);
  expect(api.removeMessage(id!, message.id)).toBe(false);
  expect(api.removeThread(id!)).toBe(false);
  expect(api.resolve(id!)).toBe(false);
  expect(await api.reply(id!, body)).toBe(true);
  const reply = api.getThread(id!)!.messages[1];
  expect(reply.userId).toBe('bob');
  expect(api.edit(id!, reply.id, message.body)).toBe(true);
  expect(api.removeMessage(id!, reply.id)).toBe(true);
  expect(api.getThread(id!)!.messages).toEqual([message]);
  expect(api.publishDraft(id!)).toBe(true);
  expect(api.getSnapshot().draftThreadIds).toEqual([]);
  expect(api.discardDraft(id!)).toBe(false);
  store.set({ currentUserId: 'alice' });
  expect(api.resolve(id!)).toBe(true);
  expect(await api.reply(id!, body)).toBe(false);
  expect(api.resolve(id!, false)).toBe(true);
  expect(api.removeMessage(id!, message.id)).toBe(true);
  expect(api.getThread(id!)).toBeUndefined();
  expect(anchorChanges).not.toHaveBeenCalled();
  const draft = await api.createThread({
    body,
    target: { type: 'range', range },
    status: 'draft',
  });
  expect(api.discardDraft(draft!)).toBe(true);
  expect(api.range(draft!)).toBeNull();
});

it('retains a pending range through edits and invalid submissions, then creates or cancels it', async () => {
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { currentUserId: 'alice' },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  const { api, store } = editor.plugin(BaseCommentsPlugin);
  expect(api.begin({ anchor: range.anchor, focus: range.anchor })).toBe(true);
  expect(api.getSnapshot().pending?.excerpt).toBe('Alpha Beta');
  expect(
    await api.create([{ type: 'paragraph', children: [{ text: '  ' }] }])
  ).toBeNull();
  expect(api.getSnapshot().pending).not.toBeNull();
  editor.update.text.insert('XX ', { at: { path: [0, 0], offset: 0 } });
  expect(api.pendingRange()?.anchor.offset).toBe(3);
  const id = await api.create(thread().messages[0].body);
  expect(api.getSnapshot().pending).toBeNull();
  expect(editor.read.text.string(api.range(id!)!)).toBe('Alpha Beta');
  api.begin(range);
  store.set({ currentUserId: null });
  expect(await api.create(thread().messages[0].body)).toBeNull();
  expect(api.getSnapshot().pending).not.toBeNull();
  api.cancel();
  expect(api.pendingRange()).toBeNull();
  expect(api.getSnapshot().pending).toBeNull();
});

it('keeps mapped records current through block move, split and merge without a view', () => {
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: [thread()] },
      }),
    ],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Alpha' }] },
      { type: 'paragraph', children: [{ text: 'Beta' }] },
    ],
  });
  const { api } = editor.plugin(BaseCommentsPlugin);
  const changes = mock();
  api.subscribeThreads(changes);
  editor.update.nodes.move({ at: [0], to: [1] });
  expect(api.range('thread')!.anchor.path).toEqual([1, 0]);
  editor.update.nodes.split({
    at: { path: [1, 0], offset: 2 },
    match: (node) => 'children' in node,
  });
  expect(editor.read.text.string(api.range('thread')!)).toBe('lph');
  editor.update.nodes.merge({ at: [2] });
  expect(editor.read.text.string(api.range('thread')!)).toBe('lph');
  expect(
    changes.mock.calls.every(([change]) => change.ids.includes('thread'))
  ).toBe(true);
  expect(changes.mock.calls.length).toBeGreaterThanOrEqual(3);
});

it('exposes staged records to a dependent activation and binds ranges after publication', () => {
  let staged: readonly CommentThread[] | undefined;
  const Reader = defineBasePlugin('commentReader', {
    dependencies: [BaseCommentsPlugin],
  }).extend(({ editor }) => ({
    activate: () => {
      staged = editor.plugin(BaseCommentsPlugin).api.getThreads();
    },
  }));
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: [thread()] },
      }),
      Reader,
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  expect(staged).toEqual([thread()]);
  expect(editor.plugin(BaseCommentsPlugin).api.range('thread')).toEqual(range);
});

it('retires all comment records and pending ranges without retaining document observers for deleted threads', () => {
  const editor = createEditor({
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: [thread()] },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
  });
  const { api } = editor.plugin(BaseCommentsPlugin);
  api.begin(range);
  const changed = mock();
  api.subscribeThreads(changed);
  api.setThreads([]);
  api.cancel();
  expect(changed).toHaveBeenCalledTimes(1);
  changed.mockClear();
  expect(api.getThreads()).toEqual([]);
  expect(api.getSnapshot()).toEqual({
    threadIds: [],
    visibleThreadIds: [],
    draftThreadIds: [],
    pending: null,
  });
  expect(api.pendingRange()).toBeNull();
  expect(api.range('thread')).toBeNull();
  editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } });
  expect(changed).not.toHaveBeenCalled();
});

it('discards staged records when a dependent activation rolls back publication', () => {
  let read: () => readonly CommentThread[] = () => [];
  const Failure = defineBasePlugin('commentActivationFailure', {
    dependencies: [BaseCommentsPlugin],
  }).extend(({ editor }) => ({
    activate: () => {
      read = editor.plugin(BaseCommentsPlugin).api.getThreads;
      throw new Error('Activation rejected');
    },
  }));
  expect(() =>
    createEditor({
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialThreads: [thread()] },
        }),
        Failure,
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Alpha Beta' }] }],
    })
  ).toThrow('Activation rejected');
  expect(read()).toEqual([]);
});
