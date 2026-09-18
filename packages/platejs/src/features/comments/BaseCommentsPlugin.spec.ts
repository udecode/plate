import { DefaultAuthoredPlugin } from '../../authored';
import { createEditor, definePlugin, type Range } from '../../core';
import { createEditorView, defineRuntimePlugin } from '../../facade';
import {
  commentBody as body,
  commentRange as range,
  commentsFixture,
  commentThread as thread,
  commentValue as value,
} from './__tests__/commentsFixture';
import {
  BaseCommentsPlugin,
  type CommentMutationDecision,
  type CommentMutationRequest,
  type CommentsJSON,
  type CommentThread,
} from './BaseCommentsPlugin';

const setup = (
  initialComments: CommentsJSON | null = commentsFixture(),
  mutate?: (
    request: CommentMutationRequest
  ) => CommentMutationDecision | Promise<CommentMutationDecision>
) => {
  const editor = createEditor({
    initialValue: value,
    plugins: [
      BaseCommentsPlugin.configure({
        initialState: {
          initialComments,
          currentUserId: 'alice',
          ...(mutate && { mutate }),
        },
      }),
    ],
  });
  return { editor, ...editor.plugin(BaseCommentsPlugin) };
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

describe('Comments durable mutations', () => {
  it.each(['identity', 'target', 'status', 'message'] as const)(
    'rejects a canonical record with invalid %s without publication',
    async (field) => {
      const { api } = setup(undefined, ({ proposed }) => ({
        status: 'commit',
        thread: {
          ...proposed!,
          ...(field === 'identity' && { id: 'another-thread' }),
          ...(field === 'target' && {
            target: { type: 'change' as const, id: 'another-target' },
          }),
          ...(field === 'status' && { status: 'draft' as const }),
          ...(field === 'message' && {
            messages: [{ ...proposed!.messages[0], createdAt: 'not-a-date' }],
          }),
        },
      }));
      const before = api.getThread('thread');
      const changed = mock();
      api.subscribeThreads(changed);
      await expect(
        api.edit('thread', 'thread-message', body('Edited'))
      ).rejects.toThrow();
      expect(api.getThread('thread')).toBe(before);
      expect(api.attachment('thread')).toEqual({
        type: 'range',
        status: 'attached',
        range,
      });
      expect(changed).not.toHaveBeenCalled();
    }
  );

  it('publishes only the canonical adapter record after commit and supplies an opaque creation attachment', async () => {
    const gate = deferred<CommentMutationDecision>();
    const entered = deferred<CommentMutationRequest>();
    const { api } = setup(null, (request) => {
      entered.resolve(request);
      return gate.promise;
    });
    const changed = mock();
    api.subscribeThreads(changed);
    api.begin(range);
    const { pending } = api.getSnapshot();
    const result = api.create(body());
    const request = await entered.promise;
    expect(request).toMatchObject({
      mutationId: expect.any(String),
      operation: 'create',
      previous: null,
    });
    expect(request.attachment).toEqual(expect.any(Object));
    expect(api.getThreads()).toEqual([]);
    expect(api.getSnapshot().pending).toBe(pending);
    expect(changed).not.toHaveBeenCalled();
    const canonical = {
      ...request.proposed!,
      messages: [
        { ...request.proposed!.messages[0], body: body('Canonical text') },
      ],
    };
    gate.resolve({ status: 'commit', thread: canonical });
    expect(await result).toEqual({ status: 'applied', value: canonical.id });
    expect(api.getThread(canonical.id)).toEqual(canonical);
    expect(api.attachment(canonical.id)).toEqual({
      type: 'range',
      status: 'attached',
      range,
    });
    expect(api.getSnapshot().pending).toBeNull();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ ids: [canonical.id] });
  });

  it.each(['reject', 'throw'] as const)(
    'preserves records and composer on adapter %s for every durable action',
    async (failure) => {
      const requests: CommentMutationRequest[] = [];
      const error = new Error('Storage unavailable');
      const { api } = setup(undefined, (request) => {
        requests.push(request);
        if (failure === 'throw') throw error;
        return { status: 'reject', code: 'policy' };
      });
      const draft = api.createDraft({
        id: 'draft',
        body: body(),
        target: { type: 'range', range },
      })!;
      api.begin(range);
      const saved = api.toJSON();
      const records = api.getThreads();
      const { pending } = api.getSnapshot();
      const changed = mock();
      api.subscribeThreads(changed);
      const actions = [
        () => api.create(body()),
        () =>
          api.createThread({
            id: 'new',
            body: body(),
            target: { type: 'range', range },
          }),
        () => api.reply('thread', body('Reply')),
        () => api.edit('thread', 'thread-message', body('Edited')),
        () => api.resolve('thread'),
        () => api.removeMessage('thread', 'thread-message'),
        () => api.removeThread('thread'),
        () => api.publishDraft(draft),
      ];
      for (const action of actions) {
        if (failure === 'throw') await expect(action()).rejects.toBe(error);
        else {
          expect(await action()).toEqual({
            status: 'rejected',
            code: 'policy',
          });
        }
        expect(api.toJSON()).toEqual(saved);
        expect(api.getThreads()).toEqual(records);
        expect(api.getSnapshot().pending).toBe(pending);
        expect(api.pendingRange()).toEqual(range);
      }
      expect(requests).toHaveLength(actions.length);
      expect(new Set(requests.map(({ mutationId }) => mutationId)).size).toBe(
        actions.length
      );
      expect(changed).not.toHaveBeenCalled();
      const resolved = {
        ...thread(),
        resolution: { resolvedAt: null, userId: null },
      };
      const reopened = setup(
        commentsFixture([{ thread: resolved, range }]),
        () => {
          if (failure === 'throw') throw error;
          return { status: 'reject', code: 'policy' };
        }
      );
      if (failure === 'throw') {
        await expect(reopened.api.reopen('thread')).rejects.toBe(error);
      } else {
        expect(await reopened.api.reopen('thread')).toEqual({
          status: 'rejected',
          code: 'policy',
        });
      }
      expect(reopened.api.getThread('thread')).toEqual(resolved);
    }
  );

  it('queues a thread from canonical committed state while other threads progress independently', async () => {
    const first = deferred<CommentMutationDecision>();
    const entered = deferred<CommentMutationRequest>();
    const requests: CommentMutationRequest[] = [];
    const { api } = setup(
      commentsFixture([
        { thread: thread('first'), range },
        { thread: thread('second'), range },
      ]),
      (request) => {
        requests.push(request);
        if (requests.length === 1) {
          entered.resolve(request);
          return first.promise;
        }
        return { status: 'commit', thread: request.proposed };
      }
    );
    const reply = api.reply('first', body('Reply'));
    const request = await entered.promise;
    const resolution = api.resolve('first');
    expect(
      await api.edit('second', 'second-message', body('Independent'))
    ).toEqual({ status: 'applied', value: undefined });
    expect(requests.map(({ operation }) => operation)).toEqual([
      'reply',
      'edit',
    ]);
    expect(api.getThread('first')).toEqual(thread('first'));
    const canonical = {
      ...request.proposed!,
      messages: request.proposed!.messages.map((message, index) =>
        index === 1 ? { ...message, body: body('Canonical reply') } : message
      ),
    };
    first.resolve({ status: 'commit', thread: canonical });
    expect(await reply).toEqual({ status: 'applied', value: undefined });
    expect(await resolution).toEqual({ status: 'applied', value: undefined });
    expect(requests[2].previous).toEqual(canonical);
    expect(requests[2].proposed?.messages).toEqual(canonical.messages);
    expect(api.getThread('first')?.messages).toEqual(canonical.messages);
    expect(api.getThread('first')?.resolution?.userId).toBe('alice');
  });

  it.each(['reject', 'throw'] as const)(
    'continues a queued action from unchanged state after adapter %s',
    async (failure) => {
      const gate = deferred<CommentMutationDecision>();
      const entered = deferred<CommentMutationRequest>();
      const requests: CommentMutationRequest[] = [];
      const { api } = setup(undefined, (request) => {
        requests.push(request);
        if (requests.length === 1) {
          entered.resolve(request);
          return gate.promise;
        }
        return { status: 'commit', thread: request.proposed };
      });
      const storageError = new Error('Storage unavailable');
      const failed = api
        .reply('thread', body('Uncommitted'))
        .catch((error: unknown) => error);
      await entered.promise;
      const succeeding = api.edit(
        'thread',
        'thread-message',
        body('Committed')
      );
      if (failure === 'throw') gate.reject(storageError);
      else gate.resolve({ status: 'reject' });
      expect(await failed).toEqual(
        failure === 'throw' ? storageError : { status: 'rejected' }
      );
      expect(await succeeding).toEqual({ status: 'applied', value: undefined });
      expect(requests[1].previous).toEqual(thread());
      expect(
        api.getThread('thread')?.messages.map((message) => message.body)
      ).toEqual([body('Committed')]);
    }
  );

  it('retires pending and queued draft mutations on discard', async () => {
    const gate = deferred<CommentMutationDecision>();
    const entered = deferred<CommentMutationRequest>();
    const mutate = mock((request: CommentMutationRequest) => {
      entered.resolve(request);
      return gate.promise;
    });
    const { api } = setup(null, mutate);
    const id = api.createDraft({
      id: 'draft',
      body: body(),
      target: { type: 'range', range },
    })!;
    const publish = api.publishDraft(id);
    const request = await entered.promise;
    const reply = api.reply(id, body('Late reply'));
    expect(api.discardDraft(id)).toBe(true);
    gate.resolve({ status: 'commit', thread: request.proposed });
    expect(await publish).toEqual({ status: 'stale' });
    expect(await reply).toEqual({ status: 'stale' });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(api.getThreads()).toEqual([]);
    expect(api.attachment(id)).toBeNull();
  });

  it('retires pending and queued mutations when the Comments plugin is disabled', async () => {
    const gate = deferred<CommentMutationDecision>();
    const entered = deferred<CommentMutationRequest>();
    const mutate = mock((request: CommentMutationRequest) => {
      entered.resolve(request);
      return gate.promise;
    });
    const { editor, api } = setup(undefined, mutate);
    const reply = api.reply('thread', body('Late reply'));
    const request = await entered.promise;
    const resolve = api.resolve('thread');
    editor.install(defineRuntimePlugin('comments', { enabled: false }));
    gate.resolve({ status: 'commit', thread: request.proposed });
    expect(await reply).toEqual({ status: 'stale' });
    expect(await resolve).toEqual({ status: 'stale' });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(api.getThreads()).toEqual([]);
    expect(api.attachment('thread')).toBeNull();
  });

  it('leaves authorization to adapter policy and preserves rich replies', async () => {
    const requests: CommentMutationRequest[] = [];
    let allowed = false;
    const { api, store } = setup(undefined, (request) => {
      requests.push(request);
      return allowed
        ? { status: 'commit', thread: request.proposed }
        : { status: 'reject', code: 'forbidden' };
    });
    store.set({ currentUserId: 'bob' });
    expect(await api.edit('thread', 'thread-message', body('Denied'))).toEqual({
      status: 'rejected',
      code: 'forbidden',
    });
    expect(requests).toHaveLength(1);
    expect(api.getThread('thread')).toEqual(thread());
    allowed = true;
    expect(
      await api.edit('thread', 'thread-message', body('Moderator edit'))
    ).toEqual({ status: 'applied', value: undefined });
    const richBody = [
      { type: 'paragraph', children: [{ bold: true, text: 'Rich reply' }] },
    ];
    await api.reply('thread', richBody);
    richBody[0].children[0].text = 'Changed input';
    const reply = api.getThread('thread')!.messages[1];
    expect(reply.userId).toBe('bob');
    expect(reply.body[0].children[0]).toEqual({
      bold: true,
      text: 'Rich reply',
    });
    expect(await api.resolve('thread')).toEqual({
      status: 'applied',
      value: undefined,
    });
    expect(api.getThread('thread')?.resolution).toEqual({
      userId: 'bob',
      resolvedAt: expect.any(String),
    });
    expect(await api.reply('thread', body())).toEqual({ status: 'invalid' });
    expect(await api.reopen('thread')).toEqual({
      status: 'applied',
      value: undefined,
    });
    expect(await api.removeMessage('thread', 'thread-message')).toEqual({
      status: 'applied',
      value: undefined,
    });
    expect(api.getThread('thread')?.messages).toEqual([reply]);
    expect(await api.removeThread('thread')).toEqual({
      status: 'applied',
      value: undefined,
    });
    expect(api.getThreads()).toEqual([]);
  });

  it('creates published change threads and synchronously creates or discards local drafts', async () => {
    const mutate = mock(
      (request: CommentMutationRequest): CommentMutationDecision => ({
        status: 'commit',
        thread: request.proposed,
      })
    );
    const { api } = setup(null, mutate);
    expect(
      await api.createThread({
        id: 'change-thread',
        body: body(),
        target: { type: 'change', id: 'suggestion' },
      })
    ).toEqual({ status: 'applied', value: 'change-thread' });
    expect(api.getThread('change-thread')?.status).toBe('published');
    expect(api.attachment('change-thread')).toEqual({
      type: 'change',
      id: 'suggestion',
    });
    expect(api.toJSON().ranges).toEqual([]);
    mutate.mockClear();
    const id = api.createDraft({
      id: 'draft',
      body: body(),
      target: { type: 'range', range },
    });
    expect(id).toBe('draft');
    expect(api.getSnapshot().draftThreadIds).toEqual(['draft']);
    expect(api.toJSON().threads.map((record) => record.id)).toEqual([
      'change-thread',
    ]);
    expect(api.toJSON().ranges).toEqual([]);
    expect(api.discardDraft('draft')).toBe(true);
    expect(api.discardDraft('draft')).toBe(false);
    expect(api.attachment('draft')).toBeNull();
    expect(mutate).not.toHaveBeenCalled();
    api.createDraft({
      id: 'published-draft',
      body: body(),
      target: { type: 'range', range },
    });
    expect(await api.publishDraft('published-draft')).toEqual({
      status: 'applied',
      value: undefined,
    });
    expect(api.getThread('published-draft')?.status).toBe('published');
    expect(api.discardDraft('published-draft')).toBe(false);
  });
});

