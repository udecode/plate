import create from 'zustand';
import { slatePluginsStore } from './slatePluginsStore';

export const useSlatePluginsStore = create(slatePluginsStore);
