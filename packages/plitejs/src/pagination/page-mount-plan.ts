import type { Path } from '..';
import type {
  PageLayoutFragment,
  PageLayoutMode,
  PageLayoutPage,
} from './index';
import type { PageLayoutGeometry } from './page-geometry.internal';

type PageFragmentIndex = {
  children?: ReadonlyArray<Readonly<{ path: Path }>>;
  pageIndex: number;
  path: Path;
  type: PageLayoutFragment['type'];
};

export type PagedEditablePageMountItem = {
  childPaths: readonly Path[];
  fragmentPaths: readonly Path[];
  index: number;
  key: string;
  pageIndexes: readonly number[];
  size: number;
  start: number;
  topLevelIndexes: readonly number[];
};

export type PagedEditablePageMountPlan = {
  itemIndexesByPath: ReadonlyMap<string, readonly number[]>;
  itemIndexesByTopLevelIndex: ReadonlyMap<number, readonly number[]>;
  items: readonly PagedEditablePageMountItem[];
};

export type PagedEditablePageMountViewport = {
  bottom: number;
  top: number;
};

const getPageMountGroups = (
  pages: readonly PageLayoutPage[],
  mode: PageLayoutMode
) => {
  if (mode === 'spread') {
    const groups: number[][] = [];

    for (let index = 0; index < pages.length; index += 2) {
      const pageIndexes = [pages[index]?.index, pages[index + 1]?.index].filter(
        (pageIndex): pageIndex is number => typeof pageIndex === 'number'
      );

      if (pageIndexes.length > 0) {
        groups.push(pageIndexes);
      }
    }

    return groups;
  }

  return pages.map((page) => [page.index]);
};

export const createPagedEditablePageMountPlan = ({
  fragments,
  geometry,
  mode,
  pages,
}: {
  fragments: readonly PageFragmentIndex[];
  geometry: PageLayoutGeometry;
  mode: PageLayoutMode;
  pages: readonly PageLayoutPage[];
}): PagedEditablePageMountPlan => {
  const itemIndexesByPath = new Map<string, number[]>();
  const itemIndexesByTopLevelIndex = new Map<number, number[]>();
  const fragmentsByPageIndex = new Map<number, PageFragmentIndex[]>();
  const pageArrayIndexByPageIndex = new Map(
    pages.map((page, index) => [page.index, index] as const)
  );

  for (const fragment of fragments) {
    const pageFragments = fragmentsByPageIndex.get(fragment.pageIndex) ?? [];

    pageFragments.push(fragment);
    fragmentsByPageIndex.set(fragment.pageIndex, pageFragments);
  }

  const groups = getPageMountGroups(pages, mode);
  const items = groups.map<PagedEditablePageMountItem>((pageIndexes, index) => {
    const itemFragments = pageIndexes.flatMap(
      (pageIndex) => fragmentsByPageIndex.get(pageIndex) ?? []
    );
    const topLevelIndexes = [
      ...new Set(
        itemFragments.flatMap((fragment) => [
          fragment.path[0],
          ...(fragment.type === 'direct-children'
            ? (fragment.children ?? []).map((child) => child.path[0])
            : []),
        ])
      ),
    ]
      .filter(
        (topLevelIndex): topLevelIndex is number =>
          typeof topLevelIndex === 'number'
      )
      .sort((left, right) => left - right);
    const fragmentPaths = itemFragments.map((fragment) => fragment.path);
    const childPaths = itemFragments.flatMap((fragment) =>
      fragment.type === 'direct-children'
        ? (fragment.children ?? []).map((child) => child.path)
        : []
    );
    const placements = pageIndexes.map((pageIndex) => {
      const pageArrayIndex = pageArrayIndexByPageIndex.get(pageIndex);

      return pageArrayIndex == null
        ? { left: 0, top: 0 }
        : (geometry.pagePlacements[pageArrayIndex] ?? { left: 0, top: 0 });
    });
    const start = Math.min(...placements.map((placement) => placement.top));
    const size = pageIndexes.reduce((height, pageIndex) => {
      const pageArrayIndex = pageArrayIndexByPageIndex.get(pageIndex);
      const placement =
        pageArrayIndex == null ? null : geometry.pagePlacements[pageArrayIndex];
      const occupied =
        pageArrayIndex == null ? null : geometry.occupiedSizes[pageArrayIndex];

      if (!occupied || !placement) {
        return height;
      }

      return Math.max(height, placement.top + occupied.height - start);
    }, 0);

    for (const topLevelIndex of topLevelIndexes) {
      const current = itemIndexesByTopLevelIndex.get(topLevelIndex) ?? [];

      current.push(index);
      itemIndexesByTopLevelIndex.set(topLevelIndex, current);
    }
    for (const path of [...fragmentPaths, ...childPaths]) {
      const key = path.join('.');
      const current = itemIndexesByPath.get(key) ?? [];

      if (!current.includes(index)) current.push(index);
      itemIndexesByPath.set(key, current);
    }

    return {
      childPaths,
      fragmentPaths,
      index,
      key: `page-mount:${pageIndexes.join('-')}`,
      pageIndexes,
      size,
      start,
      topLevelIndexes,
    };
  });

  return { itemIndexesByPath, itemIndexesByTopLevelIndex, items };
};

export const getPagedEditableMountedPageIndexes = (
  plan: PagedEditablePageMountPlan,
  {
    composingTopLevelIndex,
    promotedTopLevelIndex,
    selectedTopLevelIndex,
    visibleItemIndexes,
  }: {
    composingTopLevelIndex?: number | null;
    promotedTopLevelIndex?: number | null;
    selectedTopLevelIndex?: number | null;
    visibleItemIndexes: Iterable<number>;
  }
): readonly number[] => {
  const itemIndexes = new Set(visibleItemIndexes);

  for (const topLevelIndex of [
    selectedTopLevelIndex,
    promotedTopLevelIndex,
    composingTopLevelIndex,
  ]) {
    if (typeof topLevelIndex !== 'number') {
      continue;
    }

    for (const itemIndex of plan.itemIndexesByTopLevelIndex.get(
      topLevelIndex
    ) ?? []) {
      itemIndexes.add(itemIndex);
    }
  }

  const pageIndexes = new Set<number>();

  for (const itemIndex of itemIndexes) {
    const item = plan.items[itemIndex];

    if (!item) {
      continue;
    }

    for (const pageIndex of item.pageIndexes) {
      pageIndexes.add(pageIndex);
    }
  }

  return [...pageIndexes].sort((left, right) => left - right);
};

export const getPagedEditableVisiblePageMountItems = (
  plan: PagedEditablePageMountPlan,
  {
    gap,
    overscan,
    pages,
    virtualizes,
    viewport,
  }: {
    gap: number;
    overscan: number;
    pages: readonly PageLayoutPage[];
    virtualizes: boolean;
    viewport: PagedEditablePageMountViewport | null;
  }
): readonly PagedEditablePageMountItem[] => {
  if (!virtualizes) {
    return plan.items;
  }

  const firstPageHeight = pages[0]?.height ?? 1024;
  const pageStride = firstPageHeight + gap;
  const overscanSize = overscan * pageStride;
  const effectiveViewport = viewport ?? { bottom: firstPageHeight, top: 0 };

  return plan.items.filter(
    (item) =>
      item.start + item.size >= effectiveViewport.top - overscanSize &&
      item.start <= effectiveViewport.bottom + overscanSize
  );
};
