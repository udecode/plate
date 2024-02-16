import React from 'react';
import { Value } from '@udecode/slate';
import { atom, createStore } from 'jotai';
import { JotaiStore } from 'jotai-x';

import { createAtomStore } from '../../libs/jotai';
import { PlateEditor } from '../../types/PlateEditor';
import { PlateStoreState } from '../../types/PlateStore';
import {
  createPlateFallbackEditor,
  detectMultiplePlateVersions,
} from '../../utils';
import {
  usePlateControllerEditorStore,
  usePlateControllerExists,
} from '../plate-controller';

/**
 * A unique id used as a provider scope.
 * Use it if you have multiple `Plate` in the same React tree.
 * @default PLATE_SCOPE
 */
export type PlateId = string;

export const PLATE_SCOPE = 'plate';
export const GLOBAL_PLATE_SCOPE = Symbol('global-plate');

export const createPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  decorate = null,
  editor = createPlateFallbackEditor<V, E>(),
  id,
  isMounted = false,
  versionDecorate = 1,
  versionEditor = 1,
  versionSelection = 1,
  onChange = null,
  editorRef = null,
  plugins = [],
  rawPlugins = [],
  readOnly = null,
  primary = true,
  renderElement = null,
  renderLeaf = null,
  value = null as any,
  ...state
}: Partial<PlateStoreState<V, E>> = {}) =>
  createAtomStore(
    {
      decorate,
      editor,
      id,
      isMounted,
      versionDecorate,
      versionEditor,
      versionSelection,
      onChange,
      editorRef,
      plugins,
      rawPlugins,
      readOnly,
      primary,
      renderElement,
      renderLeaf,
      value,
      ...state,
    } as PlateStoreState<V, E>,
    {
      name: 'plate',
      extend: (atoms) => ({
        trackedEditor: atom((get) => ({
          editor: get(atoms.editor),
          version: get(atoms.versionEditor),
        })),
        trackedSelection: atom((get) => ({
          selection: get(atoms.editor).selection,
          version: get(atoms.versionSelection),
        })),
      }),
    }
  );

export const {
  plateStore,
  usePlateStore,
  PlateProvider: PlateStoreProvider,
} = createPlateStore();

export interface UsePlateEditorStoreOptions {
  debugHookName?: string;
}

export const usePlateEditorStore = (
  id?: PlateId,
  { debugHookName = 'usePlateEditorStore' }: UsePlateEditorStoreOptions = {}
): JotaiStore => {
  detectMultiplePlateVersions();

  // Try to fetch the store from a Plate provider
  const localStore = usePlateStore(id).store({ warnIfNoStore: false }) ?? null;

  /**
   * To preserve hook order, only use `localStore` if it was present on first
   * render. This lets us call `usePlateControllerEditorStore` conditionally.
   */
  const [localStoreExists] = React.useState(!!localStore);

  // If no store was found, try to fetch the store from a PlateController
  const store = localStoreExists
    ? localStore
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      usePlateControllerEditorStore(id);

  /**
   * If we still have no store, there are two possibilities.
   *
   * Case 1: There is neither a Plate nor a PlateController above us in the
   * tree. In this case, throw an error, since calling the hook will never
   * work.
   *
   * Case 2: There is a PlateController, but it has no active editor. In this
   * case, return a fallback store until an editor becomes active.
   */
  const plateControllerExists = usePlateControllerExists();
  const fallbackStore = React.useMemo(() => createStore(), []);

  if (!store) {
    if (plateControllerExists) {
      return fallbackStore;
    }

    throw new Error(
      `${debugHookName} must be used inside a Plate or PlateController`
    );
  }

  return store;
};

export const usePlateSelectors = (
  id?: PlateId,
  options?: UsePlateEditorStoreOptions
) => {
  const store = usePlateEditorStore(id, {
    debugHookName: 'usePlateSelectors',
    ...options,
  });

  return usePlateStore({ store }).get;
};

export const usePlateActions = (
  id?: PlateId,
  options?: UsePlateEditorStoreOptions
) => {
  const store = usePlateEditorStore(id, {
    debugHookName: 'usePlateActions',
    ...options,
  });

  return usePlateStore({ store }).set;
};

export const usePlateStates = (
  id?: PlateId,
  options?: UsePlateEditorStoreOptions
) => {
  const store = usePlateEditorStore(id, {
    debugHookName: 'usePlateStates',
    ...options,
  });

  return usePlateStore({ store }).use;
};

/**
 * Get the closest `Plate` id.
 */
export const usePlateId = (): PlateId =>
  usePlateSelectors(undefined, { debugHookName: 'usePlateId' }).id();
