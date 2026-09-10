import type { Editor } from '../../editor';

const documents = new WeakMap<
  Document,
  {
    last: { editor: Editor; element: HTMLElement } | null;
    listeners: Map<Editor, Set<() => void>>;
  }
>();

export function getDocumentFocus(document: Document) {
  let state = documents.get(document);
  if (!state) {
    state = { last: null, listeners: new Map() };
    documents.set(document, state);
  }
  const current = state;
  const publish = (last: typeof current.last) => {
    const previous = current.last?.editor;
    current.last = last;
    if (previous === last?.editor) return;
    if (previous) {
      current.listeners.get(previous)?.forEach((listener) => listener());
    }
    if (last) {
      current.listeners.get(last.editor)?.forEach((listener) => listener());
    }
  };
  return {
    isLast: (editor: Editor) => current.last?.editor === editor,
    focus: (editor: Editor, element: HTMLElement) =>
      publish({ editor, element }),
    dispose: (element: HTMLElement) => {
      if (current.last?.element === element) publish(null);
    },
    subscribe: (editor: Editor, listener: () => void) => {
      let listeners = current.listeners.get(editor);
      if (!listeners) {
        listeners = new Set();
        current.listeners.set(editor, listeners);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (
          listeners.size === 0 &&
          current.listeners.get(editor) === listeners
        ) {
          current.listeners.delete(editor);
        }
      };
    },
  };
}

export function bindDocumentFocus(
  editor: Editor,
  element: HTMLElement,
  onFocus: () => void
) {
  const owner = getDocumentFocus(element.ownerDocument);
  const focus = () => {
    const root = element.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    if (active?.closest('[data-plite-editor]') !== element) return;
    owner.focus(editor, element);
    onFocus();
  };
  let active = true;
  element.addEventListener('focusin', focus);
  focus();
  return () => {
    if (!active) return;
    active = false;
    element.removeEventListener('focusin', focus);
    owner.dispose(element);
  };
}
