import type { RefObject } from 'react';

import { getEditorRuntimeOwner, RangeApi, type Editor, type Range } from '..';
import { getEditorRuntimeRoot } from '../core/editor-runtime';
import { DOMEditor } from '../dom';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_ROOT_VIEW_EDITORS,
  hasUsableDOMRect,
  scheduleEditorDOMPhase,
} from '../dom/internal';
import type { PliteWidgetStore } from './widget-store';

/** An immutable rectangle in viewport coordinates. */
export type PliteViewportRect = Readonly<{
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}>;

/** Immutable DOM geometry for one Widget in one mounted Editable. */
export type PliteWidgetGeometry = Readonly<{
  boundingRect: PliteViewportRect;
  focusRect: PliteViewportRect | null;
  rects: readonly PliteViewportRect[];
}>;

const toViewportRect = (rect: DOMRect | DOMRectReadOnly): PliteViewportRect =>
  Object.freeze({
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  });

const isRectEqual = (left: PliteViewportRect, right: PliteViewportRect) =>
  left.bottom === right.bottom &&
  left.height === right.height &&
  left.left === right.left &&
  left.right === right.right &&
  left.top === right.top &&
  left.width === right.width &&
  left.x === right.x &&
  left.y === right.y;

const isGeometryEqual = (
  left: PliteWidgetGeometry | null,
  right: PliteWidgetGeometry | null
) => {
  if (left === right) return true;
  if (!left || !right) return false;
  if (!isRectEqual(left.boundingRect, right.boundingRect)) return false;
  if (left.focusRect && right.focusRect) {
    if (!isRectEqual(left.focusRect, right.focusRect)) return false;
  } else if (left.focusRect !== right.focusRect) {
    return false;
  }
  if (left.rects.length !== right.rects.length) return false;

  return left.rects.every((rect, index) => {
    const rightRect = right.rects[index];

    return Boolean(rightRect && isRectEqual(rect, rightRect));
  });
};

const unionRects = (
  rects: readonly PliteViewportRect[]
): PliteViewportRect | null => {
  if (rects.length === 0) return null;

  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return Object.freeze({
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
  });
};

const isWithinEditable = (editable: HTMLElement, node: Node) =>
  editable === node || editable.contains(node);

const resolveViewEditor = (
  editor: Editor,
  editable: HTMLElement
): Editor | null => {
  const owner = getEditorRuntimeOwner(editor);
  const candidates = new Set<Editor>([
    editor,
    ...(EDITOR_TO_ROOT_VIEW_EDITORS.get(owner) ?? []),
  ]);
  const editorIsView = editor !== owner;

  for (const candidate of candidates) {
    if (getEditorRuntimeOwner(candidate) !== owner) continue;
    if (EDITOR_TO_ELEMENT.get(candidate) !== editable) continue;
    if (
      editorIsView &&
      getEditorRuntimeRoot(candidate) !== getEditorRuntimeRoot(editor)
    ) {
      continue;
    }

    return candidate;
  }

  return null;
};

type GeometryCoordinatorScope = Readonly<{
  editor: Editor;
  getEditable: () => HTMLElement | null;
  refresh: () => void;
}>;

type GeometryCoordinator = Readonly<{
  register: (
    scope: GeometryCoordinatorScope,
    editable: HTMLElement
  ) => () => void;
  request: (scope: GeometryCoordinatorScope) => void;
}>;

const EDITOR_TO_GEOMETRY_COORDINATORS = new WeakMap<
  Editor,
  WeakMap<Document, GeometryCoordinator>
>();

