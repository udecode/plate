import type { Path, Range } from '..';
import type {
  PageLayoutBlock,
  PageLayoutEngineInput,
  PageLayoutEngineOutput,
  PageLayoutFragment,
  PageLayoutPage,
  PageLayoutSize,
  PageMargins,
  PagePreset,
  PageRect,
  PageSettings,
} from './index';

const PAGE_PRESETS: Record<PagePreset, PageLayoutSize> = {
  a4: { height: 1123, width: 794 },
  letter: { height: 1056, width: 816 },
};

const normalizeMargins = (margins: PageMargins) =>
  typeof margins === 'number'
    ? { bottom: margins, left: margins, right: margins, top: margins }
    : margins;

export const createPage = (
  settings: PageSettings,
  index = 0
): PageLayoutPage => {
  const size = PAGE_PRESETS[settings.preset];
  const margins = normalizeMargins(settings.margins);

  return {
    content: {
      height: Math.max(0, size.height - margins.top - margins.bottom),
      left: margins.left,
      top: margins.top,
      width: Math.max(0, size.width - margins.left - margins.right),
    },
    height: size.height,
    index,
    width: size.width,
  };
};

type TextBlock = Extract<PageLayoutBlock, { type: 'text' }>;

export type MeasuredRun = Readonly<{
  blockEnd: number;
  blockStart: number;
  left: number;
  source: Range;
  width: number;
}>;

export type MeasuredLine = Readonly<{
  end: number;
  height: number;
  runs: readonly MeasuredRun[];
  source: Range;
  start: number;
  width: number;
}>;

type MeasuredBlock =
  | (TextBlock & { lines: readonly MeasuredLine[] })
  | Exclude<PageLayoutBlock, { type: 'text' }>;

type TextLineMode = 'estimated' | 'measured';

type TextLineSource = Readonly<{
  lines: (
    block: TextBlock,
    mode: TextLineMode,
    page: PageLayoutPage
  ) => readonly MeasuredLine[];
  mode: (
    block: TextBlock,
    blockIndex: number,
    input: PageLayoutEngineInput
  ) => TextLineMode;
}>;

type FlowPoint = Readonly<{ pageIndex: number; top: number }>;

type PageFrame = Readonly<{ first: PageLayoutPage; later: PageLayoutPage }>;

type Measurement = Readonly<{
  measured: MeasuredBlock;
  mode: TextLineMode | null;
}>;

type BlockPlacement = Measurement &
  Readonly<{
    block: PageLayoutBlock;
    end: FlowPoint;
    fragments: readonly PageLayoutFragment[];
    start: FlowPoint;
  }>;

type Composition = Readonly<{
  output: PageLayoutEngineOutput;
  page: PageLayoutPage;
  placements: readonly BlockPlacement[];
}>;

export type PageComposer = Readonly<{
  compose: (input: PageLayoutEngineInput) => PageLayoutEngineOutput;
  composeReusing: (input: PageLayoutEngineInput) => PageLayoutEngineOutput;
  reset: () => void;
}>;

export const createFragmentRect = (rects: readonly PageRect[]): PageRect => {
  if (rects.length === 0) return { height: 0, left: 0, top: 0, width: 0 };

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return { height: bottom - top, left, top, width: right - left };
};

export const freezeOwnedRange = (range: Range): Range => {
  if (Object.isFrozen(range)) return range;

  if (!Object.isFrozen(range.anchor.path)) Object.freeze(range.anchor.path);
  if (!Object.isFrozen(range.anchor)) Object.freeze(range.anchor);
  if (!Object.isFrozen(range.focus.path)) Object.freeze(range.focus.path);
  if (!Object.isFrozen(range.focus)) Object.freeze(range.focus);
  return Object.freeze(range);
};

