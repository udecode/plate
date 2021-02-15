import create, { UseStore } from 'zustand';
import { slatePluginsStore } from './slatePluginsStore';
import { SlatePluginsState } from './types';

export type UseSlatePluginsStore = UseStore<SlatePluginsState>;

export const useSlatePluginsStore = create(slatePluginsStore);
