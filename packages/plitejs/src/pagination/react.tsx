import React, {
  createContext,
  type ReactNode,
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
  type EditorCommit,
  type Path,
  PathApi,
  SelectionApi,
  type Value,
} from '..';
import { type EditableProps, useEditorState } from '../react';
import { defaultScrollSelectionIntoView } from '../react/components/editable';
import { WindowedEditable } from '../react/components/windowed-editable.internal';
import {
  createLayout,
  getPageLayoutGeometry,
  getPageLayoutProjection,
  type LayoutOptions,
  type PageLayout,
  type PageLayoutFragment,
  type PageLayoutMode,
  type PageLayoutPage,
  type PageLayoutProjectedLine,
  type PageLayoutProjectedUnit,
  type PageLayoutProjection,
  type PageLayoutSnapshot,
  type PageRect,
  type PageSettings,
  type PageSettingsSource,
} from './index';
import {
  connectLayoutRuntime,
  deferLayoutRuntimeConnection,
} from './layout-runtime-lifecycle';
import {
  createPagedEditablePageMountPlan,
  getPagedEditableVisiblePageMountItems,
} from './page-mount-plan';

export * from './index';

type PliteLayoutFragmentContextValue = {
  layout: PageLayout;
  projectedLinesByFragment: ReadonlyMap<
    string,
    readonly PageLayoutProjectedLine[]
  >;
  projectedUnitsByFragment: ReadonlyMap<
    string,
    ReadonlyMap<string, PageLayoutProjectedUnit>
  >;
  projection: PageLayoutProjection;
  selectedPaths: readonly Path[];
  snapshot: PageLayoutSnapshot;
  tracksContentViewport: boolean;
  visibleContentRange: PagedEditableViewport | null;
  visiblePageIndexes: ReadonlySet<number> | null;
};

const PliteLayoutFragmentContext =
  createContext<PliteLayoutFragmentContextValue | null>(null);

export type LayoutRenderedFragment = Pick<
  PageLayoutFragment,
  'blockIndex' | 'height' | 'id' | 'lineCount' | 'pageIndex' | 'path' | 'text'
> & {
  rect: PageRect;
  units?: readonly PageLayoutProjectedUnit[];
};

const getRectBounds = (rects: readonly PageRect[]): PageRect => {
  if (rects.length === 0) {
    return { height: 0, left: 0, top: 0, width: 0 };
  }

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return {
    height: bottom - top,
    left,
    top,
    width: right - left,
  };
};

const getPageSourceDependency = <TSettings extends PageSettings = PageSettings>(
  page: PageSettingsSource<TSettings> | null | undefined
) => {
  if (!page) {
    return null;
  }

  if ('margins' in page && 'preset' in page) {
    return `${page.preset}:${JSON.stringify(page.margins)}`;
  }

  return page;
};

export type UseLayoutOptions<TSettings extends PageSettings = PageSettings> =
  LayoutOptions<TSettings>;

/** Create and subscribe a derived layout reader with built-in or caller-owned measurement. */
export const useLayout = <
  TSettings extends PageSettings = PageSettings,
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  options: UseLayoutOptions<TSettings>
): PageLayout<LayoutOptions<TSettings>> => {
  const layout = useMemo(
    () =>
      createLayout<TSettings, V, TPlugins>(
        editor,
        deferLayoutRuntimeConnection(options)
      ),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Editor identity owns the layout; the committed reconfiguration effect applies option changes without replacing subscriptions.
    [editor]
  );
  const committedConfigurationRef = useRef({ layout, options });
  const pageDependency = getPageSourceDependency(options.page);
  const pageBreakMode = options.pageBreaks?.mode;
  const pageBreakSource = options.pageBreaks?.source;
  const pageBreakWriterId =
    pageBreakMode === 'write' ? options.pageBreaks?.writerId : null;
  const { textChangeRefresh } = options;
  const textChangeRefreshDelay =
    typeof textChangeRefresh === 'object'
      ? textChangeRefresh.delayMs
      : textChangeRefresh;
  const textChangeRefreshMaxDelay =
    typeof textChangeRefresh === 'object' ? textChangeRefresh.maxDelayMs : null;
  const textChangeRefreshMode =
    typeof textChangeRefresh === 'object' ? textChangeRefresh.mode : null;

  useEffect(() => connectLayoutRuntime(layout), [layout]);

  useEffect(() => {
    const committedConfiguration = committedConfigurationRef.current;

    if (committedConfiguration.layout !== layout) {
      committedConfigurationRef.current = { layout, options };
      return;
    }

    if (committedConfiguration.options === options) return;

    layout.reconfigure(options);
    committedConfigurationRef.current = { layout, options };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] The explicit dependency projection controls reconfiguration while the effect applies the latest complete options object.
  }, [
    layout,
    options.engine,
    options.nodeLayout,
    options.onError,
    pageBreakMode,
    pageBreakSource,
    pageBreakWriterId,
    options.root,
    textChangeRefreshDelay,
    textChangeRefreshMaxDelay,
    textChangeRefreshMode,
    options.typography,
    pageDependency,
  ]);

  return layout;
};

