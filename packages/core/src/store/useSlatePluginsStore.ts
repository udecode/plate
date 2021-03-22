import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { SlatePluginsState } from '../types/SlatePluginsStore';

/**
 * Slate plugins vanilla store.
 * @see zustand vanilla store
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsState>(
  () => ({})
);

/**
 * Slate plugins store.
 * @see zustand store
 */
export const useSlatePluginsStore = create(slatePluginsStore);
