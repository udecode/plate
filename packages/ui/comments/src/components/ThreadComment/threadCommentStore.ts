import { createStore } from '@udecode/plate-core';

export const threadCommentStore = createStore('threadCommentStore')({
  isOpen: false,
  isEditing: false,
});

export const threadCommentStoreActions = threadCommentStore.set;
export const threadCommentStoreSelectors = threadCommentStore.get;
export const useThreadCommentStoreSelectors = () => threadCommentStore.use;