const freezeOwnedFragment = (fragment: PageLayoutFragment) => {
  Object.freeze(fragment.path);
  Object.freeze(fragment.rect);
  if (fragment.type === 'direct-children') {
    fragment.children.forEach((child) => {
      Object.freeze(child.path);
      Object.freeze(child.rect);
      Object.freeze(child);
    });
    Object.freeze(fragment.children);
  } else if (fragment.type === 'text') {
    fragment.lines.forEach((line) => {
      Object.freeze(line.rect);
      line.runs.forEach((run) => {
        Object.freeze(run.rect);
        freezeOwnedRange(run.source);
        Object.freeze(run);
      });
      Object.freeze(line.runs);
      freezeOwnedRange(line.source);
      Object.freeze(line);
    });
    Object.freeze(fragment.lines);
  }
  Object.freeze(fragment);
};

const placeBlock = (
  block: MeasuredBlock,
  start: FlowPoint,
  frame: PageFrame
): Readonly<{ end: FlowPoint; fragments: PageLayoutFragment[] }> => {
  const contentAt = (index: number) =>
    (index === 0 ? frame.first : frame.later).content;
  const fragments: PageLayoutFragment[] = [];
  let { pageIndex } = start;
  let content = contentAt(pageIndex);
  let cursorTop = start.top;

  const advancePage = () => {
    pageIndex += 1;
    content = contentAt(pageIndex);
    cursorTop = content.top;
  };
  const ensureFits = (height: number) => {
    const remaining = content.top + content.height - cursorTop;

    if (cursorTop !== content.top && height > remaining) advancePage();
  };

  if (block.type === 'atomic') {
    ensureFits(block.size.height);
    fragments.push({
      pageIndex,
      path: [...block.path],
      rect: {
        height: block.size.height,
        left: content.left,
        top: cursorTop,
        width: block.size.width,
      },
      type: 'atomic',
    });
    cursorTop += block.size.height + block.spacingAfter;

    return { end: { pageIndex, top: cursorTop }, fragments };
  }

  if (block.type === 'direct-children') {
    let consumed = 0;

    while (consumed < block.children.length) {
      const fragmentChildren: Array<{ path: Path; rect: PageRect }> = [];

      while (consumed < block.children.length) {
        const child = block.children[consumed];
        const remaining = content.top + content.height - cursorTop;
        const pageIsEmpty = cursorTop === content.top;

        if (child.size.height > remaining && !pageIsEmpty) break;

        fragmentChildren.push({
          path: [...child.path],
          rect: {
            height: child.size.height,
            left: content.left,
            top: cursorTop,
            width: child.size.width,
          },
        });
        cursorTop += child.size.height;
        consumed += 1;

        if (child.size.height > remaining && pageIsEmpty) break;
      }

      if (fragmentChildren.length === 0) {
        advancePage();
        continue;
      }

      fragments.push({
        children: fragmentChildren,
        pageIndex,
        path: [...block.path],
        rect: createFragmentRect(fragmentChildren.map((child) => child.rect)),
        type: 'direct-children',
      });

      if (consumed < block.children.length) advancePage();
    }

    cursorTop += block.spacingAfter;

    return { end: { pageIndex, top: cursorTop }, fragments };
  }

  const totalHeight =
    block.lines.reduce((sum, line) => sum + line.height, 0) +
    block.spacingAfter;

  if (block.keepTogether && totalHeight <= frame.first.content.height) {
    ensureFits(totalHeight);
  }

  let consumed = 0;

  while (consumed < block.lines.length) {
    const fragmentLines: Array<{
      rect: PageRect;
      runs: Array<{ rect: PageRect; source: Range }>;
      source: Range;
    }> = [];

    while (consumed < block.lines.length) {
      const line = block.lines[consumed];
      const remaining = content.top + content.height - cursorTop;
      const pageIsEmpty = cursorTop === content.top;

      if (line.height > remaining && !pageIsEmpty) break;

      const measuredWidth = Math.max(
        line.width,
        ...line.runs.map((run) => run.left + run.width)
      );

      fragmentLines.push({
        rect: {
          height: line.height,
          left: content.left,
          top: cursorTop,
          width: measuredWidth,
        },
        runs: line.runs.map((run) => ({
          rect: {
            height: line.height,
            left: content.left + run.left,
            top: cursorTop,
            width: run.width,
          },
          source: run.source,
        })),
        source: line.source,
      });
      cursorTop += line.height;
      consumed += 1;

      if (line.height > remaining && pageIsEmpty) break;
    }

    if (fragmentLines.length === 0) {
      advancePage();
      continue;
    }

    fragments.push({
      lines: fragmentLines,
      pageIndex,
      path: [...block.path],
      rect: createFragmentRect(fragmentLines.map((line) => line.rect)),
      type: 'text',
    });

    if (consumed < block.lines.length) advancePage();
  }

  cursorTop += block.spacingAfter;

  return { end: { pageIndex, top: cursorTop }, fragments };
};

