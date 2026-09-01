import type { RootKey } from '..';
import { isDOMNode } from '../dom';
import {
  createDecorationSource,
  type PliteDecorationSource,
} from './decoration-source';
import { readRuntimeSelectionRange } from './editable/runtime-selection-state';
import type { ReactRuntimeEditor } from './plugin/react-editor';
import type { PliteProjectionRuntimeScope } from './projection-store';
import { MAIN_ROOT_KEY } from './root-key';
import { createMainRootPliteViewSelection } from './view-selection';
import { createPliteViewSelectionDecorations } from './view-selection-decoration';

export const PLITE_KEEP_SELECTION_VISIBLE_ATTRIBUTE =
  'data-plite-keep-selection-visible';

export type PliteInactiveSelectionDecorationData = Readonly<{
  pliteInactiveSelection: true;
  root: RootKey;
}>;

export type PliteInactiveSelectionStore = Readonly<{
  getSnapshot: () => boolean;
  setVisible: (visible: boolean) => void;
  subscribe: (listener: () => void) => () => void;
}>;

type PliteDocumentFocusCoordinator = Readonly<{
  register: (store: PliteInactiveSelectionStore) => () => void;
  resolveBlur: (
    store: PliteInactiveSelectionStore,
    relatedTarget: EventTarget | null
  ) => void;
  setVisible: (store: PliteInactiveSelectionStore, visible: boolean) => void;
}>;

const DOCUMENT_TO_FOCUS_COORDINATOR = new WeakMap<
  Document,
  PliteDocumentFocusCoordinator
>();
const EDITOR_TO_INACTIVE_SELECTION_COUNT = new WeakMap<
  ReactRuntimeEditor<any>,
  number
>();

export const isPliteInactiveSelectionVisible = (
  editor: ReactRuntimeEditor<any>
) => (EDITOR_TO_INACTIVE_SELECTION_COUNT.get(editor) ?? 0) > 0;

const getPliteDocumentFocusCoordinator = (
  document: Document
): PliteDocumentFocusCoordinator => {
  const existing = DOCUMENT_TO_FOCUS_COORDINATOR.get(document);

  if (existing) return existing;

  let activeStore: PliteInactiveSelectionStore | null = null;
  let pendingStore: PliteInactiveSelectionStore | null = null;
  let registrations = 0;
  const clear = () => {
    const store = activeStore;

    activeStore = null;
    pendingStore = null;
    store?.setVisible(false);
  };
  const activate = (store: PliteInactiveSelectionStore) => {
    const previousStore = activeStore;

    activeStore = store;
    pendingStore = null;
    if (previousStore !== store) previousStore?.setVisible(false);
    store.setVisible(true);
  };
  const defer = (store: PliteInactiveSelectionStore) => {
    const previousStore = activeStore;

    activeStore = null;
    pendingStore = store;
    previousStore?.setVisible(false);
    if (previousStore !== store) store.setVisible(false);
  };
  const eventKeepsSelectionVisible = (event: FocusEvent) =>
    event.composedPath().some(keepsPliteSelectionVisible);
  const onFocusIn = (event: FocusEvent) => {
    if (!eventKeepsSelectionVisible(event)) {
      clear();

      return;
    }

    if (pendingStore) activate(pendingStore);
  };
  const onFocusOut = (event: FocusEvent) => {
    if (keepsPliteSelectionVisible(event.relatedTarget)) return;

    if (activeStore) defer(activeStore);
  };
  const onWindowBlur = () => clear();
  const coordinator = Object.freeze({
    register(store: PliteInactiveSelectionStore) {
      if (registrations === 0) {
        document.addEventListener('focusin', onFocusIn, true);
        document.addEventListener('focusout', onFocusOut, true);
        document.defaultView?.addEventListener('blur', onWindowBlur);
      }
      registrations += 1;
      let registered = true;

      return () => {
        if (!registered) return;

        registered = false;
        registrations -= 1;
        if (activeStore === store || pendingStore === store) clear();

        if (registrations === 0) {
          document.removeEventListener('focusin', onFocusIn, true);
          document.removeEventListener('focusout', onFocusOut, true);
          document.defaultView?.removeEventListener('blur', onWindowBlur);
          DOCUMENT_TO_FOCUS_COORDINATOR.delete(document);
        }
      };
    },
    resolveBlur(
      store: PliteInactiveSelectionStore,
      relatedTarget: EventTarget | null
    ) {
      if (keepsPliteSelectionVisible(relatedTarget)) {
        activate(store);

        return;
      }

      defer(store);
    },
    setVisible(store: PliteInactiveSelectionStore, visible: boolean) {
      if (!visible) {
        if (activeStore === store) activeStore = null;
        if (pendingStore === store) pendingStore = null;
        store.setVisible(false);

        return;
      }

      activate(store);
    },
  });

  DOCUMENT_TO_FOCUS_COORDINATOR.set(document, coordinator);

  return coordinator;
};