const createGeometryCoordinator = (
  document: Document,
  onEmpty: () => void
): GeometryCoordinator => {
  const scopes = new Set<GeometryCoordinatorScope>();
  const dirtyScopes = new Set<GeometryCoordinatorScope>();
  const observedRoots = new Map<HTMLElement, number>();
  const window = document.defaultView;
  const resizeObserver = window?.ResizeObserver
    ? new window.ResizeObserver(() => requestAll())
    : null;
  let cancelScheduled: (() => void) | null = null;

  function flush() {
    cancelScheduled = null;
    const pending = [...dirtyScopes];

    dirtyScopes.clear();
    pending.forEach((scope) => {
      if (scopes.has(scope)) scope.refresh();
    });
  }

  function schedule() {
    if (cancelScheduled || dirtyScopes.size === 0) return;

    const viewEditor = [...dirtyScopes]
      .map((scope) => {
        const editable = scope.getEditable();

        return editable ? resolveViewEditor(scope.editor, editable) : null;
      })
      .find((editor): editor is Editor => editor !== null);

    if (!viewEditor) {
      flush();
      return;
    }

    cancelScheduled = scheduleEditorDOMPhase(
      viewEditor,
      'dom-read',
      'Plite Widget geometry',
      flush,
      {
        key: 'plite-widget-geometry',
        timing: 'animation-frame',
      }
    );
  }

  function request(scope: GeometryCoordinatorScope) {
    if (!scopes.has(scope)) return;

    dirtyScopes.add(scope);
    schedule();
  }

  function requestAll() {
    scopes.forEach((scope) => dirtyScopes.add(scope));
    schedule();
  }

  const onViewportChange = () => requestAll();

  document.addEventListener('scroll', onViewportChange, {
    capture: true,
    passive: true,
  });
  window?.addEventListener('resize', onViewportChange, { passive: true });
  window?.visualViewport?.addEventListener('resize', onViewportChange, {
    passive: true,
  });
  window?.visualViewport?.addEventListener('scroll', onViewportChange, {
    passive: true,
  });

  return {
    register(scope, editable) {
      scopes.add(scope);
      const rootLeaseCount = observedRoots.get(editable) ?? 0;

      observedRoots.set(editable, rootLeaseCount + 1);
      if (rootLeaseCount === 0) resizeObserver?.observe(editable);

      let active = true;

      return () => {
        if (!active) return;

        active = false;
        scopes.delete(scope);
        dirtyScopes.delete(scope);
        const nextRootLeaseCount = (observedRoots.get(editable) ?? 1) - 1;

        if (nextRootLeaseCount === 0) {
          observedRoots.delete(editable);
          resizeObserver?.unobserve(editable);
        } else {
          observedRoots.set(editable, nextRootLeaseCount);
        }
        if (scopes.size > 0) return;

        cancelScheduled?.();
        cancelScheduled = null;
        resizeObserver?.disconnect();
        document.removeEventListener('scroll', onViewportChange, true);
        window?.removeEventListener('resize', onViewportChange);
        window?.visualViewport?.removeEventListener('resize', onViewportChange);
        window?.visualViewport?.removeEventListener('scroll', onViewportChange);
        onEmpty();
      };
    },
    request,
  };
};

const getGeometryCoordinator = (
  editor: Editor,
  document: Document
): GeometryCoordinator => {
  const owner = getEditorRuntimeOwner(editor);
  const coordinators =
    EDITOR_TO_GEOMETRY_COORDINATORS.get(owner) ?? new WeakMap();
  const existing = coordinators.get(document);

  if (existing) return existing;

  const coordinator = createGeometryCoordinator(document, () => {
    coordinators.delete(document);
    if (!coordinators.has(document)) {
      EDITOR_TO_GEOMETRY_COORDINATORS.set(owner, coordinators);
    }
  });

  coordinators.set(document, coordinator);
  EDITOR_TO_GEOMETRY_COORDINATORS.set(owner, coordinators);

  return coordinator;
};

const resolveRangeGeometry = (
  editor: Editor,
  editable: HTMLElement,
  range: Range
): PliteWidgetGeometry | null => {
  const rangeRoot = range.anchor.root ?? range.focus.root;

  if (rangeRoot && getEditorRuntimeRoot(editor) !== rangeRoot) return null;

  let domRange: globalThis.Range;
  let focusDOMRange: globalThis.Range;

  try {
    const resolvedRange = DOMEditor.resolveDOMRange(editor, range);
    const resolvedFocusRange = DOMEditor.resolveDOMRange(editor, {
      anchor: range.focus,
      focus: range.focus,
    });

    if (!resolvedRange || !resolvedFocusRange) return null;
    domRange = resolvedRange;
    focusDOMRange = resolvedFocusRange;
  } catch {
    return null;
  }

  if (
    !isWithinEditable(editable, domRange.startContainer) ||
    !isWithinEditable(editable, domRange.endContainer) ||
    !isWithinEditable(editable, focusDOMRange.startContainer)
  ) {
    return null;
  }

  let focusDOMRect: DOMRect | null = focusDOMRange.getBoundingClientRect();

  if (!hasUsableDOMRect(focusDOMRect)) {
    const focusContainer =
      focusDOMRange.startContainer.nodeType === 1
        ? (focusDOMRange.startContainer as Element)
        : focusDOMRange.startContainer.parentElement;
    const emptyLine = focusContainer?.closest<HTMLElement>(
      '[data-plite-zero-width]'
    );

    focusDOMRect = emptyLine?.getBoundingClientRect() ?? null;
  }

  const focusRect = hasUsableDOMRect(focusDOMRect)
    ? toViewportRect(focusDOMRect)
    : null;
  const rects = RangeApi.isCollapsed(range)
    ? []
    : Array.from(domRange.getClientRects(), toViewportRect);
  const boundingRect = unionRects(rects) ?? focusRect;

  if (!boundingRect) return null;

  return Object.freeze({
    boundingRect,
    focusRect,
    rects: Object.freeze(rects),
  });
};

