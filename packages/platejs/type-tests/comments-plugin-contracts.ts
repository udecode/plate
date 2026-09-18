import type { EditorDocumentRange, Range, Value } from 'platejs';
import {
  BaseCommentsPlugin,
  type CommentAttachment,
  type CommentMutationRequest,
  type CommentMutationResult,
  type CommentsJSON,
  type CommentThread,
  type CreateCommentThreadInput,
} from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';

declare const saved: CommentsJSON | null;
declare const range: Range;
declare const body: Value;

BaseCommentsPlugin.configure({
  initialState: {
    initialComments: saved,
    mutate: (request) => {
      request satisfies CommentMutationRequest;
      request.mutationId satisfies string;
      request.previous satisfies CommentThread | null;
      request.proposed satisfies CommentThread | null;
      request.attachment satisfies EditorDocumentRange | undefined;
      // @ts-expect-error an inferred request is not any
      request.missing;
      return { status: 'commit', thread: request.proposed };
    },
  },
});
CommentsPlugin.configure({
  initialState: {
    initialComments: saved,
    currentUserId: 'alice',
    mutate: async ({ proposed, operation }) => {
      operation satisfies CommentMutationRequest['operation'];
      return operation === 'removeThread'
        ? { status: 'reject', code: 'forbidden' }
        : { status: 'commit', thread: proposed };
    },
  },
  slots: { afterEditable: () => null },
});

CommentsPlugin.extend(({ api, store }) => {
  api.begin(range) satisfies boolean;
  api.create(body) satisfies Promise<CommentMutationResult<string>>;
  api.createThread({
    body,
    target: { type: 'range', range },
  }) satisfies Promise<CommentMutationResult<string>>;
  api.createDraft({
    body,
    target: { type: 'change', id: 'suggestion' },
  }) satisfies string | null;
  api.discardDraft('draft') satisfies boolean;
  api.reply('thread', body) satisfies Promise<CommentMutationResult>;
  api.edit('thread', 'message', body) satisfies Promise<CommentMutationResult>;
  api.resolve('thread') satisfies Promise<CommentMutationResult>;
  api.reopen('thread') satisfies Promise<CommentMutationResult>;
  api.removeMessage(
    'thread',
    'message'
  ) satisfies Promise<CommentMutationResult>;
  api.removeThread('thread') satisfies Promise<CommentMutationResult>;
  api.publishDraft('draft') satisfies Promise<CommentMutationResult>;
  api.getThread('thread') satisfies CommentThread | undefined;
  api.getThreads() satisfies readonly CommentThread[];
  api.toJSON() satisfies CommentsJSON;
  api.idsAt(range) satisfies readonly string[];
  api.attachment('thread') satisfies CommentAttachment | null;
  api.setActive(['thread']);
  store.get('activeIds') satisfies readonly string[];
  store.get('currentUserId') satisfies string | null;
  api.subscribeThreads(({ ids }) => {
    ids satisfies readonly string[];
  });
  api.subscribeAttachments(() => {}) satisfies () => void;
  return {
    api: ({ api: base }) => ({
      create: async (value: Value) => {
        const result = await base.create(value);
        if (result.status === 'applied') result.value satisfies string;
        if (result.status === 'rejected') {
          result.code satisfies string | undefined;
        }
        // @ts-expect-error a non-applied result has no value
        if (result.status === 'stale') result.value;
        const resolved = await base.resolve('thread');
        if (resolved.status === 'applied') resolved.value satisfies undefined;
        return result;
      },
    }),
  };
});

const liveTarget: CommentThread['target'] = { type: 'range' };
const resolution: CommentThread['resolution'] = {
  resolvedAt: null,
  userId: null,
};
const input: CreateCommentThreadInput = {
  body,
  target: { type: 'range', range },
};
void liveTarget;
void resolution;
void input;

// @ts-expect-error actors come from the plugin or canonical adapter record
const forgedActor: CreateCommentThreadInput = { ...input, userId: 'someone' };
// @ts-expect-error draft allocation is a separate local operation
const forgedStatus: CreateCommentThreadInput = { ...input, status: 'draft' };
// @ts-expect-error timestamps are serializable strings
const date: CommentThread['createdAt'] = new Date();
void forgedActor;
void forgedStatus;
void date;
