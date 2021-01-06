import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import create from 'zustand';
import type { SlatePluginsState } from './types';

export const useSlatePluginStore = create<SlatePluginsState>((set) => ({
  editor: createEditor,
  withPlugins: [withReact],
  plugins: [],
  components: [],
  setComponents: (newComponents: SlatePluginsState['components']) =>
    set((state) => ({ components: [...state.components, ...newComponents] })),
  setPlugins: (newPlugins: SlatePluginsState['plugins']) =>
    set((state) => ({ plugins: [...state.plugins, ...newPlugins] })),
  setWithPlugins: (newWithPlugins: SlatePluginsState['withPlugins']) =>
    set((state) => ({
      withPlugins: [...state.withPlugins, ...newWithPlugins],
    })),
  setEditor: (newEditor: SlatePluginsState['editor']) =>
    set(() => ({ editor: newEditor })),
}));