export const measurePliteWidgetGeometry = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: PliteWidgetStore<T, TAnnotation>,
  id: string,
  editable: HTMLElement | null
): PliteWidgetGeometry | null => {
  if (!editable?.isConnected) return null;

  const editor = resolveViewEditor(store.editor, editable);
  const widget = store.getWidget(id);

  if (!editor || !widget?.available) return null;

  if (widget.target.type === 'node') {
    let element: HTMLElement | null = null;

    try {
      element = DOMEditor.resolveDOMNode(editor, widget.target.nodeKey);
    } catch {
      return null;
    }
    if (!element || !isWithinEditable(editable, element)) return null;

    const boundingRect = toViewportRect(element.getBoundingClientRect());

    return Object.freeze({
      boundingRect,
      focusRect: null,
      rects: Object.freeze([boundingRect]),
    });
  }

  if (!widget.range) return null;

  return resolveRangeGeometry(editor, editable, widget.range);
};

type PliteWidgetGeometryOwner = Readonly<{
  activate: () => () => void;
  getServerSnapshot: () => null;
  getSnapshot: () => PliteWidgetGeometry | null;
  refresh: () => void;
  subscribe: (listener: () => void) => () => void;
}>;

export const createPliteWidgetGeometryOwner = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: PliteWidgetStore<T, TAnnotation>,
  id: string,
  editableRef: RefObject<HTMLElement | null>
): PliteWidgetGeometryOwner => {
  const getEditable = () => editableRef.current;
  const listeners = new Set<() => void>();
  let activeLeases = 0;
  let activeCoordinator: GeometryCoordinator | null = null;
  let activeConnected = false;
  let activeEditable: HTMLElement | null = null;
  let releaseCoordinator: (() => void) | null = null;
  let snapshot: PliteWidgetGeometry | null = null;
  let unsubscribeWidget: (() => void) | null = null;

  const measure = () => {
    const next = measurePliteWidgetGeometry(store, id, getEditable());

    if (isGeometryEqual(snapshot, next)) return;

    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const scope: GeometryCoordinatorScope = {
    editor: store.editor,
    getEditable,
    refresh: measure,
  };

  const syncCoordinator = () => {
    const editable = getEditable();
    const connected = Boolean(editable?.isConnected);

    if (editable === activeEditable && connected === activeConnected) return;

    releaseCoordinator?.();
    releaseCoordinator = null;
    activeCoordinator = null;
    activeEditable = editable;
    activeConnected = connected;

    if (!editable || !connected) return;

    activeCoordinator = getGeometryCoordinator(
      store.editor,
      editable.ownerDocument
    );
    releaseCoordinator = activeCoordinator.register(scope, editable);
  };

  const refresh = () => {
    syncCoordinator();
    measure();
  };

  const invalidate = () => {
    syncCoordinator();
    if (activeCoordinator) {
      activeCoordinator.request(scope);
    } else {
      measure();
    }
  };

  return {
    activate() {
      activeLeases += 1;
      if (activeLeases === 1) {
        unsubscribeWidget = store.subscribeWidget(id, invalidate);
        refresh();
      }

      let released = false;

      return () => {
        if (released) return;

        released = true;
        activeLeases -= 1;

        queueMicrotask(() => {
          if (activeLeases > 0) return;

          unsubscribeWidget?.();
          unsubscribeWidget = null;
          releaseCoordinator?.();
          releaseCoordinator = null;
          activeCoordinator = null;
          activeConnected = false;
          activeEditable = null;
          snapshot = null;
        });
      };
    },
    getServerSnapshot: () => null,
    getSnapshot: () => snapshot,
    refresh,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};