/** Read a `PageLayout` snapshot with React external-store semantics. */
export const useLayoutSnapshot = (layout: PageLayout): PageLayoutSnapshot =>
  useSyncExternalStore(
    layout.subscribe,
    layout.getSnapshot,
    layout.getSnapshot
  );

/**
 * Reads rendered layout fragments for a known editor path.
 */
export const useLayoutFragmentsAtPath = (
  targetPath: Path | null | undefined
): readonly LayoutRenderedFragment[] => {
  const context = useContext(PliteLayoutFragmentContext);

  return useMemo(() => {
    if (!context || !targetPath) {
      return [];
    }

    return context.layout.getFragments(targetPath).flatMap((fragment) => {
      const isSelectedFragment = context.selectedPaths.some((path) =>
        fragment.units?.length
          ? fragment.units.some((unit) => pathsOverlap(unit.path, path))
          : pathsOverlap(fragment.path, path)
      );

      if (
        context.visiblePageIndexes &&
        !context.visiblePageIndexes.has(fragment.pageIndex) &&
        !isSelectedFragment
      ) {
        return [];
      }

      const projectedUnits = context.projectedUnitsByFragment.get(fragment.id);
      const units = fragment.units
        ?.map((unit) => projectedUnits?.get(unit.key))
        .filter((unit): unit is PageLayoutProjectedUnit => Boolean(unit))
        .filter((unit) => {
          const selected = context.selectedPaths.some((path) =>
            pathsOverlap(unit.path, path)
          );

          if (context.visibleContentRange) {
            return (
              isRectWithinVerticalRange(
                unit.rect,
                context.visibleContentRange
              ) || selected
            );
          }

          return !context.tracksContentViewport || selected;
        });
      const lines = context.projectedLinesByFragment.get(fragment.id) ?? [];
      const rects = [
        ...(units?.map((unit) => unit.rect) ?? []),
        ...lines.map((line) => line.hitRect),
      ];

      return {
        blockIndex: fragment.blockIndex,
        height: fragment.height,
        id: fragment.id,
        lineCount: fragment.lineCount,
        pageIndex: fragment.pageIndex,
        path: fragment.path,
        rect: getRectBounds(rects),
        text: fragment.text,
        units,
      };
    });
  }, [context, targetPath]);
};

const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

