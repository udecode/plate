import { createStore } from '@udecode/plate-core';

export const moreMenuStore = createStore('moreMenu')({
  isMenuOpen: false,
});

export const moreMenuActions = moreMenuStore.set;
export const moreMenuSelectors = moreMenuStore.get;
export const useMoreMenuSelectors = () => moreMenuStore.use;
