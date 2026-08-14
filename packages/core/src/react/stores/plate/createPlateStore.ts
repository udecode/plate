import React from 'react';

import {
  type EditorCommit,
  type EditorStateView,
  type ExtensionsOf,
  RangeApi,
  type Selection,
  type ValueOf,
} from '@platejs/plite';
import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from '@platejs/plite-react';

import { useAtomStoreSet, useAtomStoreState, useAtomStoreValue } from 'jotai-x';

import type { PlateStoreEditor, PlateStoreState } from './PlateStore';

import { createAtomStore } from '../../libs';
import { createPlateEditor, type PlateEditor } from '../../editor';
import {
  usePlateControllerExists,
  usePlateControllerStore,
} from '../plate-controller';

export type PlateStore = ReturnType<typeof usePlateStore>;
export type PlateEditorWithStore<E = PlateEditor> = E & { store: PlateStore };

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

export const createPlateStore = <E = PlateStoreEditor>({
  containerRef = { current: null },
  decorate = null,
  editor,
  isMounted = false,
  primary = true,
  renderElement = null,
  renderLeaf = null,
  renderText = null,
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

let fallbackEditor: PlateStoreEditor | null = null;
const fallbackEditors = new WeakSet<object>();

const getFallbackEditor = (): PlateStoreEditor => {
  if (!fallbackEditor) {
    fallbackEditor = createPlateEditor();
    fallbackEditors.add(fallbackEditor);
  }

  return fallbackEditor;
};

const { usePlateStore: useFallbackPlateStore } = createPlateStore();

type BasePlateStoreProviderProps = React.ComponentProps<
  typeof BasePlateStoreProvider
>;

export type PlateStoreProviderProps<E = PlateStoreEditor> = Omit<
  BasePlateStoreProviderProps,
  keyof PlateStoreState | 'editor'
> &
  Partial<PlateStoreState<E>> & {
    editor: E;
  };

const PlateStoreProvider = BasePlateStoreProvider as unknown as <
  E = PlateStoreEditor,
>(
  props: PlateStoreProviderProps<E>
) => React.ReactElement | null;

export {
  plateStore,
  PlateStoreProvider,
  usePlateLocalStore,
  usePlateLocalValue,
};

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
export const useEditorId = (): string => useEditor().id;

export const useEditorMounted = (id?: string): boolean =>
  !!useAtomStoreValue(usePlateStore(id), 'isMounted');

export type UseEditorOptions = {
  id?: string;
};

const useInternalEditor = (id?: string): PlateEditorWithStore => {
  const store = usePlateStore(id);
  const editor = ((useAtomStoreValue(store, 'editor') as
    | PlateEditor
    | undefined) ?? getFallbackEditor()) as PlateEditorWithStore;

  editor.store = store;

  return editor;
};

/** Get the mounted editor, throwing while no matching editor is active. */
export function useEditor(
  options: UseEditorOptions = {}
): PlateEditorWithStore {
  const editor = useInternalEditor(options.id);

  if (fallbackEditors.has(editor)) {
    throw new Error('useEditor() requires an active Plate editor.');
  }

  return editor;
}

/** Get the active editor, or `null` while its controller has no editor. */
export function useActiveEditor(
  options: UseEditorOptions = {}
): PlateEditorWithStore | null {
  const editor = useInternalEditor(options.id);

  if (fallbackEditors.has(editor)) return null;

  return editor;
}

/** Get the editor selection (deeply memoized). */
export const useEditorSelection = (id?: string) => {
  const editor = useInternalEditor(id);

  return useEditorRuntimeState(editor, (state) => state.selection(), {
    equalityFn: selectionEqual,
    shouldUpdate: selectionChanged,
  });
};

export type UseEditorStateOptions<T> = EditorRuntimeStateSelectorOptions<
  T,
  PlateEditor
> &
  UseEditorOptions;

/** Subscribe to a value derived from the immutable editor state. */
export const useEditorState = <T>(
  selector: (
    state: EditorStateView<ValueOf<PlateEditor>, ExtensionsOf<PlateEditor>>
  ) => T,
  { id, ...options }: UseEditorStateOptions<T> = {}
): T => useEditorRuntimeState(useInternalEditor(id), selector, options);

/** Get the editor value (deeply memoized). */
export const useEditorValue = (id?: string) => {
  const editor = useInternalEditor(id);

  return useEditorRuntimeState(editor, (state) => state.children(), {
    shouldUpdate: childrenChanged,
  });
};
