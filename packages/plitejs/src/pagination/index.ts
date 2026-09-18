import {
  clearCache as clearPretextCache,
  layoutWithLines,
  measureNaturalWidth,
  prepareWithSegments,
} from '@chenglou/pretext';
import {
  materializeRichInlineLineRange,
  prepareRichInline,
  walkRichInlineLineRanges,
} from '@chenglou/pretext/rich-inline';

import {
  type Descendant,
  defineValueCodec,
  type Editor as EditorType,
  type EditorStateField,
  type Element,
  type ElementOf,
  type NamedRootKey,
  NodeApi,
  type Path,
  type Range,
  type RootKey,
  type TextOf,
  type Value,
} from '..';
import { toInternalRoot } from '../core/public-root';
import type { AnyEditor } from '../interfaces/editor';
import { registerPageLayoutEngineInvalidator } from './page-layout-engine-invalidation.internal';

const MAIN_ROOT_KEY: RootKey = 'main';

export type PagePreset = 'a4' | 'letter';

export type PageMargins =
  | number
  | Readonly<{
      bottom: number;
      left: number;
      right: number;
      top: number;
    }>;

export type PageSettings = Readonly<{
  margins: PageMargins;
  preset: PagePreset;
}>;

export type PageSettingsSource<TSettings extends PageSettings = PageSettings> =
  | EditorStateField<TSettings>
  | TSettings;

export type PageRect = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export type PageLayoutSize = Readonly<{
  height: number;
  width: number;
}>;

export type PageLayoutPage = Readonly<{
  content: PageRect;
  height: number;
  index: number;
  width: number;
}>;

export type PageLayoutMode = 'single' | 'spread';

export type PageLayoutTextStyle = Readonly<{
  font: string;
  letterSpacing?: number;
}>;

export type PageLayoutBlockStyle = Readonly<{
  blockSpacing?: number;
  lineHeight: number;
}>;

export type PageLayoutRun = Readonly<{
  source: Range;
  text: string;
  textStyle: PageLayoutTextStyle;
}>;

export type PageLayoutBlock = Readonly<
  { path: Path; spacingAfter: number } & (
    | {
        keepTogether: boolean;
        lineHeight: number;
        runs: readonly PageLayoutRun[];
        type: 'text';
      }
    | { size: PageLayoutSize; type: 'atomic' }
    | {
        children: ReadonlyArray<
          Readonly<{
            path: Path;
            size: PageLayoutSize;
          }>
        >;
        type: 'direct-children';
      }
  )
>;

export type PageLayoutFragment = Readonly<
  {
    pageIndex: number;
    path: Path;
    rect: PageRect;
  } & (
    | {
        lines: ReadonlyArray<
          Readonly<{
            rect: PageRect;
            runs: ReadonlyArray<
              Readonly<{
                rect: PageRect;
                source: Range;
              }>
            >;
            source: Range;
          }>
        >;
        type: 'text';
      }
    | { type: 'atomic' }
    | {
        children: ReadonlyArray<Readonly<{ path: Path; rect: PageRect }>>;
        type: 'direct-children';
      }
  )
>;

export type PageLayoutSnapshot = Readonly<{
  fragments: readonly PageLayoutFragment[];
  pages: readonly PageLayoutPage[];
  root?: NamedRootKey;
  settings: PageSettings;
  version: number;
}>;

export type NodeFragmentationPlan =
  | Readonly<{ keepTogether?: boolean; type: 'text' }>
  | Readonly<{ size: PageLayoutSize; type: 'atomic' }>
  | Readonly<{
      sizes: readonly PageLayoutSize[];
      type: 'direct-children';
    }>;

export type NodeFragmentationProvider<TElement extends Element = Element> =
  (context: {
    content: PageLayoutSize;
    element: TElement;
    path: Path;
  }) => NodeFragmentationPlan | undefined;

export type PageLayoutTypography<TElement extends Element = Element> =
  Readonly<{
    block?: (context: {
      element: TElement;
      path: Path;
    }) => PageLayoutBlockStyle;
    text?: (context: {
      element: TElement;
      leaf: TextOf<TElement>;
      path: Path;
    }) => PageLayoutTextStyle;
  }>;

export type PageLayoutEngineInput = Readonly<{
  blocks: readonly PageLayoutBlock[];
  page: PageLayoutPage;
  settings: PageSettings;
  version: number;
}>;

export type PageLayoutEngineOutput = Pick<
  PageLayoutSnapshot,
  'fragments' | 'pages'
>;

export type PageLayoutEngine = Readonly<{
  compose: (input: PageLayoutEngineInput) => PageLayoutEngineOutput;
  invalidate?: () => void;
}>;

export type PretextPageLayoutEngineOptions = Readonly<{
  estimateBlock?: (context: {
    block: PageLayoutBlock;
    blockIndex: number;
    page: PageLayoutPage;
    settings: PageSettings;
  }) => boolean;
  maxPreparedEntries?: number;
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'keep-all' | 'normal';
}>;

type PaginationInputs<TElement extends Element> = Readonly<{
  fragmentation?: NodeFragmentationProvider<TElement>;
  page: PageSettingsSource;
  typography?: PageLayoutTypography<TElement>;
}>;

export type MeasurePagesOptions<TElement extends Element = Element> =
  PaginationInputs<TElement> &
    Readonly<{
      engine: PageLayoutEngine;
      root?: NamedRootKey;
    }>;

const PAGE_PRESETS: Record<PagePreset, PageLayoutSize> = {
  a4: { height: 1123, width: 794 },
  letter: { height: 1056, width: 816 },
};

const DEFAULT_TEXT_STYLE: PageLayoutTextStyle = {
  font: '400 16px Arial, sans-serif',
  letterSpacing: 0,
};

