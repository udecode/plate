import React from 'react';

import { type EditorCommit, RangeApi, type Selection } from '@platejs/plite';
import { useEditorRuntimeState } from '@platejs/plite-react';

import { useAtomStoreSet, useAtomStoreState, useAtomStoreValue } from 'jotai-x';

import type { PlateStoreEditor, PlateStoreState } from './PlateStore';

import { createAtomStore } from '../../libs';
import { createPlateFallbackEditor } from '../../utils';
import {
  usePlateControllerExists,
  usePlateControllerStore,
} from '../plate-controller';

export type PlateStore = ReturnType<typeof usePlateStore>;

export const PLATE_SCOPE = 'plate';

const childrenChanged = (change?: EditorCommit) =>
  Boolean(change?.changed.hasAny('document'));

const selectionChanged = (change?: { selectionChanged?: boolean }) =>
  Boolean(change?.selectionChanged);

const selectionEqual = (previous: Selection, next: Selection) => {
  if (previous === next) return true;
  if (!previous || !next) return previous === next;

  return RangeApi.equals(previous, next);
};

export const createPlateStore = <
  E extends PlateStoreEditor = PlateStoreEditor,
>({
  containerRef = { current: null },
  decorate = null,
  editor,
  isMounted = false,
  primary = true,
  renderElement = null,
  renderLeaf = null,
  renderText = null,
  onChange = null,
  onNodeChange = null,
  onSelectionChange = null,
  onTextChange = null,
  onValueChange = null,
  ...state
}: Partial<PlateStoreState<E>> = {}) =>
  createAtomStore(
    {
      containerRef,
      decorate,
      editor,
      isMounted,
      primary,
      renderElement,
      renderLeaf,
      renderText,
      onChange,
      onNodeChange,
      onSelectionChange,
      onTextChange,
      onValueChange,
      ...state,
    } as PlateStoreState<E>,
    {
      name: 'plate',
      suppressWarnings: true,
    }
  );

const {
  PlateProvider: BasePlateStoreProvider,
  plateStore,
  usePlateSet: usePlateLocalSet,
  usePlateState: usePlateLocalState,
  usePlateStore: usePlateLocalStore,
  usePlateValue: usePlateLocalValue,
} = createPlateStore();

const { usePlateStore: useFallbackPlateStore } = createPlateStore();

type BasePlateStoreProviderProps = React.ComponentProps<
  typeof BasePlateStoreProvider
>;

export type PlateStoreProviderProps<
  E extends PlateStoreEditor = PlateStoreEditor,
> = Omit<BasePlateStoreProviderProps, keyof PlateStoreState | 'editor'> &
  Partial<PlateStoreState<E>> & {
    editor: E;
  };

const PlateStoreProvider = BasePlateStoreProvider as unknown as <
  E extends PlateStoreEditor = PlateStoreEditor,
>(
  props: PlateStoreProviderProps<E>
) => React.ReactElement | null;

export { plateStore, PlateStoreProvider, usePlateLocalStore };

export const usePlateStore = (id?: string) => {
  // Try to fetch the store from a Plate provider
  const localStore =
    usePlateLocalStore({ scope: id, warnIfNoStore: false }) ?? null;

  const [localStoreExists] = React.useState(!!localStore.store);

  // If no store was found, try to fetch the store from a PlateController
  const store = (
    localStoreExists
      ? localStore
      : // eslint-disable-next-line react-hooks/rules-of-hooks
        usePlateControllerStore(id)
  ) as typeof localStore;

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
  const fallbackStore = useFallbackPlateStore();

  if (!store) {
    if (plateControllerExists) {
      return fallbackStore;
    }

    throw new Error(
      'Plate hooks must be used inside a Plate or PlateController'
    );
  }
  return store;
};

export const usePlateSet: typeof usePlateLocalSet = (key, options) => {
  const store = usePlateStore(
    typeof options === 'string' ? options : options?.scope
  );

  return useAtomStoreSet(store, key);
};

export const usePlateValue = ((key, options) => {
  const store = usePlateStore(
    typeof options === 'string' ? options : options?.scope
  );

  return useAtomStoreValue(store, key);
}) as typeof usePlateLocalValue;

export const usePlateState = ((key, options) => {
  const store = usePlateStore(
    typeof options === 'string' ? options : options?.scope
  );

  return useAtomStoreState(store, key);
}) as typeof usePlateLocalState;

// ─── Selectors ───────────────────────────────────────────────────────────────

/** Get the closest `Plate` id. */
export const useEditorId = (): string =>
  useAtomStoreValue(usePlateStore(), 'editor').id;

export const useEditorMounted = (id?: string): boolean =>
  !!useAtomStoreValue(usePlateStore(id), 'isMounted');

/**
 * Get a reference to the editor instance that remains stable across re-renders.
 * The editor object is enhanced with a `store` property that provides access to
 * the Plate store.
 */
export const useEditorRef = <E extends PlateStoreEditor = PlateStoreEditor>(
  id?: string
): E & { store: PlateStore } => {
  const store = usePlateStore(id);
  const editor = ((useAtomStoreValue(store, 'editor') as unknown as
    | E
    | undefined) ?? (createPlateFallbackEditor() as unknown as E)) as E & {
    store: PlateStore;
  };

  editor.store = store;

  return editor;
};

/** Get the editor selection (deeply memoized). */
export const useEditorSelection = (id?: string) => {
  const editor = useEditorRef(id);

  return useEditorRuntimeState(editor, (state) => state.selection(), {
    deps: [],
    equalityFn: selectionEqual,
    shouldUpdate: selectionChanged,
  });
};

/** Get editor state which is updated on editor change. */
export const useEditorState = <E extends PlateStoreEditor = PlateStoreEditor>(
  id?: string
): E => {
  const editor = useEditorRef<E>(id);

  useEditorRuntimeState(editor, (state) => state.runtime.snapshot().version, {
    deps: [],
  });

  return editor;
};

/** Get the editor value (deeply memoized). */
export const useEditorValue = (id?: string) => {
  const editor = useEditorRef(id);

  return useEditorRuntimeState(editor, (state) => state.children(), {
    deps: [],
    shouldUpdate: childrenChanged,
  });
};
