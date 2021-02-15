import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { SetState, StoreApi } from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { pipe } from '../../utils/pipe';
import { SlatePluginsState, State } from './types';

export type SlatePluginsStore = StoreApi<SlatePluginsState>;

const defaultWithPlugins = [withReact, withHistory] as const;
export const defaultEditor = pipe(createEditor(), ...defaultWithPlugins);

// TODO: use immer, except for editor as it should be mutable.
const setStateById = (
  stateKey: string,
  set: SetState<SlatePluginsState>,
  key: string,
  value: any
) =>
  set((state) => ({
    byId: { ...state.byId, [key]: { ...state.byId[key], [stateKey]: value } },
  }));

/**
 * Slate plugins zustand store.
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsState>(
  (set) => ({
    byId: {
      main: {
        components: {},
        editor: defaultEditor,
        plugins: [],
        value: [],
      },
    },
    setComponents: (key, value: State['components']) =>
      setStateById('components', set, key, value),
    setEditor: (key, value: State['editor']) =>
      setStateById('editor', set, key, value),
    setPlugins: (key, value: State['plugins']) =>
      setStateById('plugins', set, key, value),
    setValue: (key, value: State['value']) =>
      setStateById('value', set, key, value),
  })
);
