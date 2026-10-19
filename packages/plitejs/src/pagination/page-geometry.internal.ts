import type {
  PageLayoutFragment,
  PageLayoutMode,
  PageLayoutPage,
  PageLayoutSize,
  PageRect,
} from './index';

export type PageLayoutGeometry = Readonly<{
  height: number;
  occupiedSizes: readonly PageLayoutSize[];
  pagePlacements: ReadonlyArray<Readonly<{ left: number; top: number }>>;
  width: number;
}>;

export const createPageLayoutGeometry = ({
  fragments,
  gap = 24,
  mode = 'single',
  pages,
}: {
  fragments: readonly PageLayoutFragment[];
  gap?: number;
  mode?: PageLayoutMode;
  pages: readonly PageLayoutPage[];
}): PageLayoutGeometry => {
  const occupiedSizes = pages.map((page) => {
    const pageFragments = fragments.filter(
      (fragment) => fragment.pageIndex === page.index
    );

    return {
      height: Math.max(
        page.height,
        ...pageFragments.map(
          (fragment) => fragment.rect.top + fragment.rect.height
        )
      ),
      width: Math.max(
        page.width,
        ...pageFragments.map(
          (fragment) => fragment.rect.left + fragment.rect.width
        )
      ),
    };
  });

  if (mode === 'spread') {
    const placements: Array<{ left: number; top: number }> = [];
    let top = 0;
    let width = 0;

    for (let index = 0; index < pages.length; index += 2) {
      const left = occupiedSizes[index] ?? { height: 0, width: 0 };
      const right = occupiedSizes[index + 1];

      placements[index] = { left: 0, top };
      if (right) placements[index + 1] = { left: left.width + gap, top };

      width = Math.max(width, left.width + (right ? gap + right.width : 0));
      top += Math.max(left.height, right?.height ?? 0);
      if (index + 2 < pages.length) top += gap;
    }

    return { height: top, occupiedSizes, pagePlacements: placements, width };
  }

  const pagePlacements: Array<{ left: number; top: number }> = [];
  let top = 0;
  let width = 0;

  occupiedSizes.forEach((size, index) => {
    pagePlacements[index] = { left: 0, top };
    width = Math.max(width, size.width);
    top += size.height + (index < occupiedSizes.length - 1 ? gap : 0);
  });

  return { height: top, occupiedSizes, pagePlacements, width };
};

export const toCanvasRect = (
  rect: PageRect,
  pageIndex: number,
  geometry: PageLayoutGeometry
): PageRect => {
  const placement = geometry.pagePlacements[pageIndex] ?? { left: 0, top: 0 };

  return {
    ...rect,
    left: placement.left + rect.left,
    top: placement.top + rect.top,
  };
};

export const bounds = (rects: readonly PageRect[]): PageRect => {
  if (rects.length === 0) return { height: 0, left: 0, top: 0, width: 0 };
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return { height: bottom - top, left, top, width: right - left };
};
