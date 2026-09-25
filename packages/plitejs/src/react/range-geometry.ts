import { useSyncExternalStore, type RefObject } from 'react';

import {
  getEditorRuntimeOwner,
  RangeApi,
  type Editor,
  type Range,
  type Value,
} from '..';
import { getEditorRuntimeRoot } from '../core/editor-runtime';
import { subscribeEditorViewState } from '../core/public-state';
import { DOMEditor } from '../dom';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_ROOT_VIEW_EDITORS,
  hasUsableDOMRect,
  scheduleEditorDOMPhase,
} from '../dom/internal';
import { subscribeEditorDOMScope } from '../dom/plugin/dom-editor';
import { findDOMRootRuntime } from '../dom/plugin/dom-root-runtime';
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';

type GeometryEditor = Editor<any, any>;

/** An immutable rectangle in viewport coordinates. */
export type ViewportRect = Readonly<{
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}>;

/** Immutable DOM geometry for one range in one mounted Editable. */
export type RangeGeometry = Readonly<{
  boundingRect: ViewportRect;
  focusRect: ViewportRect | null;
  rects: readonly ViewportRect[];
}>;

type RangeGeometrySource = Readonly<
  {
    subscribe: (view: GeometryEditor, listener: () => void) => () => void;
  } & (
    | { read: (view: GeometryEditor) => Range | null }
    | {
        measure: (
          view: GeometryEditor,
          editable: HTMLElement
        ) => RangeGeometry | null;
      }
  )
>;

export type RangeGeometryOwner = Readonly<{
  activate: () => () => void;
  getServerSnapshot: () => null;
  getSnapshot: () => RangeGeometry | null;
  refresh: () => void;
  subscribe: (listener: () => void) => () => void;
}>;

const toViewportRect = (rect: DOMRect | DOMRectReadOnly): ViewportRect =>
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

const isRectEqual = (left: ViewportRect, right: ViewportRect) =>
  left.bottom === right.bottom &&
  left.height === right.height &&
  left.left === right.left &&
  left.right === right.right &&
  left.top === right.top &&
  left.width === right.width &&
  left.x === right.x &&
  left.y === right.y;

