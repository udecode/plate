import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { SetState, StoreApi } from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { SlatePluginsState, State } from '../types/SlatePluginsState';
import { pipe } from '../utils/pipe';

export type SlatePluginsStore = StoreApi<SlatePluginsState>;

const defaultWithPlugins = [withReact, withHistory] as const;
export const defaultEditor = pipe(createEditor(), ...defaultWithPlugins);
export const getDefaultEditor = () =>
  pipe(createEditor(), ...defaultWithPlugins);

// TODO: use immer, except for editor as it should be mutable.
const setStateById = ({
  set,
  stateKey,
  stateValue,
  storeKey,
}: {
  set: SetState<SlatePluginsState>;
  stateKey: string;
  stateValue: any;
  storeKey: string;
}) =>
  set((state) => ({
    byId: {
      ...state.byId,
      [stateKey]: { ...state.byId[stateKey], [storeKey]: stateValue },
    },
  }));

const getSetter = <T>({
  set,
  stateKey,
}: {
  set: SetState<SlatePluginsState>;
  stateKey: string;
}) => (value: T, key = 'main') =>
  setStateById({ set, stateKey, stateValue: value, storeKey: key });

/**
 * Slate plugins zustand store.
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsState>(
  (set) => ({
    byId: {
      main: {
        components: {},
        editor: getDefaultEditor(),
        plugins: [],
        value: [],
      },
    },
    setComponents: getSetter<State['components']>({
      set,
      stateKey: 'components',
    }),
    setEditor: getSetter<State['editor']>({
      set,
      stateKey: 'editor',
    }),
    setPlugins: getSetter<State['plugins']>({
      set,
      stateKey: 'plugins',
    }),
    setValue: getSetter<State['value']>({
      set,
      stateKey: 'value',
    }),
  })
);
