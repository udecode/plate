import { createStore } from '@udecode/plate-core';
import { Contact } from '../../utils';

export const commentTextAreaStore = createStore('commentTextArea')({
  areContactsShown: false,
  filteredContacts: [] as Contact[],
});

export const commentTextAreaActions = commentTextAreaStore.set;
export const commentTextAreaSelectors = commentTextAreaStore.get;
export const useCommentTextAreaSelectors = () => commentTextAreaStore.use;
