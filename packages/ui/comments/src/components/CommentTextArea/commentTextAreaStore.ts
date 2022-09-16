import { createStore } from '@udecode/plate-core';
import { User } from '../../types';

export const commentTextAreaStore = createStore('commentTextArea')({
  areContactsShown: false,
  filteredContacts: [] as User[],
});

export const commentTextAreaActions = commentTextAreaStore.set;
export const commentTextAreaSelectors = commentTextAreaStore.get;
export const useCommentTextAreaSelectors = () => commentTextAreaStore.use;
