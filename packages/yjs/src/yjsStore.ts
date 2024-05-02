import { createZustandStore } from '@udecode/plate-common/server';

export const yjsStore = createZustandStore('yjs')({
  isConnected: false,
  isSynced: false,
});

export const yjsActions = yjsStore.set;
export const yjsSelectors = yjsStore.get;
export const useYjsSelectors = yjsStore.use;
export const useYjsStore = yjsStore.useStore;