export const createPliteInactiveSelectionStore = (
  editor?: ReactRuntimeEditor<any>
): PliteInactiveSelectionStore => {
  const listeners = new Set<() => void>();
  let visible = false;

  return Object.freeze({
    getSnapshot: () => visible,
    setVisible(nextVisible) {
      if (visible === nextVisible) return;

      visible = nextVisible;
      if (editor) {
        const nextCount = Math.max(
          0,
          (EDITOR_TO_INACTIVE_SELECTION_COUNT.get(editor) ?? 0) +
            (visible ? 1 : -1)
        );

        if (nextCount === 0) {
          EDITOR_TO_INACTIVE_SELECTION_COUNT.delete(editor);
        } else {
          EDITOR_TO_INACTIVE_SELECTION_COUNT.set(editor, nextCount);
        }
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  });
};

const getComposedParentElement = (element: Element): Element | null => {
  if (element.parentElement) return element.parentElement;

  const root = element.getRootNode();
  const ShadowRootConstructor = element.ownerDocument.defaultView?.ShadowRoot;

  return ShadowRootConstructor && root instanceof ShadowRootConstructor
    ? root.host
    : null;
};

export const keepsPliteSelectionVisible = (
  target: EventTarget | null | undefined
) => {
  if (!isDOMNode(target)) return false;

  let element =
    target.nodeType === 1 ? (target as Element) : target.parentElement;

  while (element) {
    if (element.hasAttribute(PLITE_KEEP_SELECTION_VISIBLE_ATTRIBUTE)) {
      return true;
    }

    element = getComposedParentElement(element);
  }

  return false;
};

export const registerPliteInactiveSelectionFocus = (
  document: Document,
  store: PliteInactiveSelectionStore
) => getPliteDocumentFocusCoordinator(document).register(store);

export const resolvePliteInactiveSelectionBlur = (
  document: Document,
  store: PliteInactiveSelectionStore,
  relatedTarget: EventTarget | null
) =>
  getPliteDocumentFocusCoordinator(document).resolveBlur(store, relatedTarget);

export const setPliteInactiveSelectionVisible = (
  document: Document,
  store: PliteInactiveSelectionStore,
  visible: boolean
) => getPliteDocumentFocusCoordinator(document).setVisible(store, visible);

export const createPliteInactiveSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  store: PliteInactiveSelectionStore,
  {
    root,
    runtimeScope,
  }: {
    root: RootKey;
    runtimeScope?: PliteProjectionRuntimeScope;
  }
): PliteDecorationSource<PliteInactiveSelectionDecorationData> =>
  createDecorationSource(editor, {
    dirtiness: ['node', 'selection', 'text', 'external'],
    id: 'plite-inactive-selection',
    read: (context) => {
      if (!store.getSnapshot()) return [];

      const selection = readRuntimeSelectionRange(editor);

      return selection
        ? createPliteViewSelectionDecorations(
            editor,
            createMainRootPliteViewSelection(selection, root),
            context,
            {
              data: ({ root: segmentRoot }) => ({
                pliteInactiveSelection: true,
                root: segmentRoot,
              }),
              sourceId: 'plite-inactive-selection',
            }
          )
        : [];
    },
    runtimeScope,
  });

export const hasVisiblePliteInactiveSelectionDecoration = (
  slices: ReadonlyArray<{ data?: unknown }>,
  root: RootKey | null
) =>
  slices.some(({ data }) => {
    if (typeof data !== 'object' || data === null) return false;

    const selection = data as Partial<PliteInactiveSelectionDecorationData>;

    return (
      selection.pliteInactiveSelection === true &&
      selection.root === (root ?? MAIN_ROOT_KEY)
    );
  });
