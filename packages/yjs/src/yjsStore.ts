import { createZustoodStore } from '@udecode/plate-common';

export const yjsStore = createZustoodStore('yjs')({
  isConnected: false,
  isSynced: false,
});

export const yjsActions = yjsStore.set;
export const yjsSelectors = yjsStore.get;
export const useYjsSelectors = yjsStore.use;
export const useYjsStore = yjsStore.useStore;
