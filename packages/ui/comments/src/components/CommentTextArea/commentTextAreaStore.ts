import { createStore } from '@udecode/plate-core';

export const commentTextAreaStore = createStore('commentTextArea')({
  areContactsShown: false,
});

export const commentTextAreaActions = commentTextAreaStore.set;
export const commentTextAreaSelectors = commentTextAreaStore.get;
export const useCommentTextAreaSelectors = () => commentTextAreaStore.use;
