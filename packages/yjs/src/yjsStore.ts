import { createStore } from '@udecode/zustood';

export const yjsStore = createStore('yjs')({
  isConnected: false,
  isSynced: false,
});

export const yjsActions = yjsStore.set;
export const yjsSelectors = yjsStore.get;
export const useYjsSelectors = yjsStore.use;
export const useYjsStore = yjsStore.useStore;
