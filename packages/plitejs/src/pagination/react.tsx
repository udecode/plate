import React, {
  createContext,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { flushSync } from 'react-dom';

import {
  type Editor,
  type Element,
  type Node,
  type NodeKey,
  type Path,
  PathApi,
  PointApi,
  type Range,
  RangeApi,
  TextApi,
} from '..';
import { reportEditorLifecycleError } from '../core/lifecycle-error';
import {
  EditorRoot,
  type EditableProps,
  useEditorContext,
  useEditorReadOnly,
  useEditorState,
} from '../react';
import {
  defaultScrollSelectionIntoView,
  getElementTransformScale,
} from '../react/components/editable';
import {
  type EditableElementLayout,
  getElementPlacementBox,
  pathKey,
} from '../react/components/editable-element-placement';
import { ImperativeTextFlowContext } from '../react/components/editable-text-flow';
import { WindowedEditable } from '../react/components/windowed-editable.internal';
import {
  DecorationContext,
  type PliteDecorationStore,
} from '../react/decoration-context';
import {
  createContainerDecorationSlice,
  type DecorationSlice,
} from '../react/decoration-source';
import { useElementPath } from '../react/hooks/use-element-path';
import { useHydrated } from '../react/hooks/use-hydrated';
import {
  createPretextPageLayoutEngine,
  measurePages,
  type MeasurePagesOptions,
  type PageLayoutEngine,
  type PageLayoutFragment,
  type PageLayoutMode,
  type PageLayoutPage,
  type PageLayoutSnapshot,
  type PageRect,
  type PageSettingsSource,
} from './index';
import {
  bounds,
  createPageLayoutGeometry,
  type PageLayoutGeometry,
  toCanvasRect,
} from './page-geometry.internal';
import { invalidatePageLayoutEngines } from './page-layout-engine-invalidation.internal';
import {
  createPagedEditablePageMountPlan,
  getPagedEditableVisiblePageMountItems,
  type PagedEditablePageMountPlan,
} from './page-mount-plan';

export * from './index';

type PublishedLayoutStore = Readonly<{
  getSnapshot: () => PageLayoutSnapshot | null;
  setSnapshot: (snapshot: PageLayoutSnapshot | null) => void;
  subscribe: (listener: () => void) => () => void;
}>;

const createPublishedLayoutStore = (): PublishedLayoutStore => {
  const listeners = new Set<() => void>();
  let snapshot: PageLayoutSnapshot | null = null;

  return {
    getSnapshot: () => snapshot,
    setSnapshot(next) {
      if (snapshot === next) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const LAYOUT_STORE_BY_HOST = new WeakMap<
  HTMLDivElement,
  PublishedLayoutStore
>();
const layoutHostListeners = new Set<() => void>();

const bindLayoutHost = (host: HTMLDivElement, store: PublishedLayoutStore) => {
  LAYOUT_STORE_BY_HOST.set(host, store);
  layoutHostListeners.forEach((listener) => listener());

  return () => {
    if (LAYOUT_STORE_BY_HOST.get(host) === store) {
      LAYOUT_STORE_BY_HOST.delete(host);
      layoutHostListeners.forEach((listener) => listener());
    }
  };
};

export const usePageLayout = (
  editableRef: RefObject<HTMLDivElement | null>
): PageLayoutSnapshot | null => {
  const subscribe = useCallback(
    (listener: () => void) => {
      let unsubscribeStore = () => {};
      let currentStore: PublishedLayoutStore | undefined;
      const bind = () => {
        const nextStore = editableRef.current
          ? LAYOUT_STORE_BY_HOST.get(editableRef.current)
          : undefined;

        if (nextStore === currentStore) return;
        unsubscribeStore();
        currentStore = nextStore;
        unsubscribeStore = nextStore?.subscribe(listener) ?? (() => {});
        listener();
      };

      layoutHostListeners.add(bind);
      bind();

      return () => {
        layoutHostListeners.delete(bind);
        unsubscribeStore();
      };
    },
    [editableRef]
  );
  const getSnapshot = useCallback(
    () =>
      editableRef.current
        ? (LAYOUT_STORE_BY_HOST.get(editableRef.current)?.getSnapshot() ?? null)
        : null,
    [editableRef]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
};

type MountedFragment = Readonly<{ pageIndex: number; rect: PageRect }>;
type FragmentContextValue = Readonly<{
  placementsByPath: ReadonlyMap<string, readonly MountedFragment[]>;
}>;

const FragmentContext = createContext<FragmentContextValue | null>(null);

export const usePageLayoutFragments = (): readonly MountedFragment[] => {
  const context = useContext(FragmentContext);
  const path = useElementPath();

  return useMemo(
    () =>
      context && path
        ? (context.placementsByPath.get(pathKey(path)) ?? [])
        : [],
    [context, path]
  );
};

const EMPTY_DECORATIONS = Object.freeze([]) as readonly DecorationSlice[];

type SurfaceDecorationStore = PliteDecorationStore &
  Readonly<{
    destroy: () => void;
    mount: () => () => void;
    setLocalBuckets: (
      buckets: ReadonlyMap<NodeKey, readonly DecorationSlice[]>
    ) => void;
  }>;

const sameSlices = (
  left: readonly DecorationSlice[],
  right: readonly DecorationSlice[]
) =>
  left === right ||
  (left.length === right.length &&
    left.every(
      (slice, index) =>
        slice.key === right[index]?.key &&
        slice.start === right[index]?.start &&
        slice.end === right[index]?.end &&
        JSON.stringify(slice.attributes) ===
          JSON.stringify(right[index]?.attributes)
    ));

const createSurfaceDecorationStore = (
  inherited: PliteDecorationStore | null
): SurfaceDecorationStore => {
  const listeners = new Set<(changedNodeKeys: readonly NodeKey[]) => void>();
  const listenersByNodeKey = new Map<NodeKey, Set<() => void>>();
  const merged = new Map<NodeKey, readonly DecorationSlice[]>();
  let local = new Map<NodeKey, readonly DecorationSlice[]>();
  let version = 0;
  let unsubscribeInherited = () => {};

  const publish = (keys: readonly NodeKey[]) => {
    if (keys.length === 0) return;
    version += 1;
    keys.forEach((key) => {
      merged.delete(key);
      listenersByNodeKey.get(key)?.forEach((listener) => listener());
    });
    listeners.forEach((listener) => listener(keys));
  };
  const store: SurfaceDecorationStore = {
    destroy() {
      unsubscribeInherited();
      listeners.clear();
      listenersByNodeKey.clear();
      merged.clear();
      local.clear();
    },
    getNodeSnapshot(nodeKey) {
      const cached = merged.get(nodeKey);

      if (cached) return cached;

      const inheritedSlices =
        inherited?.getNodeSnapshot(nodeKey) ?? EMPTY_DECORATIONS;
      const localSlices = local.get(nodeKey) ?? EMPTY_DECORATIONS;
      const next =
        inheritedSlices.length === 0
          ? localSlices
          : localSlices.length === 0
            ? inheritedSlices
            : Object.freeze([...inheritedSlices, ...localSlices]);

      merged.set(nodeKey, next);
      return next;
    },
    getVersion: () => version,
    hasSources: () => Boolean(inherited?.hasSources() || local.size > 0),
    mount() {
      unsubscribeInherited =
        inherited?.subscribe((keys) => publish(keys)) ?? (() => {});

      return () => {
        unsubscribeInherited();
        unsubscribeInherited = () => {};
      };
    },
    setLocalBuckets(nextBuckets) {
      const changed = new Set<NodeKey>([
        ...local.keys(),
        ...nextBuckets.keys(),
      ]);
      const next = new Map<NodeKey, readonly DecorationSlice[]>();

      changed.forEach((key) => {
        const previousBucket = local.get(key) ?? EMPTY_DECORATIONS;
        const candidate = nextBuckets.get(key) ?? EMPTY_DECORATIONS;

        if (candidate.length > 0) {
          next.set(
            key,
            sameSlices(previousBucket, candidate) ? previousBucket : candidate
          );
        }
        if (sameSlices(previousBucket, candidate)) changed.delete(key);
      });
      local = next;
      publish([...changed]);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    subscribeNodeKey(nodeKey, listener) {
      const nodeListeners = listenersByNodeKey.get(nodeKey) ?? new Set();

      nodeListeners.add(listener);
      listenersByNodeKey.set(nodeKey, nodeListeners);

      return () => {
        nodeListeners.delete(listener);
        if (nodeListeners.size === 0) listenersByNodeKey.delete(nodeKey);
      };
    },
  };

  return store;
};

type FontView = Readonly<{ engine: PageLayoutEngine; invalidate: () => void }>;
type FontOwner = {
  cleanup: () => void;
  views: Set<FontView>;
};

const FONT_OWNERS = new WeakMap<object, FontOwner>();

const attachFontView = (fonts: FontFaceSet, view: FontView): (() => void) => {
  let owner = FONT_OWNERS.get(fonts);

  if (!owner) {
    const views = new Set<FontView>();
    const invalidate = () => {
      if (views.size === 0) return;
      const engines = new Set([...views].map((entry) => entry.engine));

      invalidatePageLayoutEngines(engines);
      views.forEach((entry) => entry.invalidate());
    };

    fonts.addEventListener('loadingdone', invalidate);
    fonts.addEventListener('loadingerror', invalidate);
    void fonts.ready.then(invalidate);
    owner = {
      cleanup: () => {
        fonts.removeEventListener('loadingdone', invalidate);
        fonts.removeEventListener('loadingerror', invalidate);
      },
      views,
    };
    FONT_OWNERS.set(fonts, owner);
  }

  owner.views.add(view);

  return () => {
    owner?.views.delete(view);
    if (owner?.views.size === 0) {
      owner.cleanup();
      FONT_OWNERS.delete(fonts);
    }
  };
};

const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

const parseCSSPixels = (value: string | null | undefined) => {
  if (!value || value === 'auto' || value === 'none') return 0;
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const canScroll = (element: HTMLElement | null) => {
  if (!element) return false;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);

  return (
    SCROLLABLE_OVERFLOW_PATTERN.test(
      `${style?.overflow ?? ''} ${style?.overflowY ?? ''}`
    ) &&
    (element.clientHeight > 0 ||
      parseCSSPixels(style?.height) > 0 ||
      parseCSSPixels(style?.maxHeight) > 0)
  );
};

const getScrollRoot = (element: HTMLElement | null): HTMLElement | null => {
  const editable =
    element?.querySelector<HTMLElement>('[data-editor="true"]') ?? null;

  if (canScroll(editable)) return editable;

  let current = element;

  while (current) {
    if (canScroll(current)) return current;
    current = current.parentElement;
  }

  return null;
};

type Viewport = { bottom: number; top: number };
type ViewportSnapshot = {
  canTrackContentViewport: boolean;
  viewport: Viewport | null;
};

const INACTIVE_VIEWPORT: ViewportSnapshot = {
  canTrackContentViewport: false,
  viewport: null,
};
const EMPTY_PAGE_MOUNT_PLAN: PagedEditablePageMountPlan = {
  itemIndexesByPath: new Map(),
  itemIndexesByTopLevelIndex: new Map(),
  items: [],
};

const createViewportStore = () => {
  const listeners = new Set<() => void>();
  let root: HTMLDivElement | null = null;
  let geometryHeight = 0;
  let cleanup = () => {};
  let lastScrollAt = Number.NEGATIVE_INFINITY;
  let snapshot = INACTIVE_VIEWPORT;

  const publish = (next: ViewportSnapshot, sync = false) => {
    const commit = () => {
      snapshot = next;
      listeners.forEach((listener) => listener());
    };

    if (sync) flushSync(commit);
    else commit();
  };
  const restart = () => {
    cleanup();
    if (listeners.size === 0 || !root) return;
    const scrollRoot = getScrollRoot(root);

    if (!scrollRoot) {
      publish(INACTIVE_VIEWPORT);
      return;
    }
    const update = (sync = false) => {
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const scrollRect = scrollRoot.getBoundingClientRect();
      const offset = root.contains(scrollRoot) ? scrollRoot.scrollTop : 0;
      const scale =
        geometryHeight > 0 && rootRect.height > 0
          ? rootRect.height / geometryHeight
          : 1;
      const top = Math.max(0, (scrollRect.top - rootRect.top + offset) / scale);

      publish(
        {
          canTrackContentViewport: true,
          viewport: {
            bottom: Math.max(
              top,
              (scrollRect.bottom - rootRect.top + offset) / scale
            ),
            top,
          },
        },
        sync
      );
    };
    const onScroll = () => {
      lastScrollAt = performance.now();
      update(true);
    };
    const onResize = () => update();

    update();
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    root.ownerDocument.defaultView?.addEventListener('resize', onResize);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(onResize);

    observer?.observe(root);
    observer?.observe(scrollRoot);
    cleanup = () => {
      scrollRoot.removeEventListener('scroll', onScroll);
      root?.ownerDocument.defaultView?.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  };
  const getSnapshot = () => snapshot;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) restart();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        cleanup();
        cleanup = () => {};
      }
    };
  };

  return {
    configure(nextRoot: HTMLDivElement | null, nextHeight: number) {
      root = nextRoot;
      geometryHeight = nextHeight;
      restart();
    },
    getLastScrollAt: () => lastScrollAt,
    getSnapshot,
    subscribe,
  };
};

const sameSelectedPaths = (
  left: readonly Path[] | null,
  right: readonly Path[]
) =>
  left === right ||
  (left !== null &&
    left.length === right.length &&
    left.every((path, index) => PathApi.equals(path, right[index])));

const selectedPathsFor = (selection: Range | null): readonly Path[] =>
  selection ? [selection.anchor.path, selection.focus.path] : [];

const setRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
};

const createPlacementsByPath = (
  fragments: readonly PageLayoutFragment[],
  geometry: PageLayoutGeometry
) => {
  const placements = new Map<string, MountedFragment[]>();
  const add = (path: Path, placement: MountedFragment) => {
    const key = pathKey(path);
    const values = placements.get(key) ?? [];

    values.push(placement);
    placements.set(key, values);
  };

  fragments.forEach((fragment) => {
    add(fragment.path, {
      pageIndex: fragment.pageIndex,
      rect: toCanvasRect(fragment.rect, fragment.pageIndex, geometry),
    });
    if (fragment.type === 'direct-children') {
      fragment.children.forEach((child) =>
        add(child.path, {
          pageIndex: fragment.pageIndex,
          rect: toCanvasRect(child.rect, fragment.pageIndex, geometry),
        })
      );
    }
  });

  return placements;
};

const createElementLayouts = (
  fragments: readonly PageLayoutFragment[],
  placementsByPath: ReadonlyMap<string, readonly MountedFragment[]>,
  previous: ReadonlyMap<string, EditableElementLayout>
) => {
  const paths = new Map<string, Path>();

  fragments.forEach((fragment) => {
    paths.set(pathKey(fragment.path), fragment.path);
    if (fragment.type === 'direct-children') {
      fragment.children.forEach((child) =>
        paths.set(pathKey(child.path), child.path)
      );
    }
  });
  const canvasBounds = new Map<string, PageRect>();

  placementsByPath.forEach((placements, key) => {
    canvasBounds.set(
      key,
      bounds(placements.map((placement) => placement.rect))
    );
  });
  const layouts = new Map<string, EditableElementLayout>();

  paths.forEach((path, key) => {
    const rect = canvasBounds.get(key);

    if (!rect) return;
    let parent = path.slice(0, -1);
    let parentRect: PageRect | undefined;

    while (parent.length > 0 && !parentRect) {
      parentRect = canvasBounds.get(pathKey(parent));
      parent = parent.slice(0, -1);
    }
    const layout = {
      height: rect.height,
      left: rect.left - (parentRect?.left ?? 0),
      top: rect.top - (parentRect?.top ?? 0),
      width: rect.width,
    };
    const kept = previous.get(key);

    // An equal layout keeps its object, so its element keeps its placement ref.
    layouts.set(
      key,
      kept &&
        kept.height === layout.height &&
        kept.left === layout.left &&
        kept.top === layout.top &&
        kept.width === layout.width
        ? kept
        : layout
    );
  });

  return layouts;
};

type TextLine = Extract<PageLayoutFragment, { type: 'text' }>['lines'][number];

const NATIVE_FLOW_BREAK_RULE =
  "[data-pagination-native-flow-break='true']::after{content:'\\A';white-space:pre}";

/**
 * A line whose text ends at a hard `\n` already breaks under the run's
 * `white-space: pre`, so no run carries the native-flow break.
 */
const nativeFlowBreakRunIndex = (
  line: TextLine,
  readNode: (path: Path) => Node | undefined
) => {
  const end = RangeApi.end(line.source);
  const node = readNode(end.path);

  if (TextApi.isText(node) && node.text[end.offset - 1] === '\n') return -1;
  return line.runs.findIndex((run) =>
    PointApi.equals(RangeApi.end(run.source), end)
  );
};

const createPaginationBuckets = (
  editor: Editor,
  fragments: readonly PageLayoutFragment[],
  geometry: PageLayoutGeometry,
  selectedPaths: readonly Path[],
  runOrigins: ReadonlyMap<string, ProjectedRunOrigin>
): ReadonlyMap<NodeKey, readonly DecorationSlice[]> => {
  const buckets = new Map<NodeKey, DecorationSlice[]>();
  const textFragmentsByPath = new Map<string, number>();

  fragments.forEach((fragment) => {
    if (fragment.type === 'text') {
      const key = pathKey(fragment.path);
      textFragmentsByPath.set(key, (textFragmentsByPath.get(key) ?? 0) + 1);
    }
  });
  const blockBounds = new Map<string, PageRect>();

  fragments.forEach((fragment) => {
    if (fragment.type !== 'text') return;
    const key = pathKey(fragment.path);
    const rect = toCanvasRect(fragment.rect, fragment.pageIndex, geometry);
    const previous = blockBounds.get(key);

    blockBounds.set(key, previous ? bounds([previous, rect]) : rect);
  });

  editor.read((state) => {
    const { index } = state.runtime.snapshot();

    fragments.forEach((fragment) => {
      if (fragment.type !== 'text') return;
      const blockKey = pathKey(fragment.path);
      const nativeFlow =
        textFragmentsByPath.get(blockKey) === 1 &&
        selectedPaths.some((path) => PathApi.isCommon(fragment.path, path));
      const blockRect =
        blockBounds.get(blockKey) ??
        toCanvasRect(fragment.rect, fragment.pageIndex, geometry);

      fragment.lines.forEach((line, lineIndex) => {
        const breakRunIndex =
          nativeFlow && lineIndex < fragment.lines.length - 1
            ? nativeFlowBreakRunIndex(
                line,
                (path) => state.nodes.get(path)?.[0]
              )
            : -1;

        line.runs.forEach((run, runIndex) => {
          const nodeKey = index.keyAt(run.source.anchor.path);

          if (!nodeKey) return;
          const rangeStart = Math.min(
            run.source.anchor.offset,
            run.source.focus.offset
          );
          const rangeEnd = Math.max(
            run.source.anchor.offset,
            run.source.focus.offset
          );
          const rect = toCanvasRect(run.rect, fragment.pageIndex, geometry);
          const origin = runOrigins.get(pathKey(run.source.anchor.path));
          const originLeft = blockRect.left + (origin?.left ?? 0);
          const originTop = blockRect.top + (origin?.top ?? 0);
          const slice = createContainerDecorationSlice({
            attributes: Object.freeze(
              nativeFlow
                ? {
                    'data-pagination-line': true,
                    'data-pagination-native-flow-break':
                      runIndex === breakRunIndex || undefined,
                    style: Object.freeze({ whiteSpace: 'pre' }),
                  }
                : {
                    'data-pagination-line': true,
                    style: Object.freeze({
                      display: 'inline-block',
                      height: rect.height,
                      left: rect.left - originLeft,
                      lineHeight: `${rect.height}px`,
                      minWidth: rect.width === 0 ? 1 : undefined,
                      pointerEvents: 'auto',
                      position: 'absolute',
                      top: rect.top - originTop,
                      whiteSpace: 'pre',
                      width: rect.width,
                    }),
                  }
            ),
            end: rangeEnd,
            key: `pagination:${fragment.pageIndex}:${blockKey}:${lineIndex}:${runIndex}`,
            start: rangeStart,
          });
          const current = buckets.get(nodeKey) ?? [];

          current.push(slice);
          buckets.set(nodeKey, current);
        });
      });
    });
  });

  return buckets;
};

const fragmentContainsPath = (fragment: PageLayoutFragment, path: Path) => {
  if (PathApi.equals(fragment.path, path)) return true;
  if (fragment.type === 'direct-children') {
    return fragment.children.some((child) =>
      PathApi.isCommon(child.path, path)
    );
  }

  return PathApi.isCommon(fragment.path, path);
};

export type PagedEditablePageAttributes = Readonly<{
  'data-editor-page': true;
  'data-editor-page-index': number;
  style: CSSProperties;
}>;

export type PagedEditableRenderPageProps = Readonly<{
  attributes: PagedEditablePageAttributes;
  page: PageLayoutPage;
}>;

export type PagedEditablePageView = Readonly<{
  gap?: number;
  mode?: PageLayoutMode;
}>;

export type PagedEditableProps<TElement extends Element = Element> =
  EditableProps<TElement> &
    Pick<
      MeasurePagesOptions<TElement>,
      'fragmentation' | 'page' | 'typography'
    > &
    Readonly<{
      engine?: PageLayoutEngine;
      pageView?: PagedEditablePageView;
      renderPage?: (props: PagedEditableRenderPageProps) => ReactNode;
      virtualize?: boolean;
    }>;

const defaultRenderPage = ({ attributes }: PagedEditableRenderPageProps) => (
  <div {...attributes} />
);

const pageDependency = (page: PageSettingsSource) =>
  'margins' in page && 'preset' in page
    ? `${page.preset}:${JSON.stringify(page.margins)}`
    : page;

const readEditorVersion = (editor: Editor) =>
  editor.read(
    (state) => state.lastCommit()?.version ?? state.runtime.snapshot().version
  );

const samePageLayoutSnapshot = (
  left: PageLayoutSnapshot,
  right: PageLayoutSnapshot
) =>
  left.version === right.version &&
  JSON.stringify(left) === JSON.stringify(right);

const measurePagedEditable = <TElement extends Element>(
  editor: Editor,
  options: MeasurePagesOptions<TElement>
) =>
  // React context erases the schema generic; PagedEditableProps preserves it
  // across the fragmentation, typography, and renderer callbacks.
  measurePages(editor, options as unknown as MeasurePagesOptions);

const createPagedCanvasStyles = (
  geometry: PageLayoutGeometry,
  style: CSSProperties | undefined
): Readonly<Record<'editor' | 'host' | 'overlay' | 'root', CSSProperties>> => ({
  editor: { inset: 0, pointerEvents: 'auto', position: 'absolute' },
  host: {
    ...style,
    minHeight: geometry.height,
    position: 'relative',
    width: geometry.width,
    zIndex: 0,
  },
  overlay: {
    height: geometry.height,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
    width: geometry.width,
    zIndex: 1,
  },
  root: {
    minHeight: geometry.height,
    position: 'relative',
    width: geometry.width,
  },
});

type ProjectedRunOrigin = Readonly<{ left: number; top: number }>;

/**
 * Reads, once per projected text node, where its runs' containing box sits
 * inside its block's placed box, in the box's own CSS pixels. A positioned
 * inline element, such as a link, is its runs' containing box, so origins are
 * kept per text node.
 */
const readProjectedRunOrigins = (host: HTMLElement) => {
  const origins = new Map<string, ProjectedRunOrigin>();
  const boxes = new Map<
    HTMLElement,
    { rect: DOMRect; scale: { x: number; y: number } }
  >();
  const parentRects = new Map<globalThis.Element, DOMRect>();

  host
    .querySelectorAll<HTMLElement>('[data-pagination-line]')
    .forEach((run) => {
      if (run.style.position !== 'absolute') return;
      const path = run
        .closest('[data-editor-node="text"]')
        ?.getAttribute('data-editor-path');
      const key = path && pathKey(path.split(',').map(Number));

      if (!key || origins.has(key)) return;
      const block = run.closest<HTMLElement>(
        '[data-editor-node="element"]:not([data-editor-inline="true"])'
      );
      const parent = run.offsetParent;

      if (!block || !parent) return;
      let box = boxes.get(block);

      if (!box) {
        const placed = getElementPlacementBox(block);
        const rect = placed.getBoundingClientRect();

        box = { rect, scale: getElementTransformScale(placed, rect) };
        boxes.set(block, box);
      }
      let parentRect = parentRects.get(parent);

      if (!parentRect) {
        parentRect = parent.getBoundingClientRect();
        parentRects.set(parent, parentRect);
      }

      origins.set(key, {
        left:
          (parentRect.left - box.rect.left) / box.scale.x + parent.clientLeft,
        top: (parentRect.top - box.rect.top) / box.scale.y + parent.clientTop,
      });
    });

  return origins;
};

const EMPTY_RUN_ORIGINS: ReadonlyMap<string, ProjectedRunOrigin> = new Map();

const sameRunOrigins = (
  left: ReadonlyMap<string, ProjectedRunOrigin>,
  right: ReadonlyMap<string, ProjectedRunOrigin>
) =>
  left.size === right.size &&
  [...right].every(([key, origin]) => {
    const previous = left.get(key);

    return previous?.left === origin.left && previous.top === origin.top;
  });

/**
 * Subscribes to the decoration store so it rerenders with every publish; its
 * layout effect then reads run origins from the runs that publish committed.
 */
const RunOriginReader = React.memo(
  ({
    host,
    onRead,
    store,
  }: {
    host: HTMLElement | null;
    onRead: (host: HTMLElement) => void;
    store: SurfaceDecorationStore;
  }) => {
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    useLayoutEffect(() => {
      if (host) onRead(host);
    });

    return null;
  }
);
RunOriginReader.displayName = 'RunOriginReader';

const PagedEditableInner = <TElement extends Element = Element>({
  engine: suppliedEngine,
  fragmentation,
  ignoreBlankEditableRootClicks = true,
  page,
  pageView,
  ref: forwardedRef,
  renderPage = defaultRenderPage,
  style,
  typography,
  virtualize = false,
  ...editableProps
}: Omit<PagedEditableProps<TElement>, 'root'>) => {
  const editor = useEditorContext();
  const inheritedDecorations = useContext(DecorationContext);
  const [fallbackEngine] = useState(() => createPretextPageLayoutEngine());
  const engine = suppliedEngine ?? fallbackEngine;
  const [fontEpoch, setFontEpoch] = useState(0);
  const [editableHost, setEditableHost] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const publishedStore = useMemo(createPublishedLayoutStore, []);
  const decorationStore = useMemo(
    () => createSurfaceDecorationStore(inheritedDecorations),
    [inheritedDecorations]
  );
  const [viewportStore] = useState(createViewportStore);
  const selectedPaths = useEditorState(
    (state) => selectedPathsFor(state.selection()),
    {
      equalityFn: sameSelectedPaths,
      shouldUpdate: (change) =>
        !change ||
        change.selectionChanged ||
        change.changed.hasAny('structure'),
    }
  );
  const pageFieldKey = 'margins' in page && 'preset' in page ? null : page.key;
  // Only document and page-field commits advance this version, so a selection
  // commit re-renders the projection without remeasuring the document.
  const [documentVersion, setDocumentVersion] = useState(() =>
    readEditorVersion(editor)
  );

  useLayoutEffect(() => {
    setDocumentVersion(readEditorVersion(editor));
    return editor.subscribeCommit((change) => {
      if (
        change.changed.hasAny('document') ||
        (pageFieldKey !== null && change.dirtyStateKeys.includes(pageFieldKey))
      ) {
        setDocumentVersion(change.version);
      }
    });
  }, [editor, pageFieldKey]);
  const dependency = pageDependency(page);
  const canMeasure = useHydrated();
  const measuredSnapshot = useRef<PageLayoutSnapshot | null>(null);
  const measurement = useMemo(() => {
    if (!canMeasure) return { error: null, snapshot: null };
    try {
      const snapshot = measurePagedEditable(editor, {
        engine,
        fragmentation,
        page,
        typography,
      });
      const currentVersion = readEditorVersion(editor);

      if (currentVersion !== snapshot.version) {
        return { error: null, snapshot: null };
      }
      const previous = measuredSnapshot.current;
      // An equal remeasurement keeps the published object, so inline
      // fragmentation or typography callbacks cannot republish forever.
      const stable =
        previous && samePageLayoutSnapshot(previous, snapshot)
          ? previous
          : snapshot;

      measuredSnapshot.current = stable;
      return { error: null, snapshot: stable };
    } catch (error) {
      return { error, snapshot: null };
    }
    // The semantic page dependency prevents equivalent inline values from recomposing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canMeasure,
    dependency,
    documentVersion,
    editor,
    engine,
    fontEpoch,
    fragmentation,
    typography,
  ]);
  const { snapshot } = measurement;
  const gap = pageView?.gap ?? 24;
  const mode = pageView?.mode ?? 'single';
  const geometry = useMemo(
    () =>
      snapshot
        ? createPageLayoutGeometry({
            fragments: snapshot.fragments,
            gap,
            mode,
            pages: snapshot.pages,
          })
        : null,
    [gap, mode, snapshot]
  );

  useEffect(() => {
    if (!measurement.error) return;
    reportEditorLifecycleError({
      cause: measurement.error,
      editor,
      phase: 'measure',
      source: 'pagination',
    });
  }, [editor, measurement.error]);
  useLayoutEffect(() => decorationStore.mount(), [decorationStore]);
  useEffect(() => () => decorationStore.destroy(), [decorationStore]);
  useLayoutEffect(() => {
    if (!editableHost) return undefined;
    return bindLayoutHost(editableHost, publishedStore);
  }, [editableHost, publishedStore]);
  useLayoutEffect(() => {
    publishedStore.setSnapshot(snapshot);
  }, [publishedStore, snapshot]);
  useEffect(() => {
    const fonts = editableHost?.ownerDocument.fonts;

    if (!fonts) return undefined;
    return attachFontView(fonts, {
      engine,
      invalidate: () => setFontEpoch((value) => value + 1),
    });
  }, [editableHost, engine]);
  const editableRef = useCallback(
    (host: HTMLDivElement | null) => {
      setEditableHost(host);
      setRef(forwardedRef, host);
    },
    [forwardedRef]
  );

  const pageMountPlan = useMemo(
    () =>
      snapshot && geometry
        ? createPagedEditablePageMountPlan({
            fragments: snapshot.fragments,
            geometry,
            mode,
            pages: snapshot.pages,
          })
        : EMPTY_PAGE_MOUNT_PLAN,
    [geometry, mode, snapshot]
  );
  useLayoutEffect(() => {
    viewportStore.configure(rootRef.current, geometry?.height ?? 0);
  }, [geometry?.height, viewportStore]);
  const viewportState = useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
    () => INACTIVE_VIEWPORT
  );
  const visibleItems = useMemo(
    () =>
      virtualize
        ? getPagedEditableVisiblePageMountItems(pageMountPlan, {
            gap,
            overscan: 0,
            pages: snapshot?.pages ?? [],
            virtualizes: true,
            viewport: viewportState.canTrackContentViewport
              ? viewportState.viewport
              : null,
          })
        : pageMountPlan.items,
    [gap, pageMountPlan, snapshot?.pages, viewportState, virtualize]
  );
  // Promoting a requested path changes which page content is mounted.
  const [promotedPath, setPromotedPath] = useState<Path | null>(null);
  const [runOrigins, setRunOrigins] =
    useState<ReadonlyMap<string, ProjectedRunOrigin>>(EMPTY_RUN_ORIGINS);
  const readRunOrigins = useCallback((host: HTMLElement) => {
    const read = readProjectedRunOrigins(host);

    // Merging keeps the origins of blocks that left projection, such as a
    // selected block in native flow, so their absence rebuilds nothing.
    setRunOrigins((previous) => {
      const next = new Map(previous);

      read.forEach((origin, key) => next.set(key, origin));
      return sameRunOrigins(previous, next) ? previous : next;
    });
  }, []);
  const windowedItems = useMemo(() => {
    const requiredItemIndexes = new Set(visibleItems.map((item) => item.index));

    [...selectedPaths, promotedPath].forEach((path) => {
      if (!path) return;
      let ownerPath = path;
      let itemIndexes: readonly number[] | undefined;

      while (ownerPath.length > 0 && !itemIndexes) {
        itemIndexes = pageMountPlan.itemIndexesByPath.get(pathKey(ownerPath));
        ownerPath = ownerPath.slice(0, -1);
      }
      itemIndexes?.forEach((itemIndex) => requiredItemIndexes.add(itemIndex));
    });

    return pageMountPlan.items.filter((item) =>
      requiredItemIndexes.has(item.index)
    );
  }, [pageMountPlan, promotedPath, selectedPaths, visibleItems]);
  const visiblePageIndexes = useMemo(
    () => new Set(windowedItems.flatMap((item) => item.pageIndexes)),
    [windowedItems]
  );
  const previousProjectedFragments = useRef<readonly PageLayoutFragment[]>([]);
  const projectedFragments = useMemo(() => {
    const next = virtualize
      ? (snapshot?.fragments ?? []).filter(
          (fragment) =>
            visiblePageIndexes.has(fragment.pageIndex) ||
            selectedPaths.some((path) => fragmentContainsPath(fragment, path))
        )
      : (snapshot?.fragments ?? []);
    const previous = previousProjectedFragments.current;

    // A caret move filters to the same fragments; keeping the array keeps
    // every placement and element layout.
    if (
      next.length === previous.length &&
      next.every((fragment, index) => fragment === previous[index])
    ) {
      return previous;
    }
    previousProjectedFragments.current = next;
    return next;
  }, [selectedPaths, snapshot?.fragments, virtualize, visiblePageIndexes]);
  const placementsByPath = useMemo(
    () =>
      geometry
        ? createPlacementsByPath(projectedFragments, geometry)
        : new Map<string, MountedFragment[]>(),
    [geometry, projectedFragments]
  );
  const previousElementLayouts = useRef<
    ReadonlyMap<string, EditableElementLayout>
  >(new Map());
  const elementLayouts = useMemo(() => {
    if (!geometry) return undefined;
    const layouts = createElementLayouts(
      snapshot?.fragments ?? [],
      placementsByPath,
      previousElementLayouts.current
    );

    previousElementLayouts.current = layouts;
    return layouts;
  }, [geometry, placementsByPath, snapshot?.fragments]);
  const localBuckets = useMemo(
    () =>
      geometry
        ? createPaginationBuckets(
            editor,
            projectedFragments,
            geometry,
            selectedPaths,
            runOrigins
          )
        : new Map<NodeKey, readonly DecorationSlice[]>(),
    [editor, geometry, projectedFragments, runOrigins, selectedPaths]
  );
  const fragmentContext = useMemo(
    () => ({ placementsByPath }),
    [placementsByPath]
  );

  useLayoutEffect(() => {
    decorationStore.setLocalBuckets(localBuckets);
  }, [decorationStore, localBuckets]);
  const scrollSelectionIntoView = useMemo(() => {
    const custom = editableProps.scrollSelectionIntoView;

    return ((innerEditor, domRange) => {
      if (
        virtualize &&
        performance.now() - viewportStore.getLastScrollAt() < 500
      ) {
        return;
      }
      if (custom) {
        custom(innerEditor, domRange);
      } else {
        defaultScrollSelectionIntoView(editor, domRange);
      }
    }) satisfies NonNullable<EditableProps['scrollSelectionIntoView']>;
  }, [
    editableProps.scrollSelectionIntoView,
    editor,
    viewportStore,
    virtualize,
  ]);
  const scrollToPath = useCallback(
    (path: Path, align: 'auto' | 'center' | 'end' | 'start' = 'auto') => {
      const index = path[0];
      const itemIndex =
        typeof index === 'number'
          ? pageMountPlan.itemIndexesByTopLevelIndex.get(index)?.[0]
          : undefined;
      const item =
        itemIndex === undefined ? undefined : pageMountPlan.items[itemIndex];
      const scrollRoot = getScrollRoot(rootRef.current);

      if (!item || !scrollRoot) return false;
      const viewportHeight = Math.max(
        1,
        scrollRoot.clientHeight || scrollRoot.getBoundingClientRect().height
      );
      const top =
        align === 'center'
          ? item.start - (viewportHeight - item.size) / 2
          : align === 'end'
            ? item.start - viewportHeight + item.size
            : item.start;

      scrollRoot.scrollTo({ top: Math.max(0, top) });
      return true;
    },
    [pageMountPlan]
  );

  const mountedTopLevelIndexes = [
    ...new Set(windowedItems.flatMap((item) => item.topLevelIndexes)),
  ].sort((left, right) => left - right);
  const { pageArrayIndex, pageByIndex } = useMemo(() => {
    const pages = snapshot?.pages ?? [];

    return {
      pageArrayIndex: new Map(
        pages.map((value, index) => [value.index, index])
      ),
      pageByIndex: new Map(pages.map((value) => [value.index, value])),
    };
  }, [snapshot?.pages]);
  const canvas = geometry && createPagedCanvasStyles(geometry, style);

  return (
    <FragmentContext value={fragmentContext}>
      <div
        data-editor-paged-editable
        data-editor-paged-editable-page-virtualization={
          canvas && virtualize ? 'true' : undefined
        }
        ref={rootRef}
        style={canvas?.root}
      >
        <style href="plite-pagination-native-flow-break" precedence="plite">
          {NATIVE_FLOW_BREAK_RULE}
        </style>
        {geometry &&
          (virtualize ? windowedItems : pageMountPlan.items).flatMap((item) =>
            item.pageIndexes.map((pageIndex) => {
              const layoutPage = pageByIndex.get(pageIndex);
              const arrayIndex = pageArrayIndex.get(pageIndex);

              if (!layoutPage || arrayIndex === undefined) return null;
              const placement = geometry.pagePlacements[arrayIndex] ?? {
                left: 0,
                top: 0,
              };
              const occupied = geometry.occupiedSizes[arrayIndex] ?? layoutPage;
              const attributes: PagedEditablePageAttributes = {
                'data-editor-page': true,
                'data-editor-page-index': layoutPage.index,
                style: {
                  boxSizing: 'border-box',
                  height: layoutPage.height,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  position: 'relative',
                  width: layoutPage.width,
                },
              };

              return (
                <div
                  data-editor-page-mount-item-index={item.index}
                  data-editor-page-surface
                  key={layoutPage.index}
                  style={{
                    height: occupied.height,
                    left: placement.left,
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: placement.top,
                    width: occupied.width,
                  }}
                >
                  {renderPage({ attributes, page: layoutPage })}
                </div>
              );
            })
          )}
        <div data-editor-paged-editable-editor-overlay style={canvas?.overlay}>
          <div data-editor-paged-editable-editor style={canvas?.editor}>
            <ImperativeTextFlowContext value={false}>
              <WindowedEditable
                {...editableProps}
                decorationStore={decorationStore}
                elementLayouts={elementLayouts}
                enabled={Boolean(canvas) && virtualize}
                ignoreBlankEditableRootClicks={ignoreBlankEditableRootClicks}
                mountedTopLevelIndexes={mountedTopLevelIndexes}
                onRequestMount={(index, path) =>
                  setPromotedPath(path ?? [index])
                }
                ref={editableRef}
                scrollSelectionIntoView={scrollSelectionIntoView}
                scrollToPath={scrollToPath}
                style={canvas ? canvas.host : style}
                totalSize={geometry?.height ?? 0}
              />
            </ImperativeTextFlowContext>
            <RunOriginReader
              host={editableHost}
              onRead={readRunOrigins}
              store={decorationStore}
            />
          </div>
        </div>
      </div>
    </FragmentContext>
  );
};

export const PagedEditable = <TElement extends Element = Element>({
  root,
  ...props
}: PagedEditableProps<TElement>) => {
  if (root === 'main') {
    throw new Error('[Plite] Omit root to render the primary document.');
  }
  const editor = useEditorContext();
  const inheritedReadOnly = useEditorReadOnly();
  const editable = <PagedEditableInner {...props} />;

  return root === undefined ? (
    editable
  ) : (
    <EditorRoot
      editor={editor}
      readOnly={props.readOnly || inheritedReadOnly}
      root={root}
    >
      {editable}
    </EditorRoot>
  );
};
