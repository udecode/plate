type LastFocus = { focused: HTMLElement; tracked: HTMLElement };

const documents = new WeakMap<
  Document,
  {
    last: LastFocus | null;
    listeners: Map<HTMLElement, Set<() => void>>;
  }
>();
const trackedEditables = new WeakSet<HTMLElement>();

export function getLastEditableTracker(document: Document) {
  let state = documents.get(document);
  if (!state) {
    state = { last: null, listeners: new Map() };
    documents.set(document, state);
  }
  const current = state;
  const publish = (last: LastFocus | null) => {
    const previous = current.last;
    current.last = last;
    if (
      previous?.tracked === last?.tracked &&
      previous?.focused === last?.focused
    ) {
      return;
    }
    for (const element of new Set([
      previous?.tracked,
      previous?.focused,
      last?.tracked,
      last?.focused,
    ])) {
      if (element) {
        current.listeners.get(element)?.forEach((listener) => listener());
      }
    }
  };
  return {
    isLast: (element: HTMLElement) =>
      current.last?.tracked === element ||
      (current.last?.focused === element && element.isConnected),
    focus: (last: LastFocus) => publish(last),
    dispose: (element: HTMLElement) => {
      if (current.last?.tracked === element) publish(null);
    },
    subscribe: (element: HTMLElement, listener: () => void) => {
      let listeners = current.listeners.get(element);
      if (!listeners) {
        listeners = new Set();
        current.listeners.set(element, listeners);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (
          listeners.size === 0 &&
          current.listeners.get(element) === listeners
        ) {
          current.listeners.delete(element);
        }
      };
    },
  };
}

export function trackEditableFocus(
  element: HTMLElement,
  onOwnFocus: () => void
) {
  const owner = getLastEditableTracker(element.ownerDocument);
  const focus = () => {
    const root = element.getRootNode() as Document | ShadowRoot;
    const focused = root.activeElement?.closest<HTMLElement>('[data-editor]');
    if (!focused || !element.contains(focused)) return;
    let tracked: HTMLElement | null = focused;
    while (tracked && !trackedEditables.has(tracked)) {
      tracked =
        tracked.parentElement?.closest<HTMLElement>('[data-editor]') ?? null;
    }
    if (tracked !== element) return;
    owner.focus({ focused, tracked });
    if (focused === element) onOwnFocus();
  };
  let active = true;
  trackedEditables.add(element);
  element.addEventListener('focusin', focus);
  focus();
  return () => {
    if (!active) return;
    active = false;
    trackedEditables.delete(element);
    element.removeEventListener('focusin', focus);
    owner.dispose(element);
  };
}
