import { pipe } from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import create, { SetState } from 'zustand';
import { SlatePluginsState, SlatePluginsStore } from './types';

const defaultWithPlugins = [withReact, withHistory] as const;
export const defaultEditor = pipe(createEditor(), ...defaultWithPlugins);

// TODO: use immer, except for editor as it should be mutable.
const setStateById = (
  stateKey: string,
  set: SetState<SlatePluginsStore>,
  key: string,
  value: any
) =>
  set((state) => ({
    byId: { ...state.byId, [key]: { ...state.byId[key], [stateKey]: value } },
  }));

/**
 * Slate plugins zustand store.
 */
export const useSlatePluginsStore = create<SlatePluginsStore>((set) => ({
  byId: {
    main: {
      components: {},
      editor: defaultEditor,
      plugins: [],
      value: [],
    },
  },
  setComponents: (key, value: SlatePluginsState['components']) =>
    setStateById('components', set, key, value),
  setEditor: (key, value: SlatePluginsState['editor']) =>
    setStateById('editor', set, key, value),
  setPlugins: (key, value: SlatePluginsState['plugins']) =>
    setStateById('plugins', set, key, value),
  setValue: (key, value: SlatePluginsState['value']) =>
    setStateById('value', set, key, value),
}));
