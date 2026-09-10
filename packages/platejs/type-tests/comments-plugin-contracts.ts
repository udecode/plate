import type { Range, Value } from 'platejs';
import { BaseCommentsPlugin, type CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';

declare const records: readonly CommentThread[];
declare const range: Range;

BaseCommentsPlugin.configure({ initialState: { initialThreads: records } });
CommentsPlugin.configure({
  initialState: { initialThreads: records, currentUserId: 'alice' },
  slots: { afterEditable: () => null },
});

CommentsPlugin.extend(({ api, store }) => {
  api.begin(range) satisfies boolean;
  api.create satisfies (value: Value) => string | null | Promise<string | null>;
  api.getThread('thread') satisfies CommentThread | undefined;
  api.getThreads() satisfies readonly CommentThread[];
  api.setThreads(records);
  api.idsAt(range) satisfies readonly string[];
  api.range('thread') satisfies Range | null;
  api.setActive(['thread']);
  store.get('activeIds') satisfies readonly string[];
  store.get('currentUserId') satisfies string | null;
  api.subscribeThreads(({ ids, reason }) => {
    ids satisfies readonly string[];
    reason satisfies 'data' | 'document';
  });
  return {
    api: ({ api: base }) => ({
      create: async (value: Value) => base.create(value),
    }),
  };
});

const liveTarget: CommentThread['target'] = {
  type: 'range',
  // @ts-expect-error native handles cannot be persisted as comment targets
  range: { resolve: () => range, release() {} },
};
void liveTarget;

// @ts-expect-error timestamps are serializable strings
const date: CommentThread['createdAt'] = new Date();
void date;