const parseCSSPixels = (value: string | null | undefined) => {
  if (!value || value === 'auto' || value === 'none') {
    return 0;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const canUseElementAsPagedEditableScrollRoot = (
  element: HTMLElement | null
) => {
  if (!element) {
    return false;
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflow = `${style?.overflow ?? ''} ${style?.overflowY ?? ''}`;
  const hasScrollableOverflow = SCROLLABLE_OVERFLOW_PATTERN.test(overflow);
  const hasBoundedHeight =
    element.clientHeight > 0 ||
    parseCSSPixels(style?.height) > 0 ||
    parseCSSPixels(style?.maxHeight) > 0;

  return hasScrollableOverflow && hasBoundedHeight;
};

const getPagedEditableScrollRoot = (
  element: HTMLElement | null
): HTMLElement | null => {
  const editableRoot =
    element?.querySelector<HTMLElement>('[data-editor="true"]') ?? null;

  if (canUseElementAsPagedEditableScrollRoot(editableRoot)) {
    return editableRoot;
  }

  let current = element;

  while (current) {
    if (canUseElementAsPagedEditableScrollRoot(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};

type PagedEditableViewport = {
  bottom: number;
  top: number;
};

const CONTENT_VIEWPORT_OVERSCAN_RATIO = 0;

const isRectWithinVerticalRange = (
  rect: Pick<PageRect, 'height' | 'top'>,
  range: PagedEditableViewport
) => rect.top + rect.height >= range.top && rect.top <= range.bottom;

const sameSelectedPaths = (
  left: readonly Path[] | null,
  right: readonly Path[] | null
) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every((path, index) => PathApi.equals(path, right[index])));

const getSelectionPaths = (
  selection: EditorCommit['selectionAfter']
): readonly Path[] =>
  SelectionApi.isNode(selection)
    ? selection.paths
    : selection
      ? [selection.anchor.path, selection.focus.path]
      : EMPTY_SELECTED_PATHS;

const getSelectionPathsKey = (selection: EditorCommit['selectionAfter']) =>
  selection
    ? `${SelectionApi.root(selection) ?? 'main'}:${getSelectionPaths(selection)
        .map((path) => path.join('.'))
        .join(';')}`
    : 'null';

const shouldUpdatePagedEditableSelectedPaths = (change?: EditorCommit) =>
  !change ||
  change.changed.hasAny('structure') ||
  change.changed.hasAny('root-order') ||
  (change.selectionChanged &&
    getSelectionPathsKey(change.selectionBefore) !==
      getSelectionPathsKey(change.selectionAfter));

const pathsOverlap = (left: Path, right: Path) => PathApi.isCommon(left, right);

const EMPTY_SELECTED_PATHS = Object.freeze([]) as readonly Path[];
const USER_SCROLL_SELECTION_SCROLL_SUPPRESSION_MS = 500;
const VIEWPORT_SYNC_JUMP_RATIO = 0.75;

const getNow = () =>
  typeof performance === 'undefined' ? Date.now() : performance.now();

const shouldSynchronizeViewportJump = (
  previous: PagedEditableViewport | null,
  next: PagedEditableViewport
) => {
  if (!previous) {
    return true;
  }

  const previousHeight = Math.max(1, previous.bottom - previous.top);

  return (
    Math.abs(next.top - previous.top) >
    previousHeight * VIEWPORT_SYNC_JUMP_RATIO
  );
};

type PagedEditableViewportSnapshot = {
  canTrackContentViewport: boolean;
  viewport: PagedEditableViewport | null;
};

type PagedEditableViewportConfiguration = {
  geometryHeight: number;
  root: HTMLDivElement | null;
  tracksContentViewport: boolean;
  virtualizesPageSurfaces: boolean;
};

const INACTIVE_PAGED_EDITABLE_VIEWPORT: PagedEditableViewportSnapshot = {
  canTrackContentViewport: false,
  viewport: null,
};

const getInactivePagedEditableViewport = () => INACTIVE_PAGED_EDITABLE_VIEWPORT;

const createPagedEditableViewportStore = () => {
  const listeners = new Set<() => void>();
  let configuration: PagedEditableViewportConfiguration = {
    geometryHeight: 0,
    root: null,
    tracksContentViewport: false,
    virtualizesPageSurfaces: false,
  };
  let cleanup: (() => void) | null = null;
  let lastScrollAt = Number.NEGATIVE_INFINITY;
  let snapshot = INACTIVE_PAGED_EDITABLE_VIEWPORT;

  const getSnapshot = () => snapshot;
  const publish = (
    nextSnapshot: PagedEditableViewportSnapshot,
    sync = false
  ) => {
    if (snapshot === nextSnapshot) return;

    const commit = () => {
      snapshot = nextSnapshot;
      listeners.forEach((listener) => {
        listener();
      });
    };

    if (sync) {
      flushSync(commit);
    } else {
      commit();
    }
  };
  const start = ({
    geometryHeight,
    root,
    tracksContentViewport,
    virtualizesPageSurfaces,
  }: PagedEditableViewportConfiguration) => {
    if (!tracksContentViewport) {
      publish(INACTIVE_PAGED_EDITABLE_VIEWPORT);
      return () => {};
    }

    const scrollRoot = getPagedEditableScrollRoot(root);

    if (!root || !scrollRoot) {
      publish(INACTIVE_PAGED_EDITABLE_VIEWPORT);
      return () => {};
    }

    const update = ({ sync = false }: { sync?: boolean } = {}) => {
      const rootRect = root.getBoundingClientRect();
      const scrollRootRect = scrollRoot.getBoundingClientRect();
      const scrollRootIsInsideRoot =
        scrollRoot === root || root.contains(scrollRoot);
      const scrollOffset = scrollRootIsInsideRoot ? scrollRoot.scrollTop : 0;
      const scale =
        geometryHeight > 0 && rootRect.height > 0
          ? rootRect.height / geometryHeight
          : 1;
      const top = Math.max(
        0,
        (scrollRootRect.top - rootRect.top + scrollOffset) / scale
      );
      const nextViewport = {
        bottom: Math.max(
          top,
          (scrollRootRect.bottom - rootRect.top + scrollOffset) / scale
        ),
        top,
      };
      const previousViewport = snapshot.viewport;

      if (
        snapshot.canTrackContentViewport &&
        previousViewport &&
        Math.abs(previousViewport.top - nextViewport.top) < 1 &&
        Math.abs(previousViewport.bottom - nextViewport.bottom) < 1
      ) {
        return;
      }

      publish(
        { canTrackContentViewport: true, viewport: nextViewport },
        sync &&
          virtualizesPageSurfaces &&
          shouldSynchronizeViewportJump(previousViewport, nextViewport)
      );
    };
    const updateAsync = () => {
      update();
    };
    const updateOnScroll = () => {
      lastScrollAt = getNow();
      update({ sync: true });
    };

    updateAsync();
    scrollRoot.addEventListener('scroll', updateOnScroll, { passive: true });
    root.ownerDocument.defaultView?.addEventListener('resize', updateAsync);

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateAsync);

    observer?.observe(root);
    observer?.observe(scrollRoot);

    return () => {
      scrollRoot.removeEventListener('scroll', updateOnScroll);
      root.ownerDocument.defaultView?.removeEventListener(
        'resize',
        updateAsync
      );
      observer?.disconnect();
    };
  };
  const restart = () => {
    cleanup?.();
    cleanup = listeners.size > 0 ? start(configuration) : null;
  };

  return {
    configure: (nextConfiguration: PagedEditableViewportConfiguration) => {
      configuration = nextConfiguration;
      restart();
    },
    getLastScrollAt: () => lastScrollAt,
    getSnapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      if (listeners.size === 1) restart();

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0) restart();
      };
    },
  };
};

export type PagedEditableRenderPageProps = {
  attributes: {
    'data-editor-page': true;
    'data-editor-page-index': number;
  };
  children: ReactNode | null;
  page: PageLayoutPage;
};

export type PagedEditablePageView = {
  gap?: number;
  mode?: PageLayoutMode;
};

export type PagedEditableProps = EditableProps & {
  layout: PageLayout;
  pageView?: PagedEditablePageView;
  renderPage?: (props: PagedEditableRenderPageProps) => ReactNode;
  /** Permit pagination to omit offscreen page surfaces and document roots. */
  virtualize?: boolean;
};

const defaultRenderPage = ({
  attributes,
  children,
  page,
}: PagedEditableRenderPageProps) => (
  <div
    {...attributes}
    style={{
      boxSizing: 'border-box',
      height: page.height,
      overflow: 'hidden',
      pointerEvents: 'none',
      position: 'relative',
      width: page.width,
    }}
  >
    {children}
  </div>
);

/** Render an `Editable` through page surfaces derived by pagination. */
export const PagedEditable = ({
  ignoreBlankEditableRootClicks = true,
  layout,
  pageView,
  renderPage = defaultRenderPage,
  style,
  virtualize = false,
  ...editableProps
}: PagedEditableProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [promotedTopLevelIndex, setPromotedTopLevelIndex] = useState<
    number | null
  >(null);
  const [viewportStore] = useState(() => createPagedEditableViewportStore());
  const selectedPaths = useEditorState(
    (state) => {
      const selectedNodes = state.selection.nodes();

      if (selectedNodes.length > 0) {
        return selectedNodes.map(([, path]) => path);
      }

      const selection = state.selection();

      return selection
        ? [selection.anchor.path, selection.focus.path]
        : EMPTY_SELECTED_PATHS;
    },
    {
      equalityFn: sameSelectedPaths,
      shouldUpdate: shouldUpdatePagedEditableSelectedPaths,
    }
  );
  const snapshot = useLayoutSnapshot(layout);
  // Preserve page-list identity because it feeds DOM subscription boundaries.
  const pages = useMemo(
    () => (snapshot.pages.length === 0 ? [snapshot.page] : snapshot.pages),
    [snapshot.page, snapshot.pages]
  );
  const gap = pageView?.gap ?? 24;
  const mode = pageView?.mode ?? 'single';
  const geometry = useMemo(
    () =>
      getPageLayoutGeometry(pages, {
        pageGap: gap,
        pageLayoutMode: mode,
      }),
    [gap, mode, pages]
  );
  const pageMountPlan = useMemo(
    () =>
      createPagedEditablePageMountPlan({
        fragments: snapshot.fragments,
        geometry,
        mode,
        pages,
      }),
    [geometry, mode, pages, snapshot.fragments]
  );
  const pageRenderDataByIndex = useMemo(
    () =>
      new Map(
        pages.map((page, index) => [
          page.index,
          {
            page,
            placement: geometry.pagePlacements[index] ?? { left: 0, top: 0 },
          },
        ])
      ),
    [geometry.pagePlacements, pages]
  );
  const tracksContentViewport = virtualize;
  useLayoutEffect(() => {
    viewportStore.configure({
      geometryHeight: geometry.height,
      root: rootRef.current,
      tracksContentViewport,
      virtualizesPageSurfaces: virtualize,
    });
  }, [geometry.height, tracksContentViewport, viewportStore, virtualize]);
  const { canTrackContentViewport, viewport } = useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
    getInactivePagedEditableViewport
  );
  const filtersContentViewport =
    tracksContentViewport && canTrackContentViewport;
  const pageContentItems = useMemo(() => {
    if (!virtualize) {
      return null;
    }

    return getPagedEditableVisiblePageMountItems(pageMountPlan, {
      gap,
      overscan: 0,
      pages,
      virtualizes: true,
      viewport: canTrackContentViewport ? viewport : null,
    });
  }, [
    canTrackContentViewport,
    gap,
    pageMountPlan,
    pages,
    virtualize,
    viewport,
  ]);
  const windowedPageItems = useMemo(() => {
    if (!pageContentItems) return pageMountPlan.items;

    const itemIndexes = new Set(pageContentItems.map((item) => item.index));
    const requiredTopLevelIndexes = [
      ...selectedPaths.map((path) => path[0]),
      promotedTopLevelIndex,
    ];

    requiredTopLevelIndexes.forEach((topLevelIndex) => {
      if (typeof topLevelIndex !== 'number') return;
      pageMountPlan.itemIndexesByTopLevelIndex
        .get(topLevelIndex)
        ?.forEach((itemIndex) => itemIndexes.add(itemIndex));
    });

    return pageMountPlan.items.filter((item) => itemIndexes.has(item.index));
  }, [pageContentItems, pageMountPlan, promotedTopLevelIndex, selectedPaths]);
  const pageSurfaceItems = virtualize ? windowedPageItems : pageMountPlan.items;
  const visibleContentRange = useMemo(() => {
    if (!filtersContentViewport || !viewport) {
      return null;
    }

    const viewportHeight = Math.max(0, viewport.bottom - viewport.top);
    const overscanSize = viewportHeight * CONTENT_VIEWPORT_OVERSCAN_RATIO;

    return {
      bottom: viewport.bottom + overscanSize,
      top: Math.max(0, viewport.top - overscanSize),
    };
  }, [filtersContentViewport, viewport]);
  const visiblePageIndexes = useMemo(
    () =>
      virtualize
        ? new Set(windowedPageItems.flatMap((item) => item.pageIndexes))
        : null,
    [virtualize, windowedPageItems]
  );
  const projectedFragments = useMemo(() => {
    if (!visiblePageIndexes) {
      return snapshot.fragments;
    }

    return snapshot.fragments.filter(
      (fragment) =>
        visiblePageIndexes.has(fragment.pageIndex) ||
        selectedPaths.some((path) => pathsOverlap(fragment.path, path))
    );
  }, [selectedPaths, snapshot.fragments, visiblePageIndexes]);
  const projection = useMemo(
    () =>
      getPageLayoutProjection(
        { ...snapshot, fragments: projectedFragments },
        {
          geometry,
          hitTesting: false,
        }
      ),
    [geometry, projectedFragments, snapshot]
  );
  const projectedUnitsByFragment = useMemo(() => {
    const byFragment = new Map<string, Map<string, PageLayoutProjectedUnit>>();

    projection.units.forEach((unit) => {
      const units = byFragment.get(unit.fragmentId) ?? new Map();

      units.set(unit.key, unit);
      byFragment.set(unit.fragmentId, units);
    });

    return byFragment;
  }, [projection.units]);
  const projectedLinesByFragment = useMemo(() => {
    const byFragment = new Map<string, PageLayoutProjectedLine[]>();

    projection.lines.forEach((line) => {
      const lines = byFragment.get(line.fragmentId) ?? [];

      lines.push(line);
      byFragment.set(line.fragmentId, lines);
    });

    return byFragment;
  }, [projection.lines]);
  const scrollSelectionIntoView = useMemo(() => {
    const scroll = editableProps.scrollSelectionIntoView;

    return ((editor, domRange) => {
      if (
        tracksContentViewport &&
        getNow() - viewportStore.getLastScrollAt() <
          USER_SCROLL_SELECTION_SCROLL_SUPPRESSION_MS
      ) {
        return;
      }

      if (scroll) {
        (scroll as (editor: Editor, domRange: globalThis.Range) => void)(
          editor,
          domRange
        );
        return;
      }

      defaultScrollSelectionIntoView(
        editor as Parameters<typeof defaultScrollSelectionIntoView>[0],
        domRange
      );
    }) satisfies NonNullable<EditableProps['scrollSelectionIntoView']>;
  }, [
    editableProps.scrollSelectionIntoView,
    tracksContentViewport,
    viewportStore,
  ]);
  const mountedTopLevelIndexes = useMemo(
    () =>
      [
        ...new Set(windowedPageItems.flatMap((item) => item.topLevelIndexes)),
      ].sort((left, right) => left - right),
    [windowedPageItems]
  );
  const requestMount = useCallback((index: number) => {
    setPromotedTopLevelIndex(index);
  }, []);
  const scrollToPath = useCallback(
    (path: Path, align: 'auto' | 'center' | 'end' | 'start' = 'auto') => {
      const topLevelIndex = path[0];

      if (typeof topLevelIndex !== 'number') return false;
      const itemIndex =
        pageMountPlan.itemIndexesByTopLevelIndex.get(topLevelIndex)?.[0];
      const item =
        typeof itemIndex === 'number' ? pageMountPlan.items[itemIndex] : null;
      const scrollRoot = getPagedEditableScrollRoot(rootRef.current);

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
  const commonEditableProps = {
    ...editableProps,
    ignoreBlankEditableRootClicks,
    scrollSelectionIntoView,
    style: {
      minHeight: geometry.height,
      position: 'relative' as const,
      width: geometry.width,
      zIndex: 0,
      ...style,
    },
  };
  const editable = (
    <WindowedEditable
      {...commonEditableProps}
      enabled={virtualize}
      mountedTopLevelIndexes={mountedTopLevelIndexes}
      onRequestMount={requestMount}
      scrollToPath={scrollToPath}
      totalSize={geometry.height}
    />
  );
  const fragmentContextValue = useMemo(
    () => ({
      layout,
      projectedLinesByFragment,
      projectedUnitsByFragment,
      projection,
      selectedPaths,
      snapshot,
      tracksContentViewport: filtersContentViewport,
      visibleContentRange,
      visiblePageIndexes,
    }),
    [
      filtersContentViewport,
      layout,
      projectedLinesByFragment,
      projectedUnitsByFragment,
      projection,
      selectedPaths,
      snapshot,
      visibleContentRange,
      visiblePageIndexes,
    ]
  );

  return (
    <PliteLayoutFragmentContext value={fragmentContextValue}>
      <div
        data-editor-paged-editable
        data-editor-paged-editable-page-virtualization={
          virtualize ? 'true' : undefined
        }
        ref={rootRef}
        style={{
          minHeight: geometry.height,
          position: 'relative',
          width: geometry.width,
        }}
      >
        {pageSurfaceItems.flatMap((item) =>
          item.pageIndexes.map((pageIndex) => {
            const renderData = pageRenderDataByIndex.get(pageIndex);

            if (!renderData) {
              return null;
            }

            const { page, placement } = renderData;

            return (
              <div
                data-editor-page-mount-item-index={item.index}
                data-editor-page-surface
                key={page.index}
                style={{
                  height: page.height,
                  left: placement.left,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: placement.top,
                  width: page.width,
                  zIndex: 0,
                }}
              >
                {renderPage({
                  attributes: {
                    'data-editor-page': true,
                    'data-editor-page-index': page.index,
                  },
                  children: null,
                  page,
                })}
              </div>
            );
          })
        )}
        <div
          data-editor-paged-editable-editor-overlay
          style={{
            height: geometry.height,
            left: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            width: geometry.width,
            zIndex: 1,
          }}
        >
          <div
            data-editor-paged-editable-editor
            style={{
              inset: 0,
              pointerEvents: 'auto',
              position: 'absolute',
            }}
          >
            {editable}
          </div>
        </div>
      </div>
    </PliteLayoutFragmentContext>
  );
};