describe('Comments local input and lifecycle', () => {
  it.each([
    [
      'outside document',
      { anchor: { path: [0, 0], offset: 200 }, focus: range.focus },
    ],
    [
      'non-primary root',
      {
        anchor: { ...range.anchor, root: 'caption:1' },
        focus: { ...range.focus, root: 'caption:1' },
      },
    ],
  ] satisfies Array<[string, Range]>)(
    'rejects %s creation without losing records or pending input',
    async (_name, invalid) => {
      const mutate = mock(
        (request: CommentMutationRequest): CommentMutationDecision => ({
          status: 'commit',
          thread: request.proposed,
        })
      );
      const { api } = setup(undefined, mutate);
      api.begin(range);
      const current = api.getThread('thread');
      const { pending } = api.getSnapshot();
      await expect(
        api.createThread({
          body: body(),
          target: { type: 'range', range: invalid },
        })
      ).rejects.toThrow();
      expect(() =>
        api.createDraft({
          body: body(),
          target: { type: 'range', range: invalid },
        })
      ).toThrow();
      expect(api.getThread('thread')).toBe(current);
      expect(api.getSnapshot().pending).toBe(pending);
      expect(api.pendingRange()).toEqual(range);
      expect(mutate).not.toHaveBeenCalled();
    }
  );

  it('rejects collapsed creation without expanding it to a block', async () => {
    const { api } = setup();
    const input = {
      body: body(),
      target: {
        type: 'range' as const,
        range: { anchor: range.anchor, focus: range.anchor },
      },
    };
    expect(await api.createThread(input)).toEqual({ status: 'invalid' });
    expect(api.createDraft(input)).toBeNull();
    expect(api.getThreads()).toEqual([thread()]);
  });

  it('retains a pending range through edits and invalid submissions, then creates or cancels it', async () => {
    const { editor, api, store } = setup(null);
    expect(api.begin({ anchor: range.anchor, focus: range.anchor })).toBe(true);
    expect(api.getSnapshot().pending?.excerpt).toBe('Alpha Beta');
    expect(await api.create(body('  '))).toEqual({ status: 'invalid' });
    expect(api.getSnapshot().pending).not.toBeNull();
    editor.update.text.insert('XX ', { at: { path: [0, 0], offset: 0 } });
    expect(api.pendingRange()?.anchor.offset).toBe(3);
    const result = await api.create(body());
    expect(result).toEqual({ status: 'applied', value: expect.any(String) });
    if (result.status !== 'applied') {
      throw new Error('Expected created comment');
    }
    expect(api.getSnapshot().pending).toBeNull();
    const attachment = api.attachment(result.value);
    if (attachment?.type !== 'range' || attachment.status !== 'attached') {
      throw new Error('Expected attached range');
    }
    expect(editor.read.text.string(attachment.range)).toBe('Alpha Beta');
    api.begin(range);
    store.set({ currentUserId: null });
    expect(await api.create(body())).toEqual({ status: 'invalid' });
    expect(api.getSnapshot().pending).not.toBeNull();
    api.cancel();
    expect(api.pendingRange()).toBeNull();
    expect(api.getSnapshot().pending).toBeNull();
  });

  it('exposes staged records to dependent activation and restores attachments before construction returns', () => {
    let staged: readonly CommentThread[] | undefined;
    const Reader = definePlugin('commentReader', {
      dependencies: [BaseCommentsPlugin],
    }).extend(({ editor }) => ({
      activate: () => {
        staged = editor.plugin(BaseCommentsPlugin).api.getThreads();
      },
    }));
    const editor = createEditor({
      initialValue: value,
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialComments: commentsFixture() },
        }),
        Reader,
      ],
    });
    expect(staged).toEqual([thread()]);
    expect(editor.plugin(BaseCommentsPlugin).api.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range,
    });
  });

  it('discards staged records when a dependent activation rolls back publication', () => {
    let read: () => readonly CommentThread[] = () => [];
    const Failure = definePlugin('commentActivationFailure', {
      dependencies: [BaseCommentsPlugin],
    }).extend(({ editor }) => ({
      activate: () => {
        read = editor.plugin(BaseCommentsPlugin).api.getThreads;
        throw new Error('Activation rejected');
      },
    }));
    expect(() =>
      createEditor({
        initialValue: value,
        plugins: [
          BaseCommentsPlugin.configure({
            initialState: { initialComments: commentsFixture() },
          }),
          Failure,
        ],
      })
    ).toThrow('Activation rejected');
    expect(read()).toEqual([]);
  });
});

