import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { SlatePluginsStates } from '../../types/SlatePluginsStore';

/**
 * Slate plugins vanilla store.
 * @see zustand vanilla store
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsStates>(
  () => ({})
);

// export const slatePluginsAtom = atomWithStore(slatePluginsStore);

// const factory = () => atom<SlatePluginsState>({});

/**
 * Slate plugins store.
 * @see zustand store
 */
export const useSlatePluginsStore = create(slatePluginsStore);