const DEFAULT_BLOCK_STYLE: PageLayoutBlockStyle = {
  blockSpacing: 12,
  lineHeight: 24,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const decodePageMargins = (value: unknown): PageMargins => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!isRecord(value)) throw new Error('Invalid Plite page margins.');

  const { bottom, left, right, top } = value;

  if (
    ![bottom, left, right, top].every(
      (margin) => typeof margin === 'number' && Number.isFinite(margin)
    )
  ) {
    throw new Error('Invalid Plite page margins.');
  }

  return {
    bottom: bottom as number,
    left: left as number,
    right: right as number,
    top: top as number,
  };
};

const decodePageSettings = (value: unknown): PageSettings => {
  if (
    !isRecord(value) ||
    (value.preset !== 'a4' && value.preset !== 'letter')
  ) {
    throw new Error('Invalid Plite page settings.');
  }

  return {
    margins: decodePageMargins(value.margins),
    preset: value.preset,
  };
};

export const pageSettingsCodec = defineValueCodec<PageSettings>({
  decode: decodePageSettings,
  encode: decodePageSettings,
  version: 1,
});

const normalizeMargins = (margins: PageMargins) =>
  typeof margins === 'number'
    ? { bottom: margins, left: margins, right: margins, top: margins }
    : margins;

