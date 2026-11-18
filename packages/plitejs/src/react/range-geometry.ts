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
import {
  type ClipChain,
  intersectClipChain,
  walkClipChain,
} from '../dom/plugin/dom-drag-scroll';
import { subscribeEditorDOMScope } from '../dom/plugin/dom-editor';
import { findDOMRootRuntime } from '../dom/plugin/dom-root-runtime';
import { getFlatTreeParentElement } from '../dom/utils/dom';
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

/** The boxes of one range in viewport coordinates. */
export type RangeRects = Readonly<{
  boundingRect: ViewportRect;
  focusRect: ViewportRect | null;
  rects: readonly ViewportRect[];
}>;

/** Immutable DOM geometry for one range in one mounted Editable. */
export type RangeGeometry = RangeRects &
  Readonly<{
    /**
     * The part of the Editable anyone can see: the viewport cut by every box
     * that clips the Editable, its own box included when its overflow clips.
     * Every range of one Editable shares it in a frame. `null` when none shows.
     */
    clipRect: ViewportRect | null;
    /**
     * The range's boxes cut to `clipRect`, each line outside it dropped. A
     * line that only touches the edge is outside; a caret on the edge is
     * inside. `null` when nothing of the range is inside. Show or hide by it,
     * and draw inside `clipRect`.
     */
    visible: RangeRects | null;
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
        ) => RangeRects | null;
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

const boxRect = (
  left: number,
  top: number,
  right: number,
  bottom: number
): ViewportRect =>
  Object.freeze({
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
  });

const isRectEqual = (left: ViewportRect | null, right: ViewportRect | null) =>
  left === right ||
  (!!left &&
    !!right &&
    left.bottom === right.bottom &&
    left.height === right.height &&
    left.left === right.left &&
    left.right === right.right &&
    left.top === right.top &&
    left.width === right.width &&
    left.x === right.x &&
    left.y === right.y);

const isRangeRectsEqual = (
  left: RangeRects | null,
  right: RangeRects | null
): boolean =>
  left === right ||
  (!!left &&
    !!right &&
    isRectEqual(left.boundingRect, right.boundingRect) &&
    isRectEqual(left.focusRect, right.focusRect) &&
    left.rects.length === right.rects.length &&
    left.rects.every((rect, index) =>
      isRectEqual(rect, right.rects[index] ?? null)
    ));

const isGeometryEqual = (
  left: RangeGeometry | null,
  right: RangeGeometry | null
) =>
  left === right ||
  (!!left &&
    !!right &&
    isRangeRectsEqual(left, right) &&
    isRectEqual(left.clipRect, right.clipRect) &&
    isRangeRectsEqual(left.visible, right.visible));

const unionRects = (rects: readonly ViewportRect[]): ViewportRect | null =>
  rects.length === 0
    ? null
    : boxRect(
        Math.min(...rects.map((rect) => rect.left)),
        Math.min(...rects.map((rect) => rect.top)),
        Math.max(...rects.map((rect) => rect.right)),
        Math.max(...rects.map((rect) => rect.bottom))
      );

const isOutside = (
  start: number,
  end: number,
  clipStart: number,
  clipEnd: number
) => {
  if (clipEnd <= clipStart) return true;
  if (start === end) return start < clipStart || start > clipEnd;

  return end <= clipStart || start >= clipEnd;
};

const cutRect = (rect: ViewportRect, clip: ViewportRect) =>
  isOutside(rect.top, rect.bottom, clip.top, clip.bottom) ||
  isOutside(rect.left, rect.right, clip.left, clip.right)
    ? null
    : boxRect(
        Math.max(rect.left, clip.left),
        Math.max(rect.top, clip.top),
        Math.min(rect.right, clip.right),
        Math.min(rect.bottom, clip.bottom)
      );

