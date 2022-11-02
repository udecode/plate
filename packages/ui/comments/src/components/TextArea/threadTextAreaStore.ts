import { User } from '@udecode/plate-comments';
import { createStore } from '@udecode/plate-core';

type ThreadTextAreaState = {
  areContactsShown: boolean;
  contacts: User[];
  filteredContacts: User[];
  selectedContactIndex: number;
};

export const threadTextAreaStore = createStore(
  'threadTextArea'
)<ThreadTextAreaState>({
  areContactsShown: false,
  contacts: [],
  filteredContacts: [],
  selectedContactIndex: 0,
});

export const useThreadTextAreaSelectors = threadTextAreaStore.use;
export const threadTextAreaSelectors = threadTextAreaStore.get;
export const threadTextAreaActions = threadTextAreaStore.set;
