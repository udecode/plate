import { type NodeKey, PathApi, RangeApi } from '..';
import { isDOMNode } from '../dom';
import type { PliteDecorationSource } from './decoration-source';
import {
  getSnapshot as editorGetSnapshot,
  subscribeSource as editorSubscribeSource,
} from './editable/runtime-editor-api';
import { readRuntimeSelectionRange } from './editable/runtime-selection-state';
import type { ReactRuntimeEditor } from './plugin/react-editor';

export const PLITE_KEEP_SELECTION_VISIBLE_ATTRIBUTE =
  'data-plite-keep-selection-visible';

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
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;

    const path = event.composedPath();
    const editable = path.find(
      (target): target is Element =>
        isDOMNode(target) &&
        target.nodeType === 1 &&
        (target as Element).hasAttribute('contenteditable')
    );

    if (editable?.getAttribute('contenteditable') === 'false') return;
    if (!editable && path.some(keepsPliteSelectionVisible)) return;

    clear();
  };
  const onWindowBlur = () => clear();
  const coordinator = Object.freeze({
    register(store: PliteInactiveSelectionStore) {
      if (registrations === 0) {
        document.addEventListener('pointerdown', onPointerDown, true);
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
          document.removeEventListener('pointerdown', onPointerDown, true);
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
  id: string
): PliteDecorationSource<unknown> => {
  const getInputKey = () => {
    const selection = readRuntimeSelectionRange(editor);

    if (!selection || RangeApi.isCollapsed(selection)) return null;

    return editorGetSnapshot(editor).index.keyAt(
      RangeApi.edges(selection)[0].path
    );
  };

  return Object.freeze({
    id,
    observe: ({ refresh }) => {
      let previousInputKey = getInputKey();

      refresh({
        nodeKeys: previousInputKey ? [previousInputKey] : [],
      });
      const refreshAffectedInputs = () => {
        const nextInputKey = getInputKey();
        const nodeKeys = new Set<NodeKey>();

        if (previousInputKey) nodeKeys.add(previousInputKey);
        if (nextInputKey) nodeKeys.add(nextInputKey);

        if (nodeKeys.size > 0) refresh({ nodeKeys: [...nodeKeys] });
        previousInputKey = nextInputKey;
      };
      const unsubscribeStore = store.subscribe(refreshAffectedInputs);
      const unsubscribeSelection = editorSubscribeSource(
        editor,
        'selection',
        refreshAffectedInputs
      );

      return () => {
        unsubscribeSelection();
        unsubscribeStore();
      };
    },
    read: ({ entry: [, path] }) => {
      if (!store.getSnapshot()) return [];

      const selection = readRuntimeSelectionRange(editor);

      if (!selection || RangeApi.isCollapsed(selection)) return [];
      if (!PathApi.equals(RangeApi.edges(selection)[0].path, path)) return [];

      return [
        {
          attributes: { 'data-plite-inactive-selection': '' },
          key: `${id}:range`,
          range: selection,
        },
      ];
    },
  });
};
