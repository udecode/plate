import React, { useMemo } from 'react';

import { atom } from 'jotai';
import { useAtomStoreSet, useAtomStoreState, useAtomStoreValue } from 'jotai-x';

import type { PlateEditor } from '../../editor/PlateEditor';
import type { PlateChangeKey, PlateStoreState } from './PlateStore';

import { createAtomStore } from '../../libs';
import { createPlateFallbackEditor } from '../../utils';
import {
  usePlateControllerExists,
  usePlateControllerStore,
} from '../plate-controller';

export type PlateStore = ReturnType<typeof usePlateStore>;

export const PLATE_SCOPE = 'plate';

export const GLOBAL_PLATE_SCOPE = Symbol('global-plate');

export const createPlateStore = <E extends PlateEditor = PlateEditor>({
  id,
  containerRef = { current: null },
  decorate = null,
  editor,
  isMounted = false,
  primary = true,
  readOnly = null,
  renderElement = null,
  renderLeaf = null,
  scrollRef = { current: null },
  versionDecorate = 1,
  versionEditor = 1,
  versionSelection = 1,
  versionValue = 1,
  onChange = null,
  onSelectionChange = null,
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
      readOnly,
      renderElement,
      renderLeaf,
      scrollRef,
      versionDecorate,
      versionEditor,
      versionSelection,
      versionValue,
      onChange,
      onSelectionChange,
      onValueChange,
      ...state,
    } as PlateStoreState<E>,
    {
      name: 'plate',
      suppressWarnings: true,
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
    }
  );

const {
  PlateProvider: PlateStoreProvider,
  plateStore,
  usePlateSet: usePlateLocalSet,
  usePlateState: usePlateLocalState,
  usePlateStore: usePlateLocalStore,
  usePlateValue: usePlateLocalValue,
} = createPlateStore();

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
  const fallbackStore = useMemo(createPlateStore, []).usePlateStore();

  if (!store) {
    if (plateControllerExists) {
      return fallbackStore;
    }

    throw new Error(
      `Plate hooks must be used inside a Plate or PlateController`
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

export const useEditorContainerRef = (id?: string) => {
  return useAtomStoreValue(usePlateStore(id), 'containerRef');
};

export const useEditorScrollRef = (id?: string) => {
  return useAtomStoreValue(usePlateStore(id), 'scrollRef');
};

/** Returns the scrollRef if it exists, otherwise returns the containerRef. */
export const useScrollRef = (id?: string) => {
  const scrollRef = useEditorScrollRef(id);
  const containerRef = useEditorContainerRef(id);

  return scrollRef.current ? scrollRef : containerRef;
};

export const useEditorMounted = (id?: string): boolean => {
  return !!useAtomStoreValue(usePlateStore(id), 'isMounted');
};

/**
 * Whether the editor is read-only. You can also use `useReadOnly` from
 * `slate-react` in node components.
 */
export const useEditorReadOnly = (id?: string): boolean => {
  return !!useAtomStoreValue(usePlateStore(id), 'readOnly');
};

/**
 * Get a reference to the editor instance that remains stable across re-renders.
 * The editor object is enhanced with a `store` property that provides access to
 * the Plate store.
 *
 * @example
 *   ```tsx
 *   const editor = useEditorRef();
 *   const readOnly = useAtomStoreValue(editor.store, 'readOnly');
 */
export const useEditorRef = <E extends PlateEditor = PlateEditor>(
  id?: string
): E & { store: PlateStore } => {
  const store = usePlateStore(id);
  const editor: any =
    (useAtomStoreValue(store, 'editor') as E) ?? createPlateFallbackEditor();

  editor.store = store;

  return editor;
};

/** Get the editor selection (deeply memoized). */
export const useEditorSelection = (id?: string) =>
  usePlateStore(id).useTrackedSelectionValue().selection;

/** Get editor state which is updated on editor change. */
export const useEditorState = <E extends PlateEditor = PlateEditor>(
  id?: string
): E => {
  return usePlateStore(id).useTrackedEditorValue().editor;
};

/** Version incremented on each editor change. */
export const useEditorVersion = (id?: string) => {
  return useAtomStoreValue(usePlateStore(id), 'versionEditor');
};

/** Version incremented on selection change. */
export const useSelectionVersion = (id?: string) => {
  return useAtomStoreValue(usePlateStore(id), 'versionSelection');
};

/** Get the editor value (deeply memoized). */
export const useEditorValue = (id?: string) =>
  usePlateStore(id).useTrackedValueValue().value;

/** Version incremented on value change. */
export const useValueVersion = (id?: string) => {
  return useAtomStoreValue(usePlateStore(id), 'versionValue');
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export const useIncrementVersion = (key: PlateChangeKey, id?: string) => {
  const previousVersionRef = React.useRef(1);

  const store = usePlateStore(id);

  const setVersionDecorate = useAtomStoreSet(store, 'versionDecorate');
  const setVersionSelection = useAtomStoreSet(store, 'versionSelection');
  const setVersionValue = useAtomStoreSet(store, 'versionValue');
  const setVersionEditor = useAtomStoreSet(store, 'versionEditor');

  return React.useCallback(() => {
    const nextVersion = previousVersionRef.current + 1;

    switch (key) {
      case 'versionDecorate': {
        setVersionDecorate(nextVersion);

        break;
      }
      case 'versionEditor': {
        setVersionEditor(nextVersion);

        break;
      }
      case 'versionSelection': {
        setVersionSelection(nextVersion);

        break;
      }
      case 'versionValue': {
        setVersionValue(nextVersion);

        break;
      }
    }

    previousVersionRef.current = nextVersion;
  }, [
    key,
    setVersionDecorate,
    setVersionEditor,
    setVersionSelection,
    setVersionValue,
  ]);
};

export const useRedecorate = (id?: string) => {
  const updateDecorate = useIncrementVersion('versionDecorate', id);

  return React.useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
