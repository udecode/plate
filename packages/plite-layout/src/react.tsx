import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { flushSync } from 'react-dom';
import type { Editor, EditorCommit, Path } from '@platejs/plite';
import {
  defaultScrollSelectionIntoView,
  Editable,
  type EditableDOMStrategyLayout,
  type EditableProps,
  useEditorState,
  useElementPath,
} from '@platejs/plite-react';

import {
  createPliteLayout,
  createPlitePageLayout,
  getPlitePageLayoutGeometry,
  getPlitePageLayoutProjection,
  type PliteLayoutOptions,
  type PlitePageLayout,
  type PlitePageLayoutFragment,
  type PlitePageLayoutMode,
  type PlitePageLayoutOptions,
  type PlitePageLayoutPage,
  type PlitePageLayoutProjectedLine,
  type PlitePageLayoutProjectedUnit,
  type PlitePageLayoutProjection,
  type PlitePageLayoutSnapshot,
  type PlitePageRect,
  type PlitePageSettings,
  type PlitePageSettingsSource,
} from './index';
import {
  createPagedEditablePageMountPlan,
  getPagedEditableVisiblePageMountItems,
} from './page-mount-plan';

type PliteLayoutFragmentContextValue = {
  layout: PlitePageLayout;
  projectedLinesByFragment: ReadonlyMap<
    string,
    readonly PlitePageLayoutProjectedLine[]
  >;
  projectedUnitsByFragment: ReadonlyMap<
    string,
    ReadonlyMap<string, PlitePageLayoutProjectedUnit>
  >;
  projection: PlitePageLayoutProjection;
  selectedPaths: readonly Path[];
  snapshot: PlitePageLayoutSnapshot;
  tracksContentViewport: boolean;
  visibleContentRange: PagedEditableViewport | null;
  visiblePageIndexes: ReadonlySet<number> | null;
};

const PliteLayoutFragmentContext =
  createContext<PliteLayoutFragmentContextValue | null>(null);

export type PliteLayoutRenderedFragment = Pick<
  PlitePageLayoutFragment,
  'blockIndex' | 'height' | 'id' | 'lineCount' | 'pageIndex' | 'path' | 'text'
> & {
  rect: PlitePageRect;
  units?: readonly PlitePageLayoutProjectedUnit[];
};

const getRectBounds = (rects: readonly PlitePageRect[]): PlitePageRect => {
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

const getPageSourceDependency = <
  TSettings extends PlitePageSettings = PlitePageSettings,
>(
  page: PlitePageSettingsSource<TSettings> | null | undefined
) => {
  if (!page) {
    return null;
  }

  if ('margins' in page && 'preset' in page) {
    return `${page.preset}:${JSON.stringify(page.margins)}`;
  }

  return page;
};

export type UsePlitePageLayoutOptions<
  TSettings extends PlitePageSettings = PlitePageSettings,
> = PlitePageLayoutOptions<TSettings>;

export type UsePliteLayoutOptions<
  TSettings extends PlitePageSettings = PlitePageSettings,
> = PliteLayoutOptions<TSettings>;

/** Create and subscribe a derived layout reader with the default engine. */
export const usePliteLayout = <
  TSettings extends PlitePageSettings = PlitePageSettings,
>(
  editor: Editor,
  options: UsePliteLayoutOptions<TSettings>
): PlitePageLayout => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const layout = useMemo(
    () => createPliteLayout(editor, () => optionsRef.current),
    [editor]
  );
  const didRunInitialRefreshEffectRef = useRef(false);
  const pageDependency = getPageSourceDependency(options.page);

  useEffect(() => {
    if (!didRunInitialRefreshEffectRef.current) {
      didRunInitialRefreshEffectRef.current = true;
      return;
    }

    layout.refresh('settings');
  }, [
    layout,
    options.engine,
    options.nodeLayout,
    options.root,
    options.typography,
    pageDependency,
  ]);

  useEffect(
    () => () => {
      layout.destroy();
    },
    [layout]
  );

  return layout;
};

/** Create and subscribe a derived layout reader with an explicit engine. */
export const usePlitePageLayout = <
  TSettings extends PlitePageSettings = PlitePageSettings,