const withClip = (
  range: RangeRects,
  clipRect: ViewportRect | null
): RangeGeometry => {
  const rects = clipRect
    ? range.rects.flatMap((rect) => cutRect(rect, clipRect) ?? [])
    : [];
  const focusRect =
    clipRect && range.focusRect ? cutRect(range.focusRect, clipRect) : null;
  const boundingRect = unionRects(rects) ?? focusRect;

  return Object.freeze({
    ...range,
    clipRect,
    visible: boundingRect
      ? Object.freeze({ boundingRect, focusRect, rects: Object.freeze(rects) })
      : null,
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
  area?: ViewportRect | null;
  // A stale chain stays until the next walk so its boxes stay watched, because
  // a ResizeObserver reports a box again each time observing it starts.
  chain: ClipChain | null;
  count: number;
  generation: number;
  runtime: ReturnType<typeof findDOMRootRuntime>;
  stale: boolean;
  stopBinding: (() => void) | null;
  stopLayout: (() => void) | null;
  view: GeometryEditor | null;
};

type GeometryCoordinator = Readonly<{
  readArea: (editable: HTMLElement) => ViewportRect | null;
  register: (
    scope: GeometryCoordinatorScope,
    editable: HTMLElement
  ) => () => void;
  request: (scope: GeometryCoordinatorScope) => void;
  syncBinding: (editable: HTMLElement) => void;
}>;

const readVisibleArea = (editable: HTMLElement, chain: ClipChain | null) => {
  const rect = chain
    ? intersectClipChain(chain, editable.getBoundingClientRect())
    : null;

  return rect ? boxRect(rect.left, rect.top, rect.right, rect.bottom) : null;
};

const hasMoved = (chain: ClipChain) =>
  chain.visited.some(
    ({ element, parent }) => getFlatTreeParentElement(element) !== parent
  );

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
    ? new window.ResizeObserver(rewalk)
    : null;
  const attributeObserver = window?.MutationObserver
    ? new window.MutationObserver(rewalk)
    : null;
  const resized = new Set<Element>();
  const shadowRoots = new Set<ShadowRoot>();
  let cancelScheduled: (() => void) | null = null;
  let expiring = false;
  let scheduledEditable: HTMLElement | null = null;

  function forgetAreas() {
    rootLeases.forEach((lease) => {
      lease.area = undefined;
    });
  }

  function rewalk() {
    rootLeases.forEach((lease) => {
      lease.area = undefined;
      lease.stale = true;
    });
    requestAll();
  }

  function syncWatches() {
    const resizeTargets = new Set<Element>();
    const roots = new Set<ShadowRoot>();
    // disconnect() drops the records still queued, which can belong to a box
    // of another Editable.
    const missed = attributeObserver?.takeRecords().length ?? 0;

    attributeObserver?.disconnect();
    rootLeases.forEach((lease, editable) => {
      resizeTargets.add(editable);
      lease.chain?.boxes.forEach(({ element }) => resizeTargets.add(element));
      lease.chain?.visited.forEach(({ element }) => {
        const root = element.getRootNode();

        attributeObserver?.observe(element, {
          attributeFilter: ['class', 'style'],
        });
        if (window && root instanceof window.ShadowRoot) roots.add(root);
      });
    });
    resized.forEach((target) => {
      if (resizeTargets.has(target)) return;

      resizeObserver?.unobserve(target);
      resized.delete(target);
    });
    resizeTargets.forEach((target) => {
      if (resized.has(target)) return;

      resizeObserver?.observe(target);
      resized.add(target);
    });
    // A scroll inside a shadow root never reaches the document's listener.
    shadowRoots.forEach((root) => {
      if (roots.has(root)) return;

      root.removeEventListener('scroll', onScroll, true);
      shadowRoots.delete(root);
    });
    roots.forEach((root) => {
      if (shadowRoots.has(root)) return;

      root.addEventListener('scroll', onScroll, {
        capture: true,
        passive: true,
      });
      shadowRoots.add(root);
    });
    if (missed > 0) rewalk();
  }

  function readArea(editable: HTMLElement) {
    const lease = rootLeases.get(editable);

    if (!lease) {
      return readVisibleArea(editable, walkClipChain(editable, { self: true }));
    }
    if (lease.chain && hasMoved(lease.chain)) lease.stale = true;
    if (lease.stale) {
      lease.chain = walkClipChain(editable, { self: true });
      lease.area = undefined;
      lease.stale = false;
      syncWatches();
    }
    if (lease.area !== undefined) return lease.area;

    lease.area = readVisibleArea(editable, lease.chain);
    // A box can move with no event, such as when content above it grows, so
    // an area serves the reads of one task at most.
    if (!expiring) {
      expiring = true;
      queueMicrotask(() => {
        expiring = false;
        forgetAreas();
      });
    }

    return lease.area;
  }

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
      'Range geometry',
      flush,
      {
        key: 'range-geometry',
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
    lease.area = undefined;
    lease.stale = true;
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
        lease.area = undefined;
        scopesFor(editable).forEach((scope) => dirtyScopes.add(scope));
        schedule();
      });
    }
    schedule();
  }

  function onScroll() {
    forgetAreas();
    requestAll();
  }

  document.addEventListener('scroll', onScroll, {
    capture: true,
    passive: true,
  });
  window?.addEventListener('resize', rewalk, { passive: true });
  window?.visualViewport?.addEventListener('resize', rewalk, {
    passive: true,
  });
  window?.visualViewport?.addEventListener('scroll', onScroll, {
    passive: true,
  });

  return {
    readArea,
    register(scope, editable) {
      scopes.add(scope);
      const lease = rootLeases.get(editable) ?? {
        chain: null,
        count: 0,
        generation: -1,
        runtime: null,
        stale: true,
        stopBinding: null,
        stopLayout: null,
        view: null,
      };

      lease.count += 1;
      rootLeases.set(editable, lease);
      if (lease.count === 1) syncWatches();
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
          rootLeases.delete(editable);
          syncWatches();
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
        attributeObserver?.disconnect();
        document.removeEventListener('scroll', onScroll, true);
        window?.removeEventListener('resize', rewalk);
        window?.visualViewport?.removeEventListener('resize', rewalk);
        window?.visualViewport?.removeEventListener('scroll', onScroll);
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

export const resolveRangeGeometry = (
  editor: GeometryEditor,
  editable: HTMLElement,
  range: Range
): RangeRects | null => {
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

  return resolveDOMRangeGeometry(
    editable,
    domRange,
    focusDOMRange,
    RangeApi.isCollapsed(range)
  );
};

export const resolveDOMRangeGeometry = (
  editable: HTMLElement,
  domRange: globalThis.Range,
  focusDOMRange: globalThis.Range,
  collapsed: boolean
): RangeRects | null => {
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
  const rects = collapsed
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
    const rects =
      view && editable?.isConnected && EDITOR_TO_ELEMENT.get(view) === editable
        ? 'measure' in source
          ? source.measure(view, editable)
          : range
            ? resolveRangeGeometry(view, editable, range)
            : null
        : null;
    const next =
      rects && editable
        ? withClip(rects, coordinator?.readArea(editable) ?? null)
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
