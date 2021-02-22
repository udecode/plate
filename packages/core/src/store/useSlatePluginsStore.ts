import create, { UseStore } from 'zustand';
import { SlatePluginsState } from '../types/SlatePluginsState';
import { slatePluginsStore } from './slatePluginsStore';

export type UseSlatePluginsStore = UseStore<SlatePluginsState>;

export const useSlatePluginsStore = create(slatePluginsStore);