>(
  editor: Editor,
  options: UsePlitePageLayoutOptions<TSettings>
): PlitePageLayout => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const layout = useMemo(
    () => createPlitePageLayout(editor, () => optionsRef.current),
    [editor]
  );
  const didRunInitialRefreshEffectRef = useRef(false);
  const pageDependency = getPageSourceDependency(options.page);

  useEffect(() => {
    if (!didRunInitialRefreshEffectRef.current) {
      didRunInitialRefreshEffectRef.current = true;
      return;
    }

    layout.refresh('settings');
  }, [
    layout,
    options.engine,
    options.nodeLayout,
    options.root,
    options.typography,
    pageDependency,
  ]);

  useEffect(
    () => () => {
      layout.destroy();
    },
    [layout]
  );

  return layout;
};

/** Read a `PlitePageLayout` snapshot with React external-store semantics. */
export const usePlitePageLayoutSnapshot = (
  layout: PlitePageLayout
): PlitePageLayoutSnapshot =>
  useSyncExternalStore(
    layout.subscribe,
    layout.getSnapshot,
    layout.getSnapshot
  );

/** Read a `PlitePageLayout` snapshot with React external-store semantics. */
export const usePliteLayoutSnapshot = (
  layout: PlitePageLayout
): PlitePageLayoutSnapshot =>
  useSyncExternalStore(
    layout.subscribe,
    layout.getSnapshot,
    layout.getSnapshot
  );

/**
 * Reads rendered layout fragments for a known Plite path.
 *
 * Use this when a renderer already has the element path and should avoid an
 * extra `useElementPath()` subscription.
 */
