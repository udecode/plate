import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import create from 'zustand';
import type { SlatePluginsState } from './types';

/**
 * @description This plugin is the central store of your Editor, you can dynamically change the contents as you wish and internally, it will automatically reflect on your editor
 * @see @todo LINK TO THE DOCS PAGE
 * @requires key
 * @param options SlatePluginsState
 */
export const useSlatePluginStore = create<SlatePluginsState>((set) => ({
  key: 'main-editor',
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
