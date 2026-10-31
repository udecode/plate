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
  NodeApi,
  type NodeKey,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  TextApi,
} from '..';
import { reportEditorLifecycleError } from '../core/lifecycle-error';
import {
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
import {
  SOFT_LINE_END_SELECTOR,
  SOFT_LINE_FLAG,
} from '../react/components/editable-text';
import { ImperativeTextFlowContext } from '../react/components/editable-text-flow';
import { TextRenderScopeContext } from '../react/components/editable-text-pieces';
import { SurfaceRoot } from '../react/components/plite';
import { WindowedEditable } from '../react/components/windowed-editable.internal';
import {
  DecorationContext,
  type PliteDecorationStore,
} from '../react/decoration-context';
import {
  createContainerDecorationSlice,
  type DecorationSlice,
} from '../react/decoration-source';
import {
  landInViewBlock,
  landOnViewLine,
  type ViewLines,
} from '../react/editable/view-lines';
import { useEditableLayoutPass } from '../react/hooks/use-editable-layout-pass';
import { useElementPath } from '../react/hooks/use-element-path';
import { useHydrated } from '../react/hooks/use-hydrated';
import {
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../react/plugin/react-editor';
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
import { isNativeFlowBlock, pagedLineTarget } from './paged-view-lines';

export * from './index';

type PagedViewLayout = Readonly<{
  measuredVersion: number;
  mountedPageIndexes: ReadonlySet<number> | 'all';
  root: HTMLElement | null;
  selectedPaths: readonly Path[];
  snapshot: PageLayoutSnapshot;
}>;

const lineStartAfterTrailingBreak = (
  editor: ReactRuntimeEditor,
  point: Point
) =>
  editor.read((state) => {
    const node = state.nodes.get(point.path)?.[0];

    return TextApi.isText(node) &&
      point.offset === node.text.length &&
      node.text.endsWith('\n')
      ? (state.points.after(point, { unit: 'offset' }) ?? point)
      : point;
  });

const createPagedViewLines = ({
  editor,
  readLayout,
  readVersion,
}: Readonly<{
  editor: ReactRuntimeEditor;
  readLayout: () => PagedViewLayout | null;
  readVersion: () => number;
}>): ViewLines => ({
  lineAfter: ({ direction, from, readX }) => {
    const layout = readLayout();

    if (!layout || layout.measuredVersion !== readVersion()) return null;
    const upper = from.side === 'upper';
    const target = pagedLineTarget({
      direction,
      from: {
        point: upper
          ? from.point
          : lineStartAfterTrailingBreak(editor, from.point),
        upper,
      },
      isSelectable: (path) =>
        editor.read((state) => {
          const start = state.points.start(path);

          return (
            !!start &&
            !state.nodes.above({
              at: start,
              match: (node) =>
                NodeApi.isElement(node) && !state.nodes.isSelectable(node),
              mode: 'highest',
              voids: true,
            })
          );
        }),
      mountedPageIndexes: layout.mountedPageIndexes,
      selectedPaths: layout.selectedPaths,
      snapshot: layout.snapshot,
    });

    if (!target) return null;
    const root = target.drawn ? layout.root : null;
    const { path } = target;

    return target.kind === 'line'
      ? landOnViewLine({
          editor,
          end: target.end,
          path,
          readX,
          root,
          start: target.start,
        })
      : landInViewBlock({ direction, editor, path, readX, root });
  },
});

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

const boxRect = (rects: readonly PageRect[]) => {
  const [first] = rects;
  const sharesLeftEdge = rects.every((rect) => rect.left === first.left);

  return {
    rect: sharesLeftEdge ? bounds(rects) : first,
    spillsPastBox: !sharesLeftEdge,
  };
};

const createElementLayouts = (
  fragments: readonly PageLayoutFragment[],
  placementsByPath: ReadonlyMap<string, readonly MountedFragment[]>,
  previous: ReadonlyMap<string, EditableElementLayout>
) => {
  const paths = new Map<string, Path>();
  const textPaths = new Set<string>();

  fragments.forEach((fragment) => {
    paths.set(pathKey(fragment.path), fragment.path);
    if (fragment.type === 'text') textPaths.add(pathKey(fragment.path));
    if (fragment.type === 'direct-children') {
      fragment.children.forEach((child) =>
        paths.set(pathKey(child.path), child.path)
      );
    }
  });
  const boxes = new Map<string, ReturnType<typeof boxRect>>();

  placementsByPath.forEach((placements, key) => {
    boxes.set(key, boxRect(placements.map((placement) => placement.rect)));
  });
  const layouts = new Map<string, EditableElementLayout>();

  paths.forEach((path, key) => {
    const box = boxes.get(key);

    if (!box) return;
    let parent = path.slice(0, -1);
    let parentRect: PageRect | undefined;

    while (parent.length > 0 && !parentRect) {
      parentRect = boxes.get(pathKey(parent))?.rect;
      parent = parent.slice(0, -1);
    }
    const layout = {
      hasTextLines: textPaths.has(key),
      height: box.rect.height,
      left: box.rect.left - (parentRect?.left ?? 0),
      spillsPastBox: box.spillsPastBox,
      top: box.rect.top - (parentRect?.top ?? 0),
      width: box.rect.width,
    };
    const kept = previous.get(key);

    // An equal layout keeps its object, so its element keeps its placement ref.
    layouts.set(
      key,
      kept &&
        kept.hasTextLines === layout.hasTextLines &&
        kept.height === layout.height &&
        kept.left === layout.left &&
        kept.spillsPastBox === layout.spillsPastBox &&
        kept.top === layout.top &&
        kept.width === layout.width
        ? kept
        : layout
    );
  });

  return layouts;
};

type TextFragment = Extract<PageLayoutFragment, { type: 'text' }>;
type TextLine = TextFragment['lines'][number];

type PaginationAdmission = Readonly<{
  parked: readonly TextFragment[];
  projected: readonly PageLayoutFragment[];
}>;

const EMPTY_ADMISSION: PaginationAdmission = { parked: [], projected: [] };

const admitFragments = (
  fragments: readonly PageLayoutFragment[],
  mountedPageIndexes: ReadonlySet<number>,
  mountedTopLevelIndexes: ReadonlySet<number>
): PaginationAdmission => {
  const projected: PageLayoutFragment[] = [];
  const parked: TextFragment[] = [];

  fragments.forEach((fragment) => {
    if (mountedPageIndexes.has(fragment.pageIndex)) {
      projected.push(fragment);
    } else if (
      fragment.type === 'text' &&
      mountedTopLevelIndexes.has(fragment.path[0])
    ) {
      parked.push(fragment);
    }
  });

  return { parked, projected };
};

const sameItems = <T,>(left: readonly T[], right: readonly T[]) =>
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

const reuseUnchangedAdmission = (
  previous: PaginationAdmission,
  next: PaginationAdmission
): PaginationAdmission => {
  const sameProjected = sameItems(previous.projected, next.projected);
  const sameParked = sameItems(previous.parked, next.parked);

  if (sameProjected && sameParked) return previous;
  return {
    parked: sameParked ? previous.parked : next.parked,
    projected: sameProjected ? previous.projected : next.projected,
  };
};

type ParkInterval = Readonly<{ end: number; path: Path; start: number }>;

const PARK_INTERVALS = new WeakMap<TextFragment, readonly ParkInterval[]>();

const readParkIntervals = (fragment: TextFragment) => {
  const cached = PARK_INTERVALS.get(fragment);

  if (cached) return cached;
  const intervals = new Map<string, ParkInterval>();

  fragment.lines.forEach((line) =>
    line.runs.forEach(({ source }) => {
      const key = pathKey(source.anchor.path);
      const start = Math.min(source.anchor.offset, source.focus.offset);
      const end = Math.max(source.anchor.offset, source.focus.offset);
      const current = intervals.get(key);

      intervals.set(key, {
        end: Math.max(end, current?.end ?? end),
        path: source.anchor.path,
        start: Math.min(start, current?.start ?? start),
      });
    })
  );
  const result = [...intervals.values()];

  PARK_INTERVALS.set(fragment, result);
  return result;
};

// A read-only view keeps the browser's own arrow motion, which the generated
// break serves. An editable view's shells drop the flag and break at their
// soft line end instead, which gives the next line's start a DOM point.
const NATIVE_FLOW_BREAK_RULE = `[${SOFT_LINE_FLAG}='true']::after{content:'\\A';white-space:pre}`;

const SOFT_LINE_END_RULE = `${SOFT_LINE_END_SELECTOR}::after{content:'\\A';white-space:pre}`;

// Find matches a phrase only within one text flow, so parked text stays in it.
// At full size a click on a drawn line resolves into the parked text under it
// despite pointer-events: none.
const PARK_RULE =
  '[data-pagination-unmounted-page]{opacity:0;pointer-events:none}' +
  '[data-pagination-unmounted-page],[data-pagination-unmounted-page] *{font-size:0!important;line-height:0!important;margin:0!important;padding:0!important;border-width:0!important}';

/**
 * A line whose last character is a hard `\n` already breaks under the run's
 * `white-space: pre`, so no run carries the native-flow break. A line that
 * ends at an inline void's empty text breaks after the run before the void,
 * because the void's renderer can wrap its text in an `inline-block`, as the
 * registry mention does, and a forced break inside an inline-block ends that
 * box's line, not the paragraph's.
 */
const nativeFlowBreakRunIndex = (
  line: TextLine,
  readNode: (path: Path) => Node | undefined,
  isVoid: (node: Node | undefined) => boolean
) => {
  const end = RangeApi.end(line.source);
  const endIndex = line.runs.findIndex((run) =>
    PointApi.equals(RangeApi.end(run.source), end)
  );
  const lastCharacter = line.runs.findLast(
    (run, index) => index <= endIndex && RangeApi.isExpanded(run.source)
  );

  if (lastCharacter) {
    const { offset, path } = RangeApi.end(lastCharacter.source);
    const node = readNode(path);

    if (TextApi.isText(node) && node.text[offset - 1] === '\n') return -1;
  }

  return line.runs.findLastIndex(
    (run, index) =>
      index <= endIndex &&
      (RangeApi.isExpanded(run.source) ||
        !isVoid(readNode(PathApi.parent(run.source.anchor.path))))
  );
};

const createPaginationBuckets = (
  editor: Editor,
  { parked, projected: fragments }: PaginationAdmission,
  geometry: PageLayoutGeometry,
  selectedPaths: readonly Path[]
): ReadonlyMap<NodeKey, readonly DecorationSlice[]> => {
  const buckets = new Map<NodeKey, DecorationSlice[]>();
  const blockRects = new Map<string, PageRect[]>();
  const push = (nodeKey: NodeKey, slice: DecorationSlice) => {
    const current = buckets.get(nodeKey) ?? [];

    current.push(slice);
    buckets.set(nodeKey, current);
  };

  fragments.forEach((fragment) => {
    if (fragment.type !== 'text') return;
    const key = pathKey(fragment.path);
    const rects = blockRects.get(key) ?? [];

    rects.push(toCanvasRect(fragment.rect, fragment.pageIndex, geometry));
    blockRects.set(key, rects);
  });
  const blockBoxes = new Map<string, PageRect>();

  blockRects.forEach((rects, key) => blockBoxes.set(key, boxRect(rects).rect));

  editor.read((state) => {
    const { index } = state.runtime.snapshot();

    fragments.forEach((fragment) => {
      if (fragment.type !== 'text') return;
      const blockKey = pathKey(fragment.path);
      const nativeFlow = isNativeFlowBlock(
        fragment.path,
        blockRects.get(blockKey)?.length ?? 0,
        selectedPaths
      );
      const blockRect =
        blockBoxes.get(blockKey) ??
        toCanvasRect(fragment.rect, fragment.pageIndex, geometry);

      fragment.lines.forEach((line, lineIndex) => {
        const breakRunIndex =
          nativeFlow && lineIndex < fragment.lines.length - 1
            ? nativeFlowBreakRunIndex(
                line,
                (path) => state.nodes.get(path)?.[0],
                (node) =>
                  NodeApi.isElement(node) && editor.read.schema.isVoid(node)
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
          const slice = createContainerDecorationSlice({
            attributes: Object.freeze(
              nativeFlow
                ? {
                    'data-pagination-line': true,
                    [SOFT_LINE_FLAG]: runIndex === breakRunIndex || undefined,
                    style: Object.freeze({ whiteSpace: 'pre' }),
                  }
                : {
                    'data-pagination-line': true,
                    style: Object.freeze({
                      display: 'inline-block',
                      height: rect.height,
                      left: `calc(${rect.left - blockRect.left}px - var(${RUN_ORIGIN_LEFT}, 0px))`,
                      lineHeight: `${rect.height}px`,
                      minWidth: rect.width === 0 ? 1 : undefined,
                      pointerEvents: 'auto',
                      position: 'absolute',
                      top: `calc(${rect.top - blockRect.top}px - var(${RUN_ORIGIN_TOP}, 0px))`,
                      whiteSpace: 'pre',
                      width: rect.width,
                    }),
                  }
            ),
            end: rangeEnd,
            key: `pagination:${fragment.pageIndex}:${blockKey}:${lineIndex}:${runIndex}`,
            start: rangeStart,
          });

          push(nodeKey, slice);
        });
      });
    });

    parked.forEach((fragment) => {
      const blockKey = pathKey(fragment.path);

      if (!blockBoxes.has(blockKey)) return;

      readParkIntervals(fragment).forEach(({ end, path, start }) => {
        const nodeKey = index.keyAt(path);

        if (!nodeKey) return;
        push(
          nodeKey,
          createContainerDecorationSlice({
            attributes: Object.freeze({
              'data-pagination-unmounted-page': fragment.pageIndex,
            }),
            end,
            key: `pagination-park:${fragment.pageIndex}:${blockKey}:${pathKey(path)}`,
            start,
          })
        );
      });
    });
  });

  return buckets;
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

const RUN_ORIGIN_LEFT = '--editor-run-origin-left';
const RUN_ORIGIN_TOP = '--editor-run-origin-top';

// Firefox measures an unmoved containing box a few hundredths of a pixel away
// after another block moves (15.01 px, then 15.02 px).
const RUN_ORIGIN_TOLERANCE = 0.05;

type RunOriginChange = readonly [
  runParent: HTMLElement,
  property: typeof RUN_ORIGIN_LEFT | typeof RUN_ORIGIN_TOP,
  value: string,
];

const readRunOriginChanges = (root: HTMLElement) => {
  const changes: RunOriginChange[] = [];
  const boxes = new Map<
    HTMLElement,
    { rect: DOMRect; scale: { x: number; y: number } }
  >();
  const parentRects = new Map<globalThis.Element, DOMRect>();
  const runParents = new Set<HTMLElement>();

  root
    .querySelectorAll<HTMLElement>('[data-pagination-line]')
    .forEach((run) => {
      const runParent = run.parentElement;

      if (
        run.style.position !== 'absolute' ||
        !runParent ||
        runParents.has(runParent)
      ) {
        return;
      }
      runParents.add(runParent);
      const { offsetParent } = run;
      const block = run.closest<HTMLElement>(
        '[data-editor-node="element"]:not([data-editor-inline="true"])'
      );

      if (!offsetParent || !block) return;
      let box = boxes.get(block);

      if (!box) {
        const placed = getElementPlacementBox(block);
        const rect = placed.getBoundingClientRect();

        box = { rect, scale: getElementTransformScale(placed, rect) };
        boxes.set(block, box);
      }
      let parentRect = parentRects.get(offsetParent);

      if (!parentRect) {
        parentRect = offsetParent.getBoundingClientRect();
        parentRects.set(offsetParent, parentRect);
      }
      const origin = {
        [RUN_ORIGIN_LEFT]:
          (parentRect.left - box.rect.left) / box.scale.x +
          offsetParent.clientLeft,
        [RUN_ORIGIN_TOP]:
          (parentRect.top - box.rect.top) / box.scale.y +
          offsetParent.clientTop,
      };

      for (const property of [RUN_ORIGIN_LEFT, RUN_ORIGIN_TOP] as const) {
        const current = Number.parseFloat(
          runParent.style.getPropertyValue(property)
        );

        if (
          Number.isNaN(current) ||
          Math.abs(origin[property] - current) >= RUN_ORIGIN_TOLERANCE
        ) {
          changes.push([
            runParent,
            property,
            `${Math.round(origin[property] * 100) / 100}px`,
          ]);
        }
      }
    });

  return changes;
};

const readRunOriginWrite = (root: HTMLElement) => {
  const changes = readRunOriginChanges(root);

  if (changes.length === 0) return null;
  return () => {
    changes.forEach(([runParent, property, value]) =>
      runParent.style.setProperty(property, value)
    );
  };
};

const useReportEachNewMeasureFailure = (editor: Editor, error: unknown) => {
  const lastReportedFailure = useRef<unknown>(null);

  useEffect(() => {
    if (!error) {
      lastReportedFailure.current = null;
      return;
    }
    const failure = error instanceof Error ? error.message : error;

    if (Object.is(failure, lastReportedFailure.current)) return;
    lastReportedFailure.current = failure;
    reportEditorLifecycleError({
      cause: error,
      editor,
      phase: 'measure',
      source: 'pagination',
    });
  }, [editor, error]);
};

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
  const invalidationVersion = useRef(documentVersion);

  useLayoutEffect(() => {
    invalidationVersion.current = readEditorVersion(editor);
    setDocumentVersion(invalidationVersion.current);
    return editor.subscribeCommit((change) => {
      if (
        change.changed.hasAny('document') ||
        (pageFieldKey !== null && change.dirtyStateKeys.includes(pageFieldKey))
      ) {
        invalidationVersion.current = change.version;
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

  useReportEachNewMeasureFailure(editor, measurement.error);
  useLayoutEffect(() => decorationStore.mount(), [decorationStore]);
  useEffect(() => () => decorationStore.destroy(), [decorationStore]);
  useLayoutEffect(() => {
    if (!editableHost) return undefined;
    return bindLayoutHost(editableHost, publishedStore);
  }, [editableHost, publishedStore]);
  useLayoutEffect(() => {
    publishedStore.setSnapshot(snapshot);
  }, [publishedStore, snapshot]);
  const viewLayout = useRef<PagedViewLayout | null>(null);
  const viewLines = useMemo(
    () =>
      createPagedViewLines({
        editor: toReactRuntimeEditor(editor),
        readLayout: () => viewLayout.current,
        readVersion: () => invalidationVersion.current,
      }),
    [editor]
  );
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
  const previousMountedTopLevelIndexes = useRef<readonly number[]>([]);
  const mountedTopLevelIndexes = useMemo(() => {
    const next = [
      ...new Set(windowedItems.flatMap((item) => item.topLevelIndexes)),
    ].sort((left, right) => left - right);
    const previous = previousMountedTopLevelIndexes.current;

    if (sameItems(previous, next)) return previous;
    previousMountedTopLevelIndexes.current = next;
    return next;
  }, [windowedItems]);
  const previousAdmission = useRef(EMPTY_ADMISSION);
  const admission = useMemo(() => {
    const fragments = snapshot?.fragments ?? [];
    const next = virtualize
      ? admitFragments(
          fragments,
          visiblePageIndexes,
          new Set(mountedTopLevelIndexes)
        )
      : { parked: EMPTY_ADMISSION.parked, projected: fragments };
    const kept = reuseUnchangedAdmission(previousAdmission.current, next);

    previousAdmission.current = kept;
    return kept;
  }, [
    mountedTopLevelIndexes,
    snapshot?.fragments,
    virtualize,
    visiblePageIndexes,
  ]);
  const projectedFragments = admission.projected;
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
  useLayoutEffect(() => {
    viewLayout.current = snapshot
      ? {
          measuredVersion: documentVersion,
          mountedPageIndexes: virtualize ? visiblePageIndexes : 'all',
          root: editableHost,
          selectedPaths,
          snapshot,
        }
      : null;
  }, [
    documentVersion,
    editableHost,
    selectedPaths,
    snapshot,
    virtualize,
    visiblePageIndexes,
  ]);
  const localBuckets = useMemo(
    () =>
      geometry
        ? createPaginationBuckets(editor, admission, geometry, selectedPaths)
        : new Map<NodeKey, readonly DecorationSlice[]>(),
    [admission, editor, geometry, selectedPaths]
  );
  // An inset change publishes no new layout, so the origins follow every
  // observed mutation instead of the measured geometry.
  useEditableLayoutPass(
    editor,
    editableHost,
    'Pagination run origins',
    readRunOriginWrite
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
        <style href="editor-pagination-native-flow-break" precedence="editor">
          {NATIVE_FLOW_BREAK_RULE}
        </style>
        <style href="editor-pagination-park" precedence="editor">
          {PARK_RULE}
        </style>
        <style href="editor-pagination-soft-line-end" precedence="editor">
          {SOFT_LINE_END_RULE}
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
              <TextRenderScopeContext value="paged">
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
                  viewLines={viewLines}
                />
              </TextRenderScopeContext>
            </ImperativeTextFlowContext>
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
    throw new Error('Omit root to render the primary document.');
  }
  const editor = useEditorContext();
  const inheritedReadOnly = useEditorReadOnly();
  const editable = <PagedEditableInner {...props} />;

  return root === undefined ? (
    editable
  ) : (
    <SurfaceRoot
      editor={editor}
      readOnly={props.readOnly || inheritedReadOnly}
      root={root}
    >
      {editable}
    </SurfaceRoot>
  );
};