const isGeometryEqual = (
  left: RangeGeometry | null,
  right: RangeGeometry | null
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

const unionRects = (rects: readonly ViewportRect[]): ViewportRect | null => {
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

export const measureDOMElementsGeometry = (
  elements: Iterable<Element>
): RangeGeometry | null => {
  const rects = Array.from(elements).flatMap((element) =>
    Array.from(element.getClientRects())
      .filter(hasUsableDOMRect)
      .map(toViewportRect)
  );
  const boundingRect = unionRects(rects);

  if (!boundingRect) return null;

  return Object.freeze({
    boundingRect,
    focusRect: null,
    rects: Object.freeze(rects),
  });
};

const isWithinEditable = (editable: HTMLElement, node: Node) =>
  editable === node || editable.contains(node);

const resolveViewEditor = (
  editor: GeometryEditor,
  editable: HTMLElement
): GeometryEditor | null => {
  const owner = getEditorRuntimeOwner(editor);
  const candidates = new Set<GeometryEditor>([
    editor,
    ...(EDITOR_TO_ROOT_VIEW_EDITORS.get(owner) ?? []),
  ]);

  for (const candidate of candidates) {
    if (getEditorRuntimeOwner(candidate) !== owner) continue;
    if (EDITOR_TO_ELEMENT.get(candidate) !== editable) continue;

    return candidate;
  }

  return null;
};

type GeometryCoordinatorScope = Readonly<{
  bindingChanged: () => void;
  getEditable: () => HTMLElement | null;
  getView: () => GeometryEditor | null;
  refresh: () => void;
}>;

type GeometryRootLease = {
  count: number;
  generation: number;
  runtime: ReturnType<typeof findDOMRootRuntime>;
  stopBinding: (() => void) | null;
  stopLayout: (() => void) | null;
  view: GeometryEditor | null;
};

type GeometryCoordinator = Readonly<{
  register: (
    scope: GeometryCoordinatorScope,
    editable: HTMLElement
  ) => () => void;
  request: (scope: GeometryCoordinatorScope) => void;
  syncBinding: (editable: HTMLElement) => void;
}>;

const EDITOR_TO_GEOMETRY_COORDINATORS = new WeakMap<
  GeometryEditor,
  WeakMap<Document, GeometryCoordinator>
>();

const createGeometryCoordinator = (
  document: Document,
  onEmpty: () => void
): GeometryCoordinator => {
  const scopes = new Set<GeometryCoordinatorScope>();
  const dirtyScopes = new Set<GeometryCoordinatorScope>();
  const rootLeases = new Map<HTMLElement, GeometryRootLease>();
  const window = document.defaultView;
  const resizeObserver = window?.ResizeObserver
    ? new window.ResizeObserver(() => requestAll())
    : null;
  let cancelScheduled: (() => void) | null = null;
  let scheduledEditable: HTMLElement | null = null;

  const scopesFor = (editable: HTMLElement) =>
    [...scopes].filter((scope) => scope.getEditable() === editable);

  const cancelScheduledFor = (editable: HTMLElement) => {
    if (scheduledEditable !== editable) return;

    cancelScheduled?.();
    cancelScheduled = null;
    scheduledEditable = null;
  };

  function flush() {
    cancelScheduled = null;
    scheduledEditable = null;
    const pending = [...dirtyScopes];

    dirtyScopes.clear();
    pending.forEach((scope) => {
      if (scopes.has(scope)) scope.refresh();
    });
  }

  function schedule() {
    if (cancelScheduled || dirtyScopes.size === 0) return;

    const schedulingScope = [...dirtyScopes].find((scope) => {
      const editable = scope.getEditable();
      const view = scope.getView();

      return Boolean(
        editable?.isConnected &&
        view &&
        EDITOR_TO_ELEMENT.get(view) === editable
      );
    });
    const view = schedulingScope?.getView() ?? null;
    const editable = schedulingScope?.getEditable() ?? null;

    if (!view || !editable) {
      flush();
      return;
    }

    scheduledEditable = editable;
    cancelScheduled = scheduleEditorDOMPhase(
      view,
      'dom-read',
      'Plite range geometry',
      flush,
      {
        key: 'plite-range-geometry',
        timing: 'animation-frame',
      }
    );
  }

  function requestAll() {
    scopes.forEach((scope) => dirtyScopes.add(scope));
    schedule();
  }

  function syncRootBinding(editable: HTMLElement) {
    const lease = rootLeases.get(editable);

    if (!lease) return;

    const view =
      scopesFor(editable)
        .map((scope) => scope.getView())
        .find(
          (candidate): candidate is GeometryEditor =>
            candidate !== null && EDITOR_TO_ELEMENT.get(candidate) === editable
        ) ?? null;
    const found = findDOMRootRuntime(editable);
    const runtime =
      found?.connected &&
      found.rootRef.current === editable &&
      found.editor === view
        ? found
        : null;
    const generation = runtime?.generation ?? -1;

    if (
      lease.view === view &&
      lease.runtime === runtime &&
      lease.generation === generation
    ) {
      return;
    }

    lease.stopBinding?.();
    lease.stopLayout?.();
    lease.stopBinding = null;
    lease.stopLayout = null;
    cancelScheduledFor(editable);
    lease.view = view;
    lease.runtime = runtime;
    lease.generation = generation;

    if (view) {
      lease.stopBinding = subscribeEditorDOMScope(view, () => {
        cancelScheduledFor(editable);
        scopesFor(editable).forEach((scope) => scope.bindingChanged());
        syncRootBinding(editable);
        schedule();
      });
    }
    if (runtime) {
      lease.stopLayout = runtime.subscribeLayout(() => {
        if (
          !runtime.connected ||
          runtime.generation !== generation ||
          runtime.rootRef.current !== editable
        ) {
          return;
        }
        scopesFor(editable).forEach((scope) => dirtyScopes.add(scope));
        schedule();
      });
    }
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
      const lease = rootLeases.get(editable) ?? {
        count: 0,
        generation: -1,
        runtime: null,
        stopBinding: null,
        stopLayout: null,
        view: null,
      };

      lease.count += 1;
      rootLeases.set(editable, lease);
      if (lease.count === 1) resizeObserver?.observe(editable);
      syncRootBinding(editable);
      let active = true;

      return () => {
        if (!active) return;

        active = false;
        scopes.delete(scope);
        dirtyScopes.delete(scope);
        lease.count -= 1;
        if (lease.count === 0) {
          lease.stopBinding?.();
          lease.stopLayout?.();
          cancelScheduledFor(editable);
          resizeObserver?.unobserve(editable);
          rootLeases.delete(editable);
        } else {
          syncRootBinding(editable);
        }
        if (scopes.size > 0) {
          schedule();
          return;
        }

        cancelScheduled?.();
        cancelScheduled = null;
        scheduledEditable = null;
        resizeObserver?.disconnect();
        document.removeEventListener('scroll', onViewportChange, true);
        window?.removeEventListener('resize', onViewportChange);
        window?.visualViewport?.removeEventListener('resize', onViewportChange);
        window?.visualViewport?.removeEventListener('scroll', onViewportChange);
        onEmpty();
      };
    },
    request(scope) {
      if (!scopes.has(scope)) return;

      dirtyScopes.add(scope);
      schedule();
    },
    syncBinding: syncRootBinding,
  };
};

const getGeometryCoordinator = (
  editor: GeometryEditor,
  document: Document
): GeometryCoordinator => {
  const owner = getEditorRuntimeOwner(editor);
  const coordinators =
    EDITOR_TO_GEOMETRY_COORDINATORS.get(owner) ?? new WeakMap();
  const existing = coordinators.get(document);

  if (existing) return existing;

  const coordinator = createGeometryCoordinator(document, () => {
    coordinators.delete(document);
  });

  coordinators.set(document, coordinator);
  EDITOR_TO_GEOMETRY_COORDINATORS.set(owner, coordinators);

  return coordinator;
};

export const measureRangeGeometry = (
  editor: GeometryEditor,
  editable: HTMLElement,
  range: Range
): RangeGeometry | null => {
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
      '[data-editor-zero-width]'
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

export function createRangeGeometryOwner<
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  source: RangeGeometrySource,
  editableRef: RefObject<HTMLElement | null>
): RangeGeometryOwner;
export function createRangeGeometryOwner(
  editor: GeometryEditor,
  source: RangeGeometrySource,
  editableRef: RefObject<HTMLElement | null>
): RangeGeometryOwner {
  const listeners = new Set<() => void>();
  let activeLeases = 0;
  let bindingGeneration = 0;
  let coordinator: GeometryCoordinator | null = null;
  let editable: HTMLElement | null = null;
  let range: Range | null = null;
  let rangeDirty = true;
  let releaseCoordinator: (() => void) | null = null;
  let snapshot: RangeGeometry | null = null;
  let unsubscribeRange: (() => void) | null = null;
  let unsubscribeViewState: (() => void) | null = null;
  let view: GeometryEditor | null = null;

  const measure = () => {
    if (activeLeases === 0) return;
    if (rangeDirty) {
      range = view && 'read' in source ? source.read(view) : null;
      rangeDirty = false;
    }
    const next =
      view && editable?.isConnected && EDITOR_TO_ELEMENT.get(view) === editable
        ? 'measure' in source
          ? source.measure(view, editable)
          : range
            ? measureRangeGeometry(view, editable, range)
            : null
        : null;

    if (isGeometryEqual(snapshot, next)) return;

    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const request = () => {
    if (activeLeases === 0) return;

    rangeDirty = true;
    if (coordinator) coordinator.request(scope);
    else measure();
  };

  const clearViewSubscriptions = () => {
    bindingGeneration += 1;
    unsubscribeRange?.();
    unsubscribeViewState?.();
    unsubscribeRange = null;
    unsubscribeViewState = null;
    range = null;
    rangeDirty = true;
  };

  const syncBinding = () => {
    const nextEditable = editableRef.current;
    const nextView = nextEditable?.isConnected
      ? resolveViewEditor(editor, nextEditable)
      : null;

    if (editable === nextEditable && view === nextView) return;

    const previousEditable = editable;

    clearViewSubscriptions();
    editable = nextEditable;
    view = nextView;
    if (previousEditable !== nextEditable) {
      releaseCoordinator?.();
      releaseCoordinator = null;
      coordinator = null;
    }
    if (!view || !editable?.isConnected) {
      releaseCoordinator?.();
      releaseCoordinator = null;
      coordinator = null;
      return;
    }

    const generation = bindingGeneration;
    const notify = () => {
      if (
        activeLeases === 0 ||
        generation !== bindingGeneration ||
        view !== nextView
      ) {
        return;
      }
      request();
    };

    unsubscribeRange = source.subscribe(view, notify);
    unsubscribeViewState = subscribeEditorViewState(view, notify);
    coordinator ??= getGeometryCoordinator(editor, editable.ownerDocument);
    releaseCoordinator ??= coordinator.register(scope, editable);
    coordinator.syncBinding(editable);
  };

  const scope: GeometryCoordinatorScope = {
    bindingChanged: () => {
      syncBinding();
      request();
    },
    getEditable: () => editable,
    getView: () => view,
    refresh: measure,
  };

  const refresh = () => {
    if (activeLeases === 0) return;

    syncBinding();
    rangeDirty = true;
    measure();
  };

  return {
    activate() {
      activeLeases += 1;
      if (activeLeases === 1) refresh();
      let released = false;

      return () => {
        if (released) return;

        released = true;
        activeLeases -= 1;
        queueMicrotask(() => {
          if (activeLeases > 0) return;

          clearViewSubscriptions();
          releaseCoordinator?.();
          releaseCoordinator = null;
          coordinator = null;
          editable = null;
          view = null;
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
}

export const useRangeGeometryOwner = (
  owner: RangeGeometryOwner
): RangeGeometry | null => {
  useIsomorphicLayoutEffect(() => owner.activate(), [owner]);
  useIsomorphicLayoutEffect(() => {
    owner.refresh();
    queueMicrotask(owner.refresh);
  });

  return useSyncExternalStore(
    owner.subscribe,
    owner.getSnapshot,
    owner.getServerSnapshot
  );
};
