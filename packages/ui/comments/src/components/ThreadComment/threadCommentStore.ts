import { createStore } from '@udecode/plate-core';

type ThreadCommentState = {
  isEditing: boolean;
  threadLink: string | null;
};

export const threadCommentStore = createStore(
  'threadComment'
)<ThreadCommentState>({
  isEditing: false,
  threadLink: null,
});

export const useThreadCommentSelectors = threadCommentStore.use;
export const threadCommentSelectors = threadCommentStore.get;
export const threadCommentActions = threadCommentStore.set;