const samePageFrame = (left: PageLayoutPage, right: PageLayoutPage) =>
  left.height === right.height &&
  left.width === right.width &&
  left.content.height === right.content.height &&
  left.content.left === right.content.left &&
  left.content.top === right.content.top &&
  left.content.width === right.content.width;

const createFlowPage = (
  frame: PageFrame,
  index: number,
  frozen: boolean
): PageLayoutPage => {
  if (index === 0) return frame.first;

  const next = { ...frame.later, content: { ...frame.later.content }, index };

  if (!frozen) return next;
  Object.freeze(next.content);
  return Object.freeze(next);
};

export const createPageComposer = (source: TextLineSource): PageComposer => {
  let last: Composition | null = null;
  let generation = 0;

  const measure = (
    block: PageLayoutBlock,
    blockIndex: number,
    input: PageLayoutEngineInput,
    previous: BlockPlacement | undefined,
    started: number
  ): Measurement => {
    if (block.type !== 'text') {
      return previous?.block === block
        ? previous
        : { measured: block, mode: null };
    }

    const mode = source.mode(block, blockIndex, input);

    if (
      previous?.block === block &&
      previous.mode === mode &&
      generation === started
    ) {
      return previous;
    }
    return {
      measured: { ...block, lines: source.lines(block, mode, input.page) },
      mode,
    };
  };

  const composeFrom = (
    input: PageLayoutEngineInput,
    previous: Composition | null,
    frozen: boolean
  ): Composition => {
    const started = generation;
    const frame: PageFrame = {
      first: input.page,
      later: createPage(input.settings, 1),
    };
    const reusable =
      previous && samePageFrame(previous.page, input.page) ? previous : null;
    const placements: BlockPlacement[] = [];
    let start: FlowPoint = { pageIndex: 0, top: input.page.content.top };
    let unchanged =
      reusable !== null && reusable.placements.length === input.blocks.length;

    input.blocks.forEach((block, blockIndex) => {
      const old = reusable?.placements[blockIndex];
      const measurement = measure(block, blockIndex, input, old, started);

      if (
        measurement === old &&
        old.start.pageIndex === start.pageIndex &&
        old.start.top === start.top
      ) {
        placements.push(old);
        start = old.end;
        return;
      }

      const placed = placeBlock(measurement.measured, start, frame);

      if (frozen) placed.fragments.forEach(freezeOwnedFragment);
      placements.push({
        ...measurement,
        block,
        end: placed.end,
        fragments: placed.fragments,
        start,
      });
      start = placed.end;
      unchanged = false;
    });

    if (unchanged && reusable) return reusable;

    const fragments = placements.flatMap((placement) => placement.fragments);
    const pages = Array.from(
      { length: start.pageIndex + 1 },
      (_, index) =>
        reusable?.output.pages[index] ?? createFlowPage(frame, index, frozen)
    );

    return {
      output: frozen
        ? { fragments: Object.freeze(fragments), pages: Object.freeze(pages) }
        : { fragments, pages },
      page: input.page,
      placements,
    };
  };

  return Object.freeze({
    compose: (input: PageLayoutEngineInput) =>
      composeFrom(input, null, false).output,
    composeReusing: (input: PageLayoutEngineInput) => {
      const started = generation;
      const composition = composeFrom(input, last, true);

      last = generation === started ? composition : null;
      return composition.output;
    },
    reset: () => {
      last = null;
      generation += 1;
    },
  });
};