export const usePliteLayoutFragmentsAtPath = (
  targetPath: Path | null | undefined
): readonly PliteLayoutRenderedFragment[] => {
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
        .filter((unit): unit is PlitePageLayoutProjectedUnit => Boolean(unit))
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

export const usePliteLayoutFragments = (
  path?: Path | null
): readonly PliteLayoutRenderedFragment[] => {
  const elementPath = useElementPath();

  return usePliteLayoutFragmentsAtPath(path ?? elementPath);
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
    element?.querySelector<HTMLElement>('[data-plite-editor="true"]') ?? null;

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

type VirtualizedDOMStrategy = Extract<
  NonNullable<EditableProps['domStrategy']>,
  { type: 'virtualized' }
>;

const isVirtualizedDOMStrategy = (
  domStrategy: EditableProps['domStrategy']
): domStrategy is VirtualizedDOMStrategy =>
  typeof domStrategy === 'object' &&
  domStrategy != null &&
  'type' in domStrategy &&
  domStrategy.type === 'virtualized';

const getVirtualizedDOMStrategyOverscan = (
  domStrategy: EditableProps['domStrategy']
) =>
  isVirtualizedDOMStrategy(domStrategy)
    ? Math.max(0, domStrategy.overscan ?? 0)
    : 0;

type PagedEditableViewport = {
  bottom: number;
  top: number;
};

const CONTENT_VIEWPORT_OVERSCAN_RATIO = 0;

const isRectWithinVerticalRange = (
  rect: Pick<PlitePageRect, 'height' | 'top'>,
  range: PagedEditableViewport
) => rect.top + rect.height >= range.top && rect.top <= range.bottom;

const isPathWithin = (path: Path, ancestor: Path) =>
  ancestor.length <= path.length &&
  ancestor.every((segment, index) => path[index] === segment);

const samePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

const sameSelectedPaths = (
  left: readonly Path[] | null,
  right: readonly Path[] | null
) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every((path, index) => samePath(path, right[index]!)));

const getSelectionPathsKey = (selection: EditorCommit['selectionAfter']) =>
  selection
    ? `${selection.anchor.path.join('.')}:${selection.focus.path.join('.')}`
    : 'null';

const shouldUpdatePagedEditableSelectedPaths = (change?: EditorCommit) =>
  !change ||
  change.fullDocumentChanged ||
  change.rootRuntimeIdsChanged ||
  change.structureChanged ||
  change.topLevelOrderChanged ||
  (change.selectionChanged &&
    getSelectionPathsKey(change.selectionBefore) !==
      getSelectionPathsKey(change.selectionAfter));

const pathsOverlap = (left: Path, right: Path) =>
  isPathWithin(left, right) || isPathWithin(right, left);

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

export type PagedEditableRenderPageProps = {
  attributes: {
    'data-plite-page': true;
    'data-plite-page-index': number;
  };
  children: ReactNode | null;
  page: PlitePageLayoutPage;
};

export type PagedEditablePageView = {
  gap?: number;
  mode?: PlitePageLayoutMode;
};

export type PagedEditableProps = EditableProps & {
  layout: PlitePageLayout;
  pageView?: PagedEditablePageView;
  pageLayoutMode?: PlitePageLayoutMode;
  pageGap?: number;
  renderPage?: (props: PagedEditableRenderPageProps) => ReactNode;
};

const defaultRenderPage = ({
  attributes,
  children,
  page,
}: PagedEditableRenderPageProps) => (
  <div
    {...attributes}
    style={{
      background: 'white',
      border: '1px solid #d1d5db',
      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
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

const normalizePagedEditablePageView = ({
  pageGap,
  pageLayoutMode,
  pageView,
}: {
  pageGap?: number;
  pageLayoutMode?: PlitePageLayoutMode;
  pageView?: PagedEditablePageView | null;
}) => ({
  gap: pageView?.gap ?? pageGap ?? 24,
  mode: pageView?.mode ?? pageLayoutMode ?? 'single',
});

const createPagedEditableTopLevelLayoutItems = ({
  fragments,
  geometry,
  pages,
}: {
  fragments: readonly PlitePageLayoutFragment[];
  geometry: ReturnType<typeof getPlitePageLayoutGeometry>;
  pages: readonly PlitePageLayoutPage[];
}) => {
  const items = new Map<
    number,
    { end: number; left: number; right: number; start: number }
  >();

  for (const fragment of fragments) {
    const page = pages[fragment.pageIndex] ?? pages[0];
    const placement = geometry.pagePlacements[fragment.pageIndex] ?? {
      left: 0,
      top: page ? page.index * page.height : 0,
    };
    const left = placement.left + (page?.content.left ?? 0);
    const right = left + (page?.content.width ?? 0);

    const start = placement.top + fragment.top;
    const end = start + fragment.height;
    const current = items.get(fragment.blockIndex);

    items.set(
      fragment.blockIndex,
      current
        ? {
            end: Math.max(current.end, end),
            left: Math.min(current.left, left),
            right: Math.max(current.right, right),
            start: Math.min(current.start, start),
          }
        : { end, left, right, start }
    );
  }

  return [...items.entries()]
    .sort(([left], [right]) => left - right)
    .map(([index, item]) => ({
      index,
      left: item.left,
      size: Math.max(1, item.end - item.start),
      start: item.start,
      width: Math.max(1, item.right - item.left),
    }));
};

/** Render an `Editable` through page surfaces derived from `plite-layout`. */
export const PagedEditable = ({
  layout,
  pageGap,
  pageLayoutMode,
  pageView,
  renderPage = defaultRenderPage,
  style,
  ...editableProps
}: PagedEditableProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastViewportScrollAtRef = useRef(Number.NEGATIVE_INFINITY);
  const viewportStateRef = useRef<PagedEditableViewport | null>(null);
  const [viewport, setViewport] = useState<PagedEditableViewport | null>(null);
  const selectedPaths = useEditorState(
    (state) => {
      const selection = state.selection.get();

      return selection
        ? [selection.anchor.path, selection.focus.path]
        : EMPTY_SELECTED_PATHS;
    },
    {
      equalityFn: sameSelectedPaths,
      shouldUpdate: shouldUpdatePagedEditableSelectedPaths,
    }
  );
  const snapshot = usePlitePageLayoutSnapshot(layout);
  const pages = snapshot.pages.length === 0 ? [snapshot.page] : snapshot.pages;
  const normalizedPageView = normalizePagedEditablePageView({
    pageGap,
    pageLayoutMode,
    pageView,
  });
  const geometry = useMemo(
    () =>
      getPlitePageLayoutGeometry(pages, {
        pageGap: normalizedPageView.gap,
        pageLayoutMode: normalizedPageView.mode,
      }),
    [normalizedPageView.gap, normalizedPageView.mode, pages]
  );
  const pageMountPlan = useMemo(
    () =>
      createPagedEditablePageMountPlan({
        fragments: snapshot.fragments,
        geometry,
        mode: normalizedPageView.mode,
        pages,
      }),
    [geometry, normalizedPageView.mode, pages, snapshot.fragments]
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
  const virtualizesPageSurfaces = isVirtualizedDOMStrategy(
    editableProps.domStrategy
  );
  const topLevelLayoutItems = useMemo(
    () =>
      createPagedEditableTopLevelLayoutItems({
        fragments: snapshot.fragments,
        geometry,
        pages,
      }),
    [geometry, pages, snapshot.fragments]
  );
  const hasViewportWindowedUnits = useMemo(
    () =>
      snapshot.fragments.some((fragment) =>
        fragment.units?.some(
          (unit, index, units) => units.length > 1 || unit.kind === 'table-row'
        )
      ),
    [snapshot.fragments]
  );
  const [canTrackContentViewport, setCanTrackContentViewport] = useState(
    () => typeof window !== 'undefined'
  );
  const tracksContentViewport =
    virtualizesPageSurfaces || hasViewportWindowedUnits;
  const filtersContentViewport =
    tracksContentViewport && canTrackContentViewport;
  const pageSurfaceOverscan = getVirtualizedDOMStrategyOverscan(
    editableProps.domStrategy
  );
  useEffect(() => {
    if (!tracksContentViewport) {
      setCanTrackContentViewport(false);
      viewportStateRef.current = null;
      setViewport(null);
      return;
    }

    const root = rootRef.current;
    const scrollRoot = getPagedEditableScrollRoot(root);

    if (!root || !scrollRoot) {
      setCanTrackContentViewport(false);
      viewportStateRef.current = null;
      setViewport(null);
      return;
    }

    setCanTrackContentViewport(true);

    const update = ({ sync = false }: { sync?: boolean } = {}) => {
      const rootRect = root.getBoundingClientRect();
      const scrollRootRect = scrollRoot.getBoundingClientRect();
      const scrollRootIsInsideRoot =
        scrollRoot === root || root.contains(scrollRoot);
      const scrollOffset = scrollRootIsInsideRoot ? scrollRoot.scrollTop : 0;
      const scale =
        geometry.height > 0 && rootRect.height > 0
          ? rootRect.height / geometry.height
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
      const commit = () => {
        setViewport((previous) => {
          if (
            previous &&
            Math.abs(previous.top - nextViewport.top) < 1 &&
            Math.abs(previous.bottom - nextViewport.bottom) < 1
          ) {
            return previous;
          }

          viewportStateRef.current = nextViewport;
          return nextViewport;
        });
      };

      if (
        sync &&
        virtualizesPageSurfaces &&
        shouldSynchronizeViewportJump(viewportStateRef.current, nextViewport)
      ) {
        flushSync(commit);
      } else {
        commit();
      }
    };
    const updateAsync = () => update();
    const updateOnScroll = () => {
      lastViewportScrollAtRef.current = getNow();
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
  }, [geometry.height, tracksContentViewport]);
  const pageSurfaceItems = useMemo(
    () =>
      getPagedEditableVisiblePageMountItems(pageMountPlan, {
        gap: normalizedPageView.gap,
        overscan: pageSurfaceOverscan,
        pages,
        virtualizes: virtualizesPageSurfaces && canTrackContentViewport,
        viewport,
      }),
    [
      canTrackContentViewport,
      normalizedPageView.gap,
      pageMountPlan,
      pageSurfaceOverscan,
      pages,
      virtualizesPageSurfaces,
      viewport,
    ]
  );
  const pageContentItems = useMemo(() => {
    if (!virtualizesPageSurfaces || !canTrackContentViewport) {
      return null;
    }

    return getPagedEditableVisiblePageMountItems(pageMountPlan, {
      gap: normalizedPageView.gap,
      overscan: pageSurfaceOverscan,
      pages,
      virtualizes: true,
      viewport,
    });
  }, [
    canTrackContentViewport,
    normalizedPageView.gap,
    pageMountPlan,
    pageSurfaceOverscan,
    pages,
    virtualizesPageSurfaces,
    viewport,
  ]);
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
      pageContentItems
        ? new Set(pageContentItems.flatMap((item) => item.pageIndexes))
        : null,
    [pageContentItems]
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
      getPlitePageLayoutProjection(
        { ...snapshot, fragments: projectedFragments },
        {
          geometry,
          hitTesting: false,
        }
      ),
    [geometry, projectedFragments, snapshot]
  );
  const projectedUnitsByFragment = useMemo(() => {
    const byFragment = new Map<
      string,
      Map<string, PlitePageLayoutProjectedUnit>
    >();

    projection.units.forEach((unit) => {
      const units = byFragment.get(unit.fragmentId) ?? new Map();

      units.set(unit.key, unit);
      byFragment.set(unit.fragmentId, units);
    });

    return byFragment;
  }, [projection.units]);
  const projectedLinesByFragment = useMemo(() => {
    const byFragment = new Map<string, PlitePageLayoutProjectedLine[]>();

    projection.lines.forEach((line) => {
      const lines = byFragment.get(line.fragmentId) ?? [];

      lines.push(line);
      byFragment.set(line.fragmentId, lines);
    });

    return byFragment;
  }, [projection.lines]);
  const editableLayout = useMemo<EditableDOMStrategyLayout>(
    () => ({
      getVirtualizedPageItems: () =>
        pageMountPlan.items.map((item) => ({
          fragmentPaths: item.fragmentPaths,
          index: item.index,
          key: item.key,
          pageIndexes: item.pageIndexes,
          size: item.size,
          start: item.start,
          topLevelIndexes: item.topLevelIndexes,
          unitPaths: item.unitPaths,
        })),
      getVisibleVirtualizedPageItems: () =>
        pageContentItems?.map((item) => ({
          fragmentPaths: item.fragmentPaths,
          index: item.index,
          key: item.key,
          pageIndexes: item.pageIndexes,
          size: item.size,
          start: item.start,
          topLevelIndexes: item.topLevelIndexes,
          unitPaths: item.unitPaths,
        })) ?? null,
      getVirtualizedTopLevelItems: () => topLevelLayoutItems,
    }),
    [pageContentItems, pageMountPlan, topLevelLayoutItems]
  );
  const scrollSelectionIntoView = useMemo(() => {
    const scroll = editableProps.scrollSelectionIntoView;

    return ((editor, domRange) => {
      if (
        virtualizesPageSurfaces &&
        getNow() - lastViewportScrollAtRef.current <
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
  }, [editableProps.scrollSelectionIntoView, virtualizesPageSurfaces]);
  const editable = (
    <Editable
      {...editableProps}
      domStrategyLayout={editableLayout}
      scrollSelectionIntoView={scrollSelectionIntoView}
      style={{
        minHeight: geometry.height,
        position: 'relative',
        width: geometry.width,
        zIndex: 0,
        ...style,
      }}
    />
  );

  return (
    <PliteLayoutFragmentContext.Provider
      value={{
        layout,
        projectedLinesByFragment,
        projectedUnitsByFragment,
        projection,
        selectedPaths,
        snapshot,
        tracksContentViewport: filtersContentViewport,
        visibleContentRange,
        visiblePageIndexes,
      }}
    >
      <div
        data-plite-paged-editable
        data-plite-paged-editable-page-virtualization={
          virtualizesPageSurfaces ? 'true' : undefined
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
                data-plite-page-mount-item-index={item.index}
                data-plite-page-surface
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
                    'data-plite-page': true,
                    'data-plite-page-index': page.index,
                  },
                  children: null,
                  page,
                })}
              </div>
            );
          })
        )}
        <div
          data-plite-paged-editable-editor-overlay
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
            data-plite-paged-editable-editor
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
    </PliteLayoutFragmentContext.Provider>
  );
};
