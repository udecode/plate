import React from 'react';

import type { JotaiStore } from 'jotai-x';

import { atom, createStore } from 'jotai';

import type { PlateEditor, PlateStoreState } from '../../../shared/types';

import { createAtomStore } from '../../libs';
import { createPlateFallbackEditor } from '../../utils';
import {
  usePlateControllerEditorStore,
  usePlateControllerExists,
} from '../plate-controller';

/**
 * A unique id used as a provider scope. Use it if you have multiple `Plate` in
 * the same React tree.
 *
 * @default PLATE_SCOPE
 */
export type PlateId = string;

export const PLATE_SCOPE = 'plate';

export const GLOBAL_PLATE_SCOPE = Symbol('global-plate');

export const createPlateStore = <E extends PlateEditor = PlateEditor>({
  decorate = null,
  editor = createPlateFallbackEditor() as E,
  id,
  isMounted = false,
  onChange = null,
  onSelectionChange = null,
  onValueChange = null,
  primary = true,
  readOnly = null,
  renderElement = null,
  renderLeaf = null,
  versionDecorate = 1,
  versionEditor = 1,
  versionSelection = 1,
  versionValue = 1,
  ...state
}: Partial<PlateStoreState<E>> = {}) =>
  createAtomStore(
    {
      decorate,
      editor,
      isMounted,
      onChange,
      onSelectionChange,
      onValueChange,
      primary,
      readOnly,
      renderElement,
      renderLeaf,
      versionDecorate,
      versionEditor,
      versionSelection,
      versionValue,
      ...state,
    } as PlateStoreState<E>,
    {
      extend: (atoms) => ({
        trackedEditor: atom((get) => ({
          editor: get(atoms.editor),
          version: get(atoms.versionEditor),
        })),
        trackedSelection: atom((get) => ({
          selection: get(atoms.editor).selection,
          version: get(atoms.versionSelection),
        })),
        trackedValue: atom((get) => ({
          value: get(atoms.editor).children,
          version: get(atoms.versionValue),
        })),
      }),
      name: 'plate',
    }
  );

export const {
  PlateProvider: PlateStoreProvider,
  plateStore,
  usePlateStore,
} = createPlateStore();

export interface UsePlateEditorStoreOptions {
  debugHookName?: string;
}

export const usePlateEditorStore = (
  id?: PlateId,
  { debugHookName = 'usePlateEditorStore' }: UsePlateEditorStoreOptions = {}
): JotaiStore => {
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