describe('Comments persistence', () => {
  it.each(['cycle', 'nonfinite', 'nonplain'] as const)(
    'rejects %s data nested in saved rich messages',
    (kind) => {
      const saved = structuredClone(commentsFixture());
      Object.assign(saved.threads[0].messages[0].body[0], {
        metadata:
          kind === 'cycle'
            ? saved
            : kind === 'nonfinite'
              ? Infinity
              : new Date(),
      });
      expect(() => setup(saved)).toThrow();
    }
  );

  it('rejects accessor data without running application getters', () => {
    const saved = structuredClone(commentsFixture());
    const getter = mock(() => 'A comment');
    Object.defineProperty(
      saved.threads[0].messages[0].body[0].children[0],
      'text',
      {
        enumerable: true,
        get: getter,
      }
    );
    expect(() => setup(saved)).toThrow();
    expect(getter).not.toHaveBeenCalled();
  });

  it('saves mapped attachments and latest conversations, then reloads with empty undo', async () => {
    const { editor, api } = setup();
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } })
    );
    expect(await api.edit('thread', 'thread-message', body('Edited'))).toEqual({
      status: 'applied',
      value: undefined,
    });
    const stored = JSON.parse(JSON.stringify(api.toJSON()));
    expect(stored).toEqual({
      kind: 'plate-comments',
      version: 1,
      threads: [api.getThread('thread')],
      ranges: [{ threadId: 'thread', range: expect.any(Object) }],
    });
    const reopened = createEditor({
      initialValue: editor.read.value(),
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: { initialComments: stored },
        }),
      ],
    });
    const savedApi = reopened.plugin(BaseCommentsPlugin).api;
    expect(savedApi.getThreads()).toEqual(api.getThreads());
    expect(savedApi.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
    expect(reopened.api.history.undo()).toEqual({ status: 'empty' });
    expect(reopened.api.history.redo()).toEqual({ status: 'empty' });
    expect(savedApi.toJSON()).toEqual(stored);
  });

  it.each([
    ['wrong kind', (saved: CommentsJSON) => ({ ...saved, kind: 'comments' })],
    ['unknown version', (saved: CommentsJSON) => ({ ...saved, version: 2 })],
    [
      'duplicate threads',
      (saved: CommentsJSON) => ({
        ...saved,
        threads: [...saved.threads, saved.threads[0]],
      }),
    ],
    [
      'duplicate ranges',
      (saved: CommentsJSON) => ({
        ...saved,
        ranges: [...saved.ranges, saved.ranges[0]],
      }),
    ],
    [
      'orphan range',
      (saved: CommentsJSON) => ({
        ...saved,
        ranges: [{ ...saved.ranges[0], threadId: 'missing' }],
      }),
    ],
    [
      'target disagreement',
      (saved: CommentsJSON) => ({
        ...saved,
        threads: [
          { ...saved.threads[0], target: { type: 'change', id: 'change' } },
        ],
      }),
    ],
    [
      'invalid timestamp',
      (saved: CommentsJSON) => ({
        ...saved,
        threads: [{ ...saved.threads[0], createdAt: 'not-a-date' }],
      }),
    ],
    [
      'invalid resolution',
      (saved: CommentsJSON) => ({
        ...saved,
        threads: [
          {
            ...saved.threads[0],
            resolution: { resolvedAt: 'not-a-date', userId: 'alice' },
          },
        ],
      }),
    ],
    [
      'unpublished draft',
      (saved: CommentsJSON) => ({
        ...saved,
        threads: [{ ...saved.threads[0], status: 'draft' }],
      }),
    ],
    [
      'malformed opaque range',
      (saved: CommentsJSON) => ({
        ...saved,
        ranges: [{ threadId: 'thread', range: { invalid: true } }],
      }),
    ],
  ])('rejects %s before editor construction succeeds', (_name, corrupt) => {
    expect(() => setup(corrupt(commentsFixture()) as CommentsJSON)).toThrow();
  });

  it('rejects a saved range that cannot address the loaded document', () => {
    const initialComments = commentsFixture();
    expect(() =>
      createEditor({
        plugins: [
          BaseCommentsPlugin.configure({ initialState: { initialComments } }),
        ],
        initialValue: [{ type: 'paragraph', children: [{ text: 'A' }] }],
      })
    ).toThrow();
  });

  it('loads explicit unavailable historical targets without rewinding conversations', () => {
    const old = commentsFixture();
    const latest = {
      ...thread(),
      messages: [
        ...thread().messages,
        { ...thread('reply').messages[0], body: body('Latest reply') },
      ],
      resolution: { resolvedAt: null, userId: null },
    };
    const saved: CommentsJSON = {
      ...old,
      threads: [latest, thread('newer')],
      ranges: [...old.ranges, { threadId: 'newer', range: null }],
    };
    const { api } = setup(saved);
    expect(api.getThread('thread')).toEqual(latest);
    expect(api.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range,
    });
    expect(api.attachment('newer')).toEqual({
      type: 'range',
      status: 'unavailable',
    });
    expect(api.attachment('missing')).toBeNull();
    expect(api.toJSON()).toEqual(saved);
  });

  it('binds the same saved revision independently in fresh editors', async () => {
    const saved = commentsFixture();
    const original = JSON.stringify(saved);
    const first = setup(saved);
    const second = setup(saved);
    first.editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    expect(first.api.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
    expect(second.api.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range,
    });
    await first.api.removeThread('thread');
    expect(second.api.getThreads()).toEqual(saved.threads);
    expect(second.api.toJSON()).toEqual(saved);
    expect(JSON.stringify(saved)).toBe(original);
  });

  it('owns loaded and returned nested records without leaking mutable aliases', () => {
    const input = structuredClone(commentsFixture());
    const { editor, api } = setup(input);
    const loaded = api.getThread('thread')!;
    expect(
      Reflect.set(
        input.threads[0].messages[0].body[0].children[0],
        'text',
        'Changed outside'
      )
    ).toBe(true);
    expect(loaded.messages[0].body).toEqual(body());
    expect(
      Reflect.set(
        loaded.messages[0].body[0].children[0],
        'text',
        'Changed through read'
      )
    ).toBe(false);
    const attachment = api.attachment('thread');
    if (attachment?.type !== 'range' || attachment.status !== 'attached') {
      throw new Error('Expected attached range');
    }
    expect(Reflect.set(attachment.range.anchor, 'offset', 9)).toBe(false);
    editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    expect(api.getThread('thread')).toBe(loaded);
    expect(api.getThread('thread')?.messages).toBe(loaded.messages);
    expect(JSON.parse(JSON.stringify(api.toJSON()))).toEqual(api.toJSON());
  });
});