const createPage = (settings: PageSettings, index = 0): PageLayoutPage => {
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

const isFiniteSize = (size: PageLayoutSize) =>
  Number.isFinite(size.height) &&
  Number.isFinite(size.width) &&
  size.height >= 0 &&
  size.width >= 0;

const samePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const rangeRoot = (root: NamedRootKey | undefined) =>
  root === undefined ? {} : { root };

const createRange = (
  path: Path,
  start: number,
  end: number,
  root: NamedRootKey | undefined
): Range => {
  const sourcePath = Object.isFrozen(path)
    ? path
    : (Object.freeze([...path]) as Path);

  return {
    anchor: { offset: start, path: sourcePath, ...rangeRoot(root) },
    focus: { offset: end, path: sourcePath, ...rangeRoot(root) },
  };
};

const getRangeEdges = (range: Range) => {
  const { anchor, focus } = range;

  return anchor.offset <= focus.offset
    ? { end: focus.offset, start: anchor.offset }
    : { end: anchor.offset, start: focus.offset };
};

const getBlockStyle = <TElement extends Element>(
  typography: PageLayoutTypography<TElement> | undefined,
  element: TElement,
  path: Path
): PageLayoutBlockStyle => ({
  ...DEFAULT_BLOCK_STYLE,
  ...typography?.block?.({ element, path }),
});

const getTextStyle = <TElement extends Element>(
  typography: PageLayoutTypography<TElement> | undefined,
  element: TElement,
  leaf: TextOf<TElement>,
  path: Path
): PageLayoutTextStyle => ({
  ...DEFAULT_TEXT_STYLE,
  ...typography?.text?.({ element, leaf, path }),
});

const isSupportedInlineFlow = (editor: AnyEditor, element: Element): boolean =>
  element.children.every((child) => {
    if (NodeApi.isText(child)) return true;
    if (!editor.read.schema.isInline(child)) return false;

    return isSupportedInlineFlow(editor, child);
  });

const extractTextRuns = <TElement extends Element>(
  element: TElement,
  path: Path,
  root: NamedRootKey | undefined,
  typography: PageLayoutTypography<TElement> | undefined
): readonly PageLayoutRun[] => {
  const runs = [...NodeApi.texts(element)].map(([leaf, leafPath]) => {
    const sourcePath = [...path, ...leafPath];

    return {
      source: createRange(sourcePath, 0, leaf.text.length, root),
      text: leaf.text,
      textStyle: getTextStyle(
        typography,
        element,
        leaf as TextOf<TElement>,
        sourcePath
      ),
    };
  });

  return runs.length > 0
    ? runs
    : [
        {
          source: createRange([...path, 0], 0, 0, root),
          text: '',
          textStyle: getTextStyle(
            typography,
            element,
            { text: '' } as TextOf<TElement>,
            [...path, 0]
          ),
        },
      ];
};

const extractBlocks = <TElement extends Element>(
  editor: AnyEditor,
  children: readonly Descendant[],
  root: NamedRootKey | undefined,
  page: PageLayoutPage,
  fragmentation: NodeFragmentationProvider<TElement> | undefined,
  typography: PageLayoutTypography<TElement> | undefined
): readonly PageLayoutBlock[] =>
  children.flatMap<PageLayoutBlock>((node, index) => {
    if (!NodeApi.isElement(node)) return [];

    const element = node as TElement;
    const path = [index];
    const style = getBlockStyle(typography, element, path);
    const plan = fragmentation?.({
      content: {
        height: page.content.height,
        width: page.content.width,
      },
      element,
      path,
    });
    const supportedInlineFlow = isSupportedInlineFlow(editor, element);
    const resolved =
      plan ?? (supportedInlineFlow ? ({ type: 'text' } as const) : undefined);

    if (!resolved) {
      throw new Error(
        `Pagination requires an explicit fragmentation plan for ${String(element.type ?? 'this element')} at [${path.join(',')}].`
      );
    }

    const spacingAfter = style.blockSpacing ?? 0;

    if (resolved.type === 'text') {
      if (!supportedInlineFlow) {
        throw new Error(
          `Pagination text fragmentation requires one supported inline flow at [${path.join(',')}].`
        );
      }

      return [
        {
          keepTogether: resolved.keepTogether ?? false,
          lineHeight: style.lineHeight,
          path,
          runs: extractTextRuns(element, path, root, typography),
          spacingAfter,
          type: 'text' as const,
        },
      ];
    }

    if (resolved.type === 'atomic') {
      if (!isFiniteSize(resolved.size)) {
        throw new Error(
          `Pagination atomic size must be finite and nonnegative at [${path.join(',')}].`
        );
      }

      return [
        {
          path,
          size: { ...resolved.size },
          spacingAfter,
          type: 'atomic' as const,
        },
      ];
    }

    if (
      element.children.length === 0 ||
      element.children.some((child) => !NodeApi.isElement(child)) ||
      resolved.sizes.length !== element.children.length
    ) {
      throw new Error(
        `Pagination direct-children fragmentation requires one size for every element child at [${path.join(',')}].`
      );
    }
    if (resolved.sizes.some((size) => !isFiniteSize(size))) {
      throw new Error(
        `Pagination direct-child sizes must be finite and nonnegative at [${path.join(',')}].`
      );
    }

    return [
      {
        children: resolved.sizes.map((size, childIndex) => ({
          path: [...path, childIndex],
          size: { ...size },
        })),
        path,
        spacingAfter,
        type: 'direct-children' as const,
      },
    ];
  });

type FlatRun = PageLayoutRun & {
  blockEnd: number;
  blockStart: number;
};

type MeasuredRun = Readonly<{
  blockEnd: number;
  blockStart: number;
  left: number;
  source: Range;
  width: number;
}>;

type MeasuredLine = Readonly<{
  end: number;
  height: number;
  runs: readonly MeasuredRun[];
  source: Range;
  start: number;
  width: number;
}>;

type MeasuredTextBlock = Extract<PageLayoutBlock, { type: 'text' }> & {
  lines: readonly MeasuredLine[];
};

type MeasuredBlock =
  | MeasuredTextBlock
  | Exclude<PageLayoutBlock, { type: 'text' }>;

const flattenRuns = (
  block: Extract<PageLayoutBlock, { type: 'text' }>
): readonly FlatRun[] => {
  let offset = 0;

  return block.runs.map((run) => {
    const blockStart = offset;
    const blockEnd = blockStart + run.text.length;

    offset = blockEnd;

    return { ...run, blockEnd, blockStart };
  });
};

const getBlockText = (block: Extract<PageLayoutBlock, { type: 'text' }>) =>
  block.runs.map((run) => run.text).join('');

const createSourceRange = (
  runs: readonly FlatRun[],
  start: number,
  end: number
): Range => {
  const first =
    runs.find(
      (run) =>
        run.blockEnd > start ||
        (run.text.length === 0 && run.blockEnd === start)
    ) ?? runs.at(-1);

  if (!first) throw new Error('Pagination text block has no source run.');

  const last =
    [...runs]
      .reverse()
      .find(
        (run) =>
          run.blockStart < end ||
          (run.text.length === 0 && run.blockStart === end)
      ) ?? first;
  const firstEdges = getRangeEdges(first.source);
  const lastEdges = getRangeEdges(last.source);

  return {
    anchor: {
      ...first.source.anchor,
      offset:
        firstEdges.start +
        Math.max(0, Math.min(first.text.length, start - first.blockStart)),
    },
    focus: {
      ...last.source.focus,
      offset:
        lastEdges.start +
        Math.max(0, Math.min(last.text.length, end - last.blockStart)),
    },
  };
};

const createMeasuredRuns = (
  block: Extract<PageLayoutBlock, { type: 'text' }>,
  start: number,
  end: number,
  measure: (text: string, style: PageLayoutTextStyle) => number,
  flatRuns = flattenRuns(block)
): readonly MeasuredRun[] => {
  const measured: MeasuredRun[] = [];
  let left = 0;

  for (const run of flatRuns) {
    const blockStart = Math.max(start, run.blockStart);
    const blockEnd = Math.min(end, run.blockEnd);

    if (
      blockEnd < blockStart ||
      (blockEnd === blockStart && run.text.length > 0)
    ) {
      continue;
    }

    const textStart = blockStart - run.blockStart;
    const textEnd = blockEnd - run.blockStart;
    const width = measure(
      run.text.slice(textStart, textEnd).replaceAll('\n', ''),
      run.textStyle
    );
    const edges = getRangeEdges(run.source);

    measured.push({
      blockEnd,
      blockStart,
      left,
      source: createRange(
        run.source.anchor.path,
        edges.start + textStart,
        edges.start + textEnd,
        run.source.anchor.root
      ),
      width,
    });
    left += width;
  }

  return measured;
};

const createMeasuredLine = (
  block: Extract<PageLayoutBlock, { type: 'text' }>,
  start: number,
  end: number,
  width: number,
  measure: (text: string, style: PageLayoutTextStyle) => number,
  flatRuns = flattenRuns(block)
): MeasuredLine => {
  const runs = createMeasuredRuns(block, start, end, measure, flatRuns);
  const firstRun = runs[0];
  const lastRun = runs.at(-1);

  return {
    end,
    height: block.lineHeight,
    runs,
    source:
      firstRun && lastRun
        ? { anchor: firstRun.source.anchor, focus: lastRun.source.focus }
        : createSourceRange(flatRuns, start, end),
    start,
    width,
  };
};

const estimateTextWidth = (text: string) => text.length * 8;

const createEstimatedLines = (
  block: Extract<PageLayoutBlock, { type: 'text' }>,
  page: PageLayoutPage
): readonly MeasuredLine[] => {
  const text = getBlockText(block);
  const charactersPerLine = Math.max(1, Math.floor(page.content.width / 8));
  const lines: MeasuredLine[] = [];
  const flatRuns = flattenRuns(block);
  let hardLineStart = 0;
  const hardLines = text.split('\n');

  hardLines.forEach((hardLine, hardLineIndex) => {
    const hasHardBreak = hardLineIndex < hardLines.length - 1;

    if (hardLine.length === 0) {
      lines.push(
        createMeasuredLine(
          block,
          hardLineStart,
          hardLineStart + (hasHardBreak ? 1 : 0),
          0,
          estimateTextWidth,
          flatRuns
        )
      );
    } else {
      for (let start = 0; start < hardLine.length; start += charactersPerLine) {
        const end = Math.min(hardLine.length, start + charactersPerLine);
        const blockStart = hardLineStart + start;
        const blockEnd =
          hardLineStart +
          end +
          (hasHardBreak && end === hardLine.length ? 1 : 0);

        lines.push(
          createMeasuredLine(
            block,
            blockStart,
            blockEnd,
            estimateTextWidth(
              text.slice(blockStart, blockEnd).replaceAll('\n', '')
            ),
            (value) => estimateTextWidth(value),
            flatRuns
          )
        );
      }
    }

    hardLineStart += hardLine.length + 1;
  });

  return lines.length > 0
    ? lines
    : [createMeasuredLine(block, 0, 0, 0, () => 0, flatRuns)];
};

const createFragmentRect = (rects: readonly PageRect[]): PageRect => {
  if (rects.length === 0) return { height: 0, left: 0, top: 0, width: 0 };

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return { height: bottom - top, left, top, width: right - left };
};

const paginateMeasuredBlocks = ({
  measuredBlocks,
  page,
  settings,
}: {
  measuredBlocks: readonly MeasuredBlock[];
  page: PageLayoutPage;
  settings: PageSettings;
}): PageLayoutEngineOutput => {
  const pages: PageLayoutPage[] = [page];
  const fragments: PageLayoutFragment[] = [];
  let pageIndex = 0;
  let cursorTop = page.content.top;

  const advancePage = () => {
    pageIndex += 1;
    pages[pageIndex] = createPage(settings, pageIndex);
    cursorTop = pages[pageIndex].content.top;
  };
  const ensureFits = (height: number) => {
    const current = pages[pageIndex];
    const remaining = current.content.top + current.content.height - cursorTop;

    if (cursorTop !== current.content.top && height > remaining) advancePage();
  };

  for (const block of measuredBlocks) {
    if (block.type === 'atomic') {
      ensureFits(block.size.height);
      const current = pages[pageIndex];
      const rect = {
        height: block.size.height,
        left: current.content.left,
        top: cursorTop,
        width: block.size.width,
      };

      fragments.push({
        pageIndex,
        path: [...block.path],
        rect,
        type: 'atomic',
      });
      cursorTop += block.size.height + block.spacingAfter;
      continue;
    }

    if (block.type === 'direct-children') {
      let consumed = 0;

      while (consumed < block.children.length) {
        const fragmentChildren: Array<{ path: Path; rect: PageRect }> = [];

        while (consumed < block.children.length) {
          const child = block.children[consumed];
          const current = pages[pageIndex];
          const remaining =
            current.content.top + current.content.height - cursorTop;
          const pageIsEmpty = cursorTop === current.content.top;

          if (child.size.height > remaining && !pageIsEmpty) break;

          fragmentChildren.push({
            path: [...child.path],
            rect: {
              height: child.size.height,
              left: current.content.left,
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
      continue;
    }

    const totalHeight =
      block.lines.reduce((sum, line) => sum + line.height, 0) +
      block.spacingAfter;

    if (block.keepTogether && totalHeight <= page.content.height) {
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
        const current = pages[pageIndex];
        const remaining =
          current.content.top + current.content.height - cursorTop;
        const pageIsEmpty = cursorTop === current.content.top;

        if (line.height > remaining && !pageIsEmpty) break;

        const measuredWidth = Math.max(
          line.width,
          ...line.runs.map((run) => run.left + run.width)
        );
        const lineRect = {
          height: line.height,
          left: current.content.left,
          top: cursorTop,
          width: measuredWidth,
        };

        fragmentLines.push({
          rect: lineRect,
          runs: line.runs.map((run) => ({
            rect: {
              height: line.height,
              left: current.content.left + run.left,
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
  }

  return { fragments, pages };
};

const validateRect = (rect: PageRect) => {
  if (
    !Number.isFinite(rect.height) ||
    !Number.isFinite(rect.left) ||
    !Number.isFinite(rect.top) ||
    !Number.isFinite(rect.width) ||
    rect.height < 0 ||
    rect.width < 0
  ) {
    throw new Error('Pagination engine returned invalid geometry.');
  }
};

const sameRect = (left: PageRect, right: PageRect) =>
  left.height === right.height &&
  left.left === right.left &&
  left.top === right.top &&
  left.width === right.width;

const sameRangeOwner = (left: Range, right: Range) =>
  samePath(left.anchor.path, right.anchor.path) &&
  left.anchor.root === right.anchor.root &&
  samePath(left.focus.path, right.focus.path) &&
  left.focus.root === right.focus.root;

const validateEngineOutput = (
  blocks: readonly PageLayoutBlock[],
  output: PageLayoutEngineOutput,
  settings: PageSettings
) => {
  if (output.pages.length === 0) {
    throw new Error('Pagination engine must return at least one page.');
  }

  output.pages.forEach((page, index) => {
    const expected = createPage(settings, index);

    validateRect(page.content);
    if (
      page.index !== index ||
      page.height !== expected.height ||
      page.width !== expected.width ||
      !sameRect(page.content, expected.content)
    ) {
      throw new Error('Pagination engine returned an invalid page sequence.');
    }
  });

  const blockByPath = new Map(
    blocks.map((block, index) => [block.path.join('.'), { block, index }])
  );
  const fragmentsByPath = new Map<string, PageLayoutFragment[]>();
  let previousBlockIndex = -1;
  let previousPageIndex = -1;

  output.fragments.forEach((fragment) => {
    const pathKey = fragment.path.join('.');
    const owner = blockByPath.get(pathKey);

    if (!owner || owner.block.type !== fragment.type) {
      throw new Error('Pagination engine returned a foreign fragment.');
    }
    if (
      fragment.pageIndex < previousPageIndex ||
      owner.index < previousBlockIndex
    ) {
      throw new Error(
        'Pagination engine returned fragments out of source order.'
      );
    }
    previousPageIndex = fragment.pageIndex;
    previousBlockIndex = owner.index;
    const siblings = fragmentsByPath.get(pathKey);

    if (siblings) siblings.push(fragment);
    else fragmentsByPath.set(pathKey, [fragment]);
    if (output.pages[fragment.pageIndex]?.index !== fragment.pageIndex) {
      throw new Error('Pagination engine returned a fragment for no page.');
    }
    validateRect(fragment.rect);
    if (fragment.type === 'text') {
      if (fragment.lines.length === 0) {
        throw new Error('Pagination engine returned an empty text fragment.');
      }
      fragment.lines.forEach((line) => {
        validateRect(line.rect);
        if (line.runs.length === 0) {
          throw new Error(
            'Pagination engine returned a text line without source.'
          );
        }
        line.runs.forEach((run) => {
          validateRect(run.rect);
          if (
            run.rect.top !== line.rect.top ||
            run.rect.height !== line.rect.height
          ) {
            throw new Error(
              'Pagination engine returned inconsistent line geometry.'
            );
          }
        });
        const firstRun = line.runs[0];
        const lastRun = line.runs.at(-1);

        if (
          !firstRun ||
          !lastRun ||
          !samePath(line.source.anchor.path, firstRun.source.anchor.path) ||
          line.source.anchor.root !== firstRun.source.anchor.root ||
          line.source.anchor.offset !== firstRun.source.anchor.offset ||
          !samePath(line.source.focus.path, lastRun.source.focus.path) ||
          line.source.focus.root !== lastRun.source.focus.root ||
          line.source.focus.offset !== lastRun.source.focus.offset
        ) {
          throw new Error(
            'Pagination engine returned inconsistent line source.'
          );
        }
      });
      if (
        !sameRect(
          fragment.rect,
          createFragmentRect(fragment.lines.map((line) => line.rect))
        )
      ) {
        throw new Error(
          'Pagination engine returned inconsistent fragment geometry.'
        );
      }
    } else if (fragment.type === 'direct-children') {
      fragment.children.forEach((child) => validateRect(child.rect));
      if (
        !sameRect(
          fragment.rect,
          createFragmentRect(fragment.children.map((child) => child.rect))
        )
      ) {
        throw new Error(
          'Pagination engine returned inconsistent fragment geometry.'
        );
      }
    }
  });

  for (const block of blocks) {
    const fragments = fragmentsByPath.get(block.path.join('.')) ?? [];

    if (block.type === 'atomic') {
      if (fragments.length !== 1 || fragments[0]?.type !== 'atomic') {
        throw new Error('Pagination engine must emit each atomic block once.');
      }
      if (
        fragments[0].rect.height !== block.size.height ||
        fragments[0].rect.width !== block.size.width
      ) {
        throw new Error('Pagination engine changed an atomic block size.');
      }
      continue;
    }

    if (block.type === 'direct-children') {
      const children = fragments.flatMap((fragment) =>
        fragment.type === 'direct-children' ? fragment.children : []
      );

      if (
        children.length !== block.children.length ||
        children.some(
          (child, index) =>
            !samePath(child.path, block.children[index].path) ||
            child.rect.height !== block.children[index].size.height ||
            child.rect.width !== block.children[index].size.width
        )
      ) {
        throw new Error(
          'Pagination engine must conserve direct children in source order.'
        );
      }
      continue;
    }

    if (
      fragments.length === 0 ||
      fragments.some((fragment) => fragment.type !== 'text')
    ) {
      throw new Error('Pagination engine must emit every text block.');
    }
    const expectedRuns = new Map(
      block.runs.map((run) => [run.source.anchor.path.join('.'), run])
    );
    const actualRuns = new Map<string, Array<{ end: number; start: number }>>();

    for (const fragment of fragments) {
      if (fragment.type !== 'text') continue;

      for (const line of fragment.lines) {
        for (const candidate of line.runs) {
          const pathKey = candidate.source.anchor.path.join('.');
          const expectedRun = expectedRuns.get(pathKey);

          if (
            !expectedRun ||
            !sameRangeOwner(candidate.source, expectedRun.source)
          ) {
            throw new Error('Pagination engine returned a foreign text range.');
          }
          const ranges = actualRuns.get(pathKey);
          const edges = getRangeEdges(candidate.source);

          if (ranges) ranges.push(edges);
          else actualRuns.set(pathKey, [edges]);
        }
      }
    }
    for (const run of block.runs) {
      const expected = getRangeEdges(run.source);
      const actual = actualRuns.get(run.source.anchor.path.join('.')) ?? [];

      if (run.text.length === 0) {
        if (
          actual.length !== 1 ||
          actual[0].start !== expected.start ||
          actual[0].end !== expected.end
        ) {
          throw new Error('Pagination engine lost an empty text position.');
        }
        continue;
      }

      let cursor = expected.start;

      for (const range of actual) {
        if (range.start !== cursor || range.end < range.start) {
          throw new Error(
            'Pagination engine returned overlapping text ranges.'
          );
        }
        cursor = range.end;
      }
      if (cursor !== expected.end) {
        throw new Error('Pagination engine did not conserve text content.');
      }
    }
  }
};

const freezeRange = (range: Range): Range =>
  Object.freeze({
    anchor: Object.freeze({
      ...range.anchor,
      path: Object.freeze([...range.anchor.path]),
    }),
    focus: Object.freeze({
      ...range.focus,
      path: Object.freeze([...range.focus.path]),
    }),
  });

const freezeRect = (rect: PageRect): PageRect => Object.freeze({ ...rect });

const freezePage = (page: PageLayoutPage): PageLayoutPage =>
  Object.freeze({ ...page, content: freezeRect(page.content) });

const freezeSettings = (settings: PageSettings): PageSettings =>
  Object.freeze({
    ...settings,
    margins:
      typeof settings.margins === 'number'
        ? settings.margins
        : Object.freeze({ ...settings.margins }),
  });

const freezeOwnedRange = (range: Range): Range => {
  if (Object.isFrozen(range)) return range;

  if (!Object.isFrozen(range.anchor.path)) Object.freeze(range.anchor.path);
  if (!Object.isFrozen(range.anchor)) Object.freeze(range.anchor);
  if (!Object.isFrozen(range.focus.path)) Object.freeze(range.focus.path);
  if (!Object.isFrozen(range.focus)) Object.freeze(range.focus);
  return Object.freeze(range);
};

const freezeBlock = (block: PageLayoutBlock): PageLayoutBlock => {
  Object.freeze(block.path);

  if (block.type === 'text') {
    block.runs.forEach((run) => {
      freezeOwnedRange(run.source);
      Object.freeze(run.textStyle);
      Object.freeze(run);
    });
    Object.freeze(block.runs);
    return Object.freeze(block);
  }
  if (block.type === 'atomic') {
    Object.freeze(block.size);
    return Object.freeze(block);
  }

  block.children.forEach((child) => {
    Object.freeze(child.path);
    Object.freeze(child.size);
    Object.freeze(child);
  });
  Object.freeze(block.children);
  return Object.freeze(block);
};

const freezeFragment = (fragment: PageLayoutFragment): PageLayoutFragment => {
  const common = {
    pageIndex: fragment.pageIndex,
    path: Object.freeze([...fragment.path]),
    rect: freezeRect(fragment.rect),
  };

  if (fragment.type === 'atomic') {
    return Object.freeze({ ...common, type: 'atomic' as const });
  }
  if (fragment.type === 'direct-children') {
    return Object.freeze({
      ...common,
      children: Object.freeze(
        fragment.children.map((child) =>
          Object.freeze({
            path: Object.freeze([...child.path]),
            rect: freezeRect(child.rect),
          })
        )
      ),
      type: 'direct-children' as const,
    });
  }

  return Object.freeze({
    ...common,
    lines: Object.freeze(
      fragment.lines.map((line) =>
        Object.freeze({
          rect: freezeRect(line.rect),
          runs: Object.freeze(
            line.runs.map((run) =>
              Object.freeze({
                rect: freezeRect(run.rect),
                source: freezeRange(run.source),
              })
            )
          ),
          source: freezeRange(line.source),
        })
      )
    ),
    type: 'text' as const,
  });
};

const ownedEngineOutputs = new WeakSet<PageLayoutEngineOutput>();
const ownedPageLayoutEngines = new WeakSet<PageLayoutEngine>();

const freezeOwnedRect = (rect: PageRect): PageRect =>
  Object.isFrozen(rect) ? rect : Object.freeze(rect);

const freezeOwnedPage = (page: PageLayoutPage): PageLayoutPage => {
  if (Object.isFrozen(page)) return page;

  freezeOwnedRect(page.content);
  return Object.freeze(page);
};

const freezeOwnedFragment = (
  fragment: PageLayoutFragment
): PageLayoutFragment => {
  if (Object.isFrozen(fragment)) return fragment;

  Object.freeze(fragment.path);
  freezeOwnedRect(fragment.rect);
  if (fragment.type === 'direct-children') {
    fragment.children.forEach((child) => {
      Object.freeze(child.path);
      freezeOwnedRect(child.rect);
      Object.freeze(child);
    });
    Object.freeze(fragment.children);
  } else if (fragment.type === 'text') {
    fragment.lines.forEach((line) => {
      freezeOwnedRect(line.rect);
      line.runs.forEach((run) => {
        freezeOwnedRect(run.rect);
        freezeOwnedRange(run.source);
        Object.freeze(run);
      });
      Object.freeze(line.runs);
      freezeOwnedRange(line.source);
      Object.freeze(line);
    });
    Object.freeze(fragment.lines);
  }
  return Object.freeze(fragment);
};

export const createEstimatedPageLayoutEngine = (): PageLayoutEngine => {
  const engine: PageLayoutEngine = {
    compose(input) {
      const output = paginateMeasuredBlocks({
        measuredBlocks: input.blocks.map((block) =>
          block.type === 'text'
            ? { ...block, lines: createEstimatedLines(block, input.page) }
            : block
        ),
        page: input.page,
        settings: input.settings,
      });

      ownedEngineOutputs.add(output);
      return output;
    },
  };

  Object.freeze(engine);
  ownedPageLayoutEngines.add(engine);
  return engine;
};

const getPreparedTextOffset = (
  prepared: ReturnType<typeof prepareWithSegments>,
  cursor: { graphemeIndex: number; segmentIndex: number }
) => {
  let offset = 0;

  for (let index = 0; index < cursor.segmentIndex; index++) {
    offset += prepared.segments[index]?.length ?? 0;
  }

  return (
    offset +
    Array.from(prepared.segments[cursor.segmentIndex] ?? '')
      .slice(0, cursor.graphemeIndex)
      .join('').length
  );
};

const stableKey = (value: unknown) => JSON.stringify(value);

const LEADING_COLLAPSIBLE_RE = /^[ \t\n\f\r]+/;
const TRAILING_COLLAPSIBLE_RE = /[ \t\n\f\r]+$/;

const getLeadingCollapsibleLength = (text: string) =>
  text.match(LEADING_COLLAPSIBLE_RE)?.[0].length ?? 0;

const getTrailingCollapsibleLength = (text: string) =>
  text.match(TRAILING_COLLAPSIBLE_RE)?.[0].length ?? 0;

export const createPretextPageLayoutEngine = ({
  estimateBlock,
  maxPreparedEntries = 5000,
  whiteSpace = 'pre-wrap',
  wordBreak = 'normal',
}: PretextPageLayoutEngineOptions = {}): PageLayoutEngine => {
  const preparedCache = new Map<
    string,
    ReturnType<typeof prepareWithSegments>
  >();
  const measuredCache = new Map<string, readonly MeasuredLine[]>();
  const clearLocal = () => {
    preparedCache.clear();
    measuredCache.clear();
  };
  const getPrepared = (text: string, style: PageLayoutTextStyle) => {
    const key = stableKey([
      text,
      style.font,
      style.letterSpacing ?? 0,
      whiteSpace,
      wordBreak,
    ]);
    const cached = preparedCache.get(key);

    if (cached) return cached;

    const prepared = prepareWithSegments(text, style.font, {
      letterSpacing: style.letterSpacing,
      whiteSpace,
      wordBreak,
    });

    preparedCache.set(key, prepared);
    if (preparedCache.size > maxPreparedEntries) {
      const oldest = preparedCache.keys().next().value;
      if (oldest) preparedCache.delete(oldest);
    }

    return prepared;
  };
  const measure = (text: string, style: PageLayoutTextStyle) =>
    measureNaturalWidth(getPrepared(text, style));
  const createRichInlineLines = (
    block: Extract<PageLayoutBlock, { type: 'text' }>,
    maxWidth: number
  ): readonly MeasuredLine[] | null => {
    if (
      whiteSpace !== 'normal' ||
      wordBreak !== 'normal' ||
      block.runs.length <= 1
    ) {
      return null;
    }

    const flatRuns = flattenRuns(block);
    const sources = flatRuns.map((run) => {
      const sourceStart = getLeadingCollapsibleLength(run.text);
      const sourceEnd =
        run.text.length - getTrailingCollapsibleLength(run.text);
      const text =
        sourceEnd <= sourceStart ? '' : run.text.slice(sourceStart, sourceEnd);

      return {
        flat: run,
        prepared: getPrepared(text, run.textStyle),
        sourceEnd,
        sourceStart,
      };
    });
    const prepared = prepareRichInline(
      block.runs.map((run) => ({
        font: run.textStyle.font,
        letterSpacing: run.textStyle.letterSpacing,
        text: run.text,
      }))
    );
    const rawLines: Array<{
      runs: MeasuredRun[];
      width: number;
    }> = [];

    walkRichInlineLineRanges(prepared, maxWidth, (range) => {
      const line = materializeRichInlineLineRange(prepared, range);
      const runs: MeasuredRun[] = [];
      let left = 0;

      line.fragments.forEach((fragment) => {
        const source = sources[fragment.itemIndex];

        if (!source) return;
        if (fragment.gapBefore > 0) {
          const previous = sources[fragment.itemIndex - 1];
          const gap =
            previous && previous.sourceEnd < previous.flat.text.length
              ? {
                  end: previous.flat.text.length,
                  source: previous,
                  start: previous.sourceEnd,
                }
              : source.sourceStart > 0
                ? { end: source.sourceStart, source, start: 0 }
                : null;

          if (gap && gap.end > gap.start) {
            const edges = getRangeEdges(gap.source.flat.source);

            runs.push({
              blockEnd: gap.source.flat.blockStart + gap.end,
              blockStart: gap.source.flat.blockStart + gap.start,
              left,
              source: createRange(
                gap.source.flat.source.anchor.path,
                edges.start + gap.start,
                edges.start + gap.end,
                gap.source.flat.source.anchor.root
              ),
              width: fragment.gapBefore,
            });
          }
          left += fragment.gapBefore;
        }

        const textStart =
          source.sourceStart +
          getPreparedTextOffset(source.prepared, fragment.start);
        const textEnd =
          source.sourceStart +
          getPreparedTextOffset(source.prepared, fragment.end);

        if (
          textEnd < textStart ||
          (textEnd === textStart && source.flat.text.length > 0)
        ) {
          left += fragment.occupiedWidth;
          return;
        }
        const edges = getRangeEdges(source.flat.source);

        runs.push({
          blockEnd: source.flat.blockStart + textEnd,
          blockStart: source.flat.blockStart + textStart,
          left,
          source: createRange(
            source.flat.source.anchor.path,
            edges.start + textStart,
            edges.start + textEnd,
            source.flat.source.anchor.root
          ),
          width: fragment.occupiedWidth,
        });
        left += fragment.occupiedWidth;
      });
      rawLines.push({ runs, width: line.width });
    });

    const textLength = getBlockText(block).length;

    if (rawLines.length === 0) {
      return [createMeasuredLine(block, 0, textLength, 0, () => 0)];
    }

    let assignedStart = 0;

    return rawLines.map((line, lineIndex) => {
      const nextStart = rawLines[lineIndex + 1]?.runs[0]?.blockStart;
      const rawEnd = line.runs.at(-1)?.blockEnd ?? assignedStart;
      const assignedEnd =
        lineIndex === rawLines.length - 1
          ? textLength
          : Math.max(assignedStart, rawEnd, nextStart ?? rawEnd);
      const completeRuns: MeasuredRun[] = [];
      let cursor = assignedStart;
      let left = 0;

      line.runs.forEach((run) => {
        if (run.blockStart > cursor) {
          createMeasuredRuns(block, cursor, run.blockStart, () => 0).forEach(
            (gap) => completeRuns.push({ ...gap, left })
          );
        }
        completeRuns.push({ ...run, left });
        left += run.width;
        cursor = Math.max(cursor, run.blockEnd);
      });
      if (cursor < assignedEnd || completeRuns.length === 0) {
        createMeasuredRuns(block, cursor, assignedEnd, () => 0).forEach((gap) =>
          completeRuns.push({ ...gap, left })
        );
      }
      const measuredLine: MeasuredLine = {
        end: assignedEnd,
        height: block.lineHeight,
        runs: completeRuns,
        source: createSourceRange(flatRuns, assignedStart, assignedEnd),
        start: assignedStart,
        width: Math.max(line.width, left),
      };

      assignedStart = assignedEnd;
      return measuredLine;
    });
  };
  const measureBlock = (
    block: Extract<PageLayoutBlock, { type: 'text' }>,
    page: PageLayoutPage
  ) => {
    const richLines = createRichInlineLines(block, page.content.width);

    if (richLines) return richLines;
    const text = getBlockText(block);
    const cacheKey = stableKey({
      lineHeight: block.lineHeight,
      pageWidth: page.content.width,
      runs: block.runs.map((run) => ({
        text: run.text,
        textStyle: run.textStyle,
      })),
      whiteSpace,
      wordBreak,
    });
    const cached = measuredCache.get(cacheKey);

    if (cached) {
      return cached.map((line) =>
        createMeasuredLine(block, line.start, line.end, line.width, measure)
      );
    }

    const style = block.runs[0]?.textStyle ?? DEFAULT_TEXT_STYLE;
    const prepared = getPrepared(text, style);
    const result = layoutWithLines(
      prepared,
      page.content.width,
      block.lineHeight
    );
    const lines =
      result.lines.length === 0
        ? [createMeasuredLine(block, 0, 0, 0, measure)]
        : result.lines.map((line) => {
            const start = getPreparedTextOffset(prepared, line.start);
            const end = getPreparedTextOffset(prepared, line.end);

            return createMeasuredLine(block, start, end, line.width, measure);
          });

    measuredCache.set(cacheKey, lines);
    if (measuredCache.size > maxPreparedEntries) {
      const oldest = measuredCache.keys().next().value;
      if (oldest) measuredCache.delete(oldest);
    }

    return lines;
  };
  const engine: PageLayoutEngine = {
    compose(input) {
      const output = paginateMeasuredBlocks({
        measuredBlocks: input.blocks.map((block, blockIndex) => {
          if (block.type !== 'text') return block;
          if (
            estimateBlock?.({
              block,
              blockIndex,
              page: input.page,
              settings: input.settings,
            })
          ) {
            return { ...block, lines: createEstimatedLines(block, input.page) };
          }

          return { ...block, lines: measureBlock(block, input.page) };
        }),
        page: input.page,
        settings: input.settings,
      });

      ownedEngineOutputs.add(output);
      return output;
    },
    invalidate() {
      clearLocal();
      clearPretextCache();
    },
  };
  Object.freeze(engine);
  ownedPageLayoutEngines.add(engine);
  registerPageLayoutEngineInvalidator(engine, {
    local: clearLocal,
    shared: clearPretextCache,
  });

  return engine;
};

export const measurePages = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: EditorType<V, TPlugins>,
  options: MeasurePagesOptions<
    ElementOf<EditorType<NoInfer<V>, NoInfer<TPlugins>>>
  >
): PageLayoutSnapshot => {
  if (options.root === 'main') {
    throw new Error('[Plite] Omit root to target the primary document.');
  }

  const source = editor.read((state) => {
    const root = toInternalRoot(options.root ?? state.view.root());
    const settings =
      'margins' in options.page && 'preset' in options.page
        ? decodePageSettings(options.page)
        : decodePageSettings(state.getField(options.page));

    return {
      children: root === MAIN_ROOT_KEY ? state.children() : state.root(root),
      publicRoot: root === MAIN_ROOT_KEY ? undefined : (root as NamedRootKey),
      settings,
      version: state.lastCommit()?.version ?? state.runtime.snapshot().version,
    };
  });
  const settings = freezeSettings(source.settings);
  const page = freezePage(createPage(settings));
  const extractedBlocks = extractBlocks(
    editor,
    source.children,
    source.publicRoot,
    page,
    options.fragmentation,
    options.typography
  );
  const blocks = ownedPageLayoutEngines.has(options.engine)
    ? extractedBlocks
    : Object.freeze(extractedBlocks.map(freezeBlock));
  const output = options.engine.compose({
    blocks,
    page,
    settings,
    version: source.version,
  });
  const ownedOutput =
    ownedPageLayoutEngines.has(options.engine) &&
    ownedEngineOutputs.has(output);

  if (!ownedOutput) validateEngineOutput(blocks, output, settings);
  const fragments = ownedOutput
    ? output.fragments
    : output.fragments.map(freezeFragment);
  const pages = ownedOutput ? output.pages : output.pages.map(freezePage);

  if (ownedOutput) {
    fragments.forEach(freezeOwnedFragment);
    pages.forEach(freezeOwnedPage);
  }

  return Object.freeze({
    fragments: Object.freeze(fragments),
    pages: Object.freeze(pages),
    ...(source.publicRoot === undefined ? {} : { root: source.publicRoot }),
    settings,
    version: source.version,
  });
};
