import React from 'react';

import { atom } from 'jotai';

import type { PlateEditor } from '../../editor/PlateEditor';
import type { PlateChangeKey, PlateStoreState } from './PlateStore';

import { createAtomStore } from '../../libs';
import { createPlateFallbackEditor } from '../../utils';
import {
  usePlateControllerExists,
  usePlateControllerStore,
} from '../plate-controller';

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

export const {
  PlateProvider: PlateStoreProvider,
  plateStore,
  usePlateStore: usePlateLocalStore,
} = createPlateStore();

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

  const fallbackStore = React.useRef<typeof localStore>(undefined);

  if (!store) {
    if (plateControllerExists) {
      if (!fallbackStore.current) {
        fallbackStore.current =
          createPlateStore().usePlateStore() as unknown as typeof localStore;
      }
      return fallbackStore.current!;
    }

    throw new Error(
      `Plate hooks must be used inside a Plate or PlateController`
    );
  }
  return store;
};

// ─── Selectors ───────────────────────────────────────────────────────────────

/** Get the closest `Plate` id. */
export const useEditorId = (): string => usePlateStore().useEditorValue().id;

export const useEditorContainerRef = (id?: string) => {
  return usePlateStore(id).useContainerRefValue();
};

export const useEditorScrollRef = (id?: string) => {
  return usePlateStore(id).useScrollRefValue();
};

/** Returns the scrollRef if it exists, otherwise returns the containerRef. */
export const useScrollRef = (id?: string) => {
  const scrollRef = useEditorScrollRef(id);
  const containerRef = useEditorContainerRef(id);

  return scrollRef.current ? scrollRef : containerRef;
};

export const useEditorMounted = (id?: string): boolean => {
  return !!usePlateStore(id).useIsMountedValue();
};

/**
 * Whether the editor is read-only. You can also use `useReadOnly` from
 * `slate-react` in node components.
 */
export const useEditorReadOnly = (id?: string): boolean => {
  return !!usePlateStore(id).useReadOnlyValue();
};

/** Get editor ref which is never updated. */
export const useEditorRef = <E extends PlateEditor = PlateEditor>(
  id?: string
): E => {
  return (
    (usePlateStore(id).useEditorValue() as E) ?? createPlateFallbackEditor()
  );
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
  return usePlateStore(id).useVersionValueValue();
};

/** Version incremented on selection change. */
export const useSelectionVersion = (id?: string) => {
  return usePlateStore(id).useVersionSelectionValue();
};

/** Get the editor value (deeply memoized). */
export const useEditorValue = (id?: string) =>
  usePlateStore(id).useTrackedValueValue().value;

/** Version incremented on value change. */
export const useValueVersion = (id?: string) => {
  return usePlateStore(id).useVersionValueValue();
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export const useIncrementVersion = (key: PlateChangeKey, id?: string) => {
  const previousVersionRef = React.useRef(1);

  const store = usePlateStore(id);

  const setVersionDecorate = store.useSetVersionDecorate();
  const setVersionSelection = store.useSetVersionSelection();
  const setVersionValue = store.useSetVersionEditor();

  return React.useCallback(() => {
    const nextVersion = previousVersionRef.current + 1;

    switch (key) {
      case 'versionDecorate': {
        setVersionDecorate(nextVersion);

        break;
      }
      case 'versionEditor': {
        setVersionValue(nextVersion);

        break;
      }
      case 'versionSelection': {
        setVersionSelection(nextVersion);

        break;
      }
      // No default
    }

    previousVersionRef.current = nextVersion;
  }, [key, setVersionDecorate, setVersionSelection, setVersionValue]);
};

export const useRedecorate = (id?: string) => {
  const updateDecorate = useIncrementVersion('versionDecorate', id);

  return React.useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