describe('Comments mapping and conversation history', () => {
  it.each(['create', 'createThread', 'createDraft'] as const)(
    'captures %s ranges in the calling view while sharing one thread record',
    async (operation) => {
      const editor = createEditor({
        initialValue: value,
        userId: 'alice',
        plugins: [
          DefaultAuthoredPlugin,
          BaseCommentsPlugin.configure({
            initialState: { currentUserId: 'alice' },
          }),
        ],
      });
      const accepted = createEditorView(editor);
      const proposed = createEditorView(editor, {
        authored: { intent: 'propose', projection: 'markup' },
      });
      proposed.update.text.insert('0123456789', {
        at: { path: [0, 0], offset: 0 },
      });
      const selected = {
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 14 },
      };
      const { api } = proposed.plugin(BaseCommentsPlugin);
      const acceptedApi = accepted.plugin(BaseCommentsPlugin).api;
      let id: string;
      if (operation === 'create') {
        proposed.update.selection.set(selected);
        expect(api.begin()).toBe(true);
        expect(api.pendingRange()).toEqual(selected);
        expect(acceptedApi.pendingRange()).toEqual(range);
        const result = await api.create(body());
        expect(result.status).toBe('applied');
        if (result.status !== 'applied') throw new Error('Expected creation');
        id = result.value;
      } else {
        const input = {
          body: body(),
          target: { type: 'range' as const, range: selected },
        };
        if (operation === 'createThread') {
          const result = await api.createThread(input);
          expect(result.status).toBe('applied');
          if (result.status !== 'applied') throw new Error('Expected creation');
          id = result.value;
        } else {
          const draft = api.createDraft(input);
          expect(draft).not.toBeNull();
          if (!draft) throw new Error('Expected draft');
          id = draft;
        }
      }
      const record = api.getThread(id);
      expect(acceptedApi.getThread(id)).toBe(record);
      expect(editor.plugin(BaseCommentsPlugin).api.getThread(id)).toBe(record);
      expect(api.attachment(id)).toEqual({
        type: 'range',
        status: 'attached',
        range: selected,
      });
      expect(acceptedApi.attachment(id)).toEqual({
        type: 'range',
        status: 'attached',
        range,
      });
      expect(api.idsAt(selected.anchor)).toEqual([id]);
      expect(acceptedApi.idsAt(range.anchor)).toEqual([id]);
      expect(api.idsAt(range.anchor)).toEqual([]);
      if (operation === 'createDraft') expect(api.discardDraft(id)).toBe(true);
      else {
        expect(await api.removeThread(id)).toEqual({
          status: 'applied',
          value: undefined,
        });
      }
      expect(api.attachment(id)).toBeNull();
      expect(acceptedApi.attachment(id)).toBeNull();
    }
  );

  it('isolates attachment mapping from semantic subscriptions and stable thread references', async () => {
    const { editor, api } = setup(
      commentsFixture([
        { thread: thread('first'), range },
        { thread: thread('second'), range },
      ])
    );
    const first = api.getThread('first');
    const second = api.getThread('second');
    const snapshot = api.getSnapshot();
    const firstChanged = mock();
    const secondChanged = mock();
    const membershipChanged = mock();
    const semantic = mock();
    const attachments = mock();
    api.subscribeThread('first', firstChanged);
    api.subscribeThread('second', secondChanged);
    api.subscribeVisibleThreadIds(membershipChanged);
    api.subscribeThreads(semantic);
    api.subscribeAttachments(attachments);
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } })
    );
    editor.api.history.undo();
    editor.api.history.redo();
    expect(api.getThread('first')).toBe(first);
    expect(api.getThread('second')).toBe(second);
    expect(api.getSnapshot()).toBe(snapshot);
    expect(semantic).not.toHaveBeenCalled();
    expect(firstChanged).not.toHaveBeenCalled();
    expect(secondChanged).not.toHaveBeenCalled();
    expect(membershipChanged).not.toHaveBeenCalled();
    expect(attachments).toHaveBeenCalledTimes(3);
    attachments.mockClear();
    await api.edit('first', 'first-message', body('Edited'));
    expect(semantic).toHaveBeenCalledTimes(1);
    expect(semantic).toHaveBeenCalledWith({ ids: ['first'] });
    expect(firstChanged).toHaveBeenCalledTimes(1);
    expect(secondChanged).not.toHaveBeenCalled();
    expect(attachments).not.toHaveBeenCalled();
    expect(membershipChanged).not.toHaveBeenCalled();
    expect(api.getSnapshot()).toBe(snapshot);
    expect(api.getThread('second')).toBe(second);
  });

  it.each(['partial', 'full', 'block'] as const)(
    'retains replies and resolution across %s deletion and repeated undo',
    async (deletion) => {
      const { editor, api } = setup();
      editor.update({ history: 'new-batch' }, (tx) => {
        if (deletion === 'block') tx.nodes.remove({ at: [0] });
        else {
          tx.text.delete({
            at: {
              ...range,
              kind: 'text',
              focus:
                deletion === 'partial'
                  ? { path: [0, 0], offset: 2 }
                  : range.focus,
            },
          });
        }
      });
      expect(await api.reply('thread', body('After deletion'))).toEqual({
        status: 'applied',
        value: undefined,
      });
      expect(await api.resolve('thread')).toEqual({
        status: 'applied',
        value: undefined,
      });
      const conversation = api.getThread('thread');
      expect(conversation?.excerpt).toBe('lph');
      expect(conversation?.messages).toHaveLength(2);
      expect(conversation?.resolution).toEqual({
        resolvedAt: expect.any(String),
        userId: 'alice',
      });
      const deletedAttachment =
        deletion === 'partial'
          ? {
              type: 'range',
              status: 'attached',
              range: {
                anchor: range.anchor,
                focus: { path: [0, 0], offset: 3 },
              },
            }
          : { type: 'range', status: 'unavailable' };
      expect(api.attachment('thread')).toEqual(deletedAttachment);
      for (let attempt = 0; attempt < 2; attempt++) {
        expect(editor.api.history.undo()).toEqual({ status: 'applied' });
        expect(api.attachment('thread')).toEqual({
          type: 'range',
          status: 'attached',
          range,
        });
        expect(api.getThread('thread')).toBe(conversation);
        expect(editor.api.history.redo()).toEqual({ status: 'applied' });
        expect(api.attachment('thread')).toEqual(deletedAttachment);
        expect(api.getThread('thread')).toBe(conversation);
      }
      await api.reopen('thread');
      expect(api.getThread('thread')?.resolution).toBeNull();
      expect(api.attachment('thread')).toEqual(deletedAttachment);
    }
  );

  it('does not resurrect explicitly deleted messages or threads on document undo', async () => {
    const { editor, api } = setup();
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('X', { at: range.anchor })
    );
    await api.reply('thread', body('Keep this reply'));
    await api.removeMessage('thread', 'thread-message');
    editor.api.history.undo();
    expect(
      api.getThread('thread')?.messages.map((message) => message.body)
    ).toEqual([body('Keep this reply')]);
    editor.api.history.redo();
    await api.removeThread('thread');
    editor.api.history.undo();
    expect(api.getThreads()).toEqual([]);
    expect(api.attachment('thread')).toBeNull();
  });

  it('maps attachments through block move, split and merge without a view', () => {
    const initialValue = [
      { type: 'paragraph', children: [{ text: 'Alpha' }] },
      { type: 'paragraph', children: [{ text: 'Beta' }] },
    ];
    const editor = createEditor({
      initialValue,
      plugins: [
        BaseCommentsPlugin.configure({
          initialState: {
            initialComments: commentsFixture(undefined, initialValue),
          },
        }),
      ],
    });
    const { api } = editor.plugin(BaseCommentsPlugin);
    const before = api.getThread('thread');
    const changes = mock();
    api.subscribeThreads(changes);
    editor.update.nodes.move({ at: [0], to: [1] });
    expect(api.attachment('thread')).toEqual({
      type: 'range',
      status: 'attached',
      range: {
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 4 },
      },
    });
    editor.update.nodes.split({
      at: { path: [1, 0], offset: 2 },
      match: (node) => 'children' in node,
    });
    let attachment = api.attachment('thread');
    if (attachment?.type !== 'range' || attachment.status !== 'attached') {
      throw new Error('Expected attached range');
    }
    expect(editor.read.text.string(attachment.range)).toBe('lph');
    editor.update.nodes.merge({ at: [2] });
    attachment = api.attachment('thread');
    if (attachment?.type !== 'range' || attachment.status !== 'attached') {
      throw new Error('Expected attached range');
    }
    expect(editor.read.text.string(attachment.range)).toBe('lph');
    expect(api.getThread('thread')).toBe(before);
    expect(changes).not.toHaveBeenCalled();
  });
});
