import {
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
  type EditorStateField,
  type Element,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
  type Editor as EditorType,
  type Text,
  type Value,
} from '@platejs/plite';

const MAIN_ROOT_KEY: RootKey = 'main';

const assertPublicRootKey = (root: RootKey | undefined) => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('[Plite] Omit root to target the primary document.');
  }
};

const toPublicRootOption = (root: RootKey): RootKey | undefined =>
  root === MAIN_ROOT_KEY ? undefined : root;

export type PlitePagePreset = 'a4' | 'letter';

export type PlitePageMargins =
  | number
  | {
      bottom: number;
      left: number;
      right: number;
      top: number;
    };

/** Page size and margins used by Plite page-layout readers. */
export type PlitePageSettings = {
  margins: PlitePageMargins;
  preset: PlitePagePreset;
};

/** Rectangle in layout coordinates. */
export type PlitePageRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type PlitePageLayoutPage = {
  content: PlitePageRect;
  height: number;
  index: number;
  width: number;
};

export type PlitePageLayoutMode = 'single' | 'spread';

export type PlitePageLayoutPlacement = {
  left: number;
  top: number;
};

export type PlitePageLayoutGeometry = {
  height: number;
  pagePlacements: readonly PlitePageLayoutPlacement[];
  width: number;
};

export type PlitePageLayoutGeometryOptions = {
  pageGap?: number;
  pageLayoutMode?: PlitePageLayoutMode;
};

export type PlitePageLayoutTextStyle = {
  font: string;
  letterSpacing?: number;
};

export type PlitePageLayoutBlockStyle = {
  blockSpacing?: number;
  lineHeight: number;
};

export type PlitePageLayoutRun = {
  id: string;
  path: Path;
  range: {
    end: number;
    start: number;
  };
  text: string;
  textStyle: PlitePageLayoutTextStyle;
};

export type PlitePageLayoutPlacedRun = PlitePageLayoutRun & {
  leafRange: {
    end: number;
    start: number;
  };
  left: number;
  width: number;
};

export type PlitePageLayoutBoxKind =
  | 'block'
  | 'code-line'
  | 'image'
  | 'table'
  | 'table-cell'
  | 'thematic-break';

export type PlitePageLayoutBoxSplit = 'avoid' | 'line' | 'page' | 'row';

export type PlitePageLayoutBox = {
  kind: PlitePageLayoutBoxKind;
  path: Path;
  rect: PlitePageRect;
  split?: PlitePageLayoutBoxSplit;
};

export type PlitePageLayoutUnitSplit = 'avoid' | 'page';

export type PlitePageLayoutUnit = {
  key: string;
  kind?: string;
  path: Path;
  rect: PlitePageRect;
  split?: PlitePageLayoutUnitSplit;
};

export type PliteNodeLayoutDefaults = {
  block: PlitePageLayoutBlockStyle;
  boxes: readonly PlitePageLayoutBox[];
  text: PlitePageLayoutTextStyle;
};

export type PliteNodeLayoutContext = {
  defaults: PliteNodeLayoutDefaults;
  element: Element;
  measurementProfile: PlitePageLayoutMeasurementProfile;
  pageSettings: PlitePageSettings;
  path: Path;
};

export type PliteNodeLayoutPlan =
  | {
      boxes?: readonly PlitePageLayoutBox[];
      type: 'text';
    }
  | {
      box: PlitePageLayoutBox;
      type: 'box';
    }
  | {
      boxes?: readonly PlitePageLayoutBox[];
      type: 'units';
      units: readonly PlitePageLayoutUnit[];
    };

export type PliteNodeLayoutProvider = (
  context: PliteNodeLayoutContext
) => PliteNodeLayoutPlan | null | undefined;

export type PlitePageLayoutTypography = {
  block?: (context: {
    element: Element;
    path: Path;
  }) => PlitePageLayoutBlockStyle;
  text?: (context: {
    element: Element;
    leaf: Text;
    path: Path;
  }) => PlitePageLayoutTextStyle;
};

export type PlitePageLayoutBoxProvider = (context: {
  defaultBoxes: readonly PlitePageLayoutBox[];
  element: Element;
  lineHeight: number;
  path: Path;
}) => readonly PlitePageLayoutBox[] | null | undefined;

export type PlitePageLayoutBlock = {
  element: Element;
  boxes?: readonly PlitePageLayoutBox[];
  lineHeight: number;
  path: Path;
  runs?: readonly PlitePageLayoutRun[];
  spacingAfter: number;
  text: string;
  textStyle: PlitePageLayoutTextStyle;
  units?: readonly PlitePageLayoutUnit[];
};

export type PlitePageLayoutMeasuredLine = {
  end: number;
  height: number;
  runs?: readonly PlitePageLayoutPlacedRun[];
  start: number;
  text: string;
  width: number;
};

export type PlitePageLayoutLine = PlitePageLayoutMeasuredLine & {
  top: number;
};

export type PlitePageLayoutFragment = {
  blockIndex: number;
  height: number;
  id: string;
  lineCount: number;
  lines: readonly PlitePageLayoutLine[];
  pageIndex: number;
  path: Path;
  text: string;
  top: number;
  units?: readonly PlitePageLayoutUnit[];
};

export type PlitePageLayoutProjectedBlock = PlitePageRect & {
  blockIndex: number;
  path: Path;
};

export type PlitePageLayoutProjectedLine = PlitePageLayoutMeasuredLine & {
  blockIndex: number;
  fragmentId: string;
  hitRect: PlitePageRect;
  left: number;
  lineIndex: number;
  pageIndex: number;
  path: Path;
  textRect: PlitePageRect;
  top: number;
};

export type PlitePageLayoutProjectedUnit = PlitePageLayoutUnit & {
  blockIndex: number;
  fragmentId: string;
  pageIndex: number;
};

export type PlitePageLayoutProjection = {
  blocks: readonly PlitePageLayoutProjectedBlock[];
  geometry: PlitePageLayoutGeometry;
  lines: readonly PlitePageLayoutProjectedLine[];
  root: RootKey;
  units: readonly PlitePageLayoutProjectedUnit[];
};

export type PlitePageLayoutHitTestingOptions = {
  blockGap?:
    | false
    | {
        max?: number;
        target?: 'previous-line-end';
      };
  inlineInset?: number;
};

export type PlitePageLayoutProjectionOptions =
  PlitePageLayoutGeometryOptions & {
    geometry?: PlitePageLayoutGeometry;
    hitTesting?: false | PlitePageLayoutHitTestingOptions;
  };

export type PlitePageLayoutDecoration<TData = unknown> = {
  data?: TData;
  key: string;
  range: Range;
};

export type PlitePageLayoutDecorationRects = {
  hitRect: PlitePageRect;
  textRect: PlitePageRect;
};

export type PlitePageLayoutDecorationRectSpace = 'block' | 'page';

export type PlitePageLayoutDecorationContext = {
  block?: PlitePageLayoutProjectedBlock;
  line: PlitePageLayoutProjectedLine;
  rects: PlitePageLayoutDecorationRects;
  run: PlitePageLayoutPlacedRun;
};

export type PlitePageLayoutDecorationOptions<TData> = {
  data?: (context: PlitePageLayoutDecorationContext) => TData | undefined;
  /**
   * Return false to skip creating a Plite decoration for this projected run.
   */
  filter?: (context: PlitePageLayoutDecorationContext) => boolean;
  key?: (context: PlitePageLayoutDecorationContext) => string;
  rects?: PlitePageLayoutDecorationRectSpace;
};

export type PlitePageLayoutSnapshot = {
  blocks: readonly PlitePageLayoutBlock[];
  fragments: readonly PlitePageLayoutFragment[];
  measurementProfile: PlitePageLayoutMeasurementProfile;
  page: PlitePageLayoutPage;
  pageBreaks: PlitePageBreakSnapshot | null;
  pageBreaksStatus: PlitePageBreakSnapshotStatus;
  pages: readonly PlitePageLayoutPage[];
  root: RootKey;
  settings: PlitePageSettings;
  version: number;
};

export type PlitePageLayoutMetrics = {
  blockCount: number;
  composeCount: number;
  lastDurationMs: number;
  pageCount: number;
};

export type PlitePageLayoutRefreshReason =
  | 'editor'
  | 'font'
  | 'settings'
  | 'viewport';

export type PlitePageLayoutEngineInput = {
  blocks: readonly PlitePageLayoutBlock[];
  page: PlitePageLayoutPage;
  settings: PlitePageSettings;
  version: number;
};

export type PlitePageLayoutEngineOutput = Pick<
  PlitePageLayoutSnapshot,
  'fragments' | 'pages'
>;

export type PlitePageLayoutMeasuredBlock = PlitePageLayoutBlock & {
  blockIndex: number;
  lineCount: number;
  lines?: readonly PlitePageLayoutMeasuredLine[];
};

export type PlitePageLayoutEngine = {
  compose: (input: PlitePageLayoutEngineInput) => PlitePageLayoutEngineOutput;
  id?: string;
  measurementProfile?: unknown;
};

export type PlitePageLayoutMeasurementProfile = {
  engine: {
    id: string;
    profile?: unknown;
  };
  page: PlitePageSettings;
  root: RootKey;
  schemaVersion: 1;
  typography: 'custom' | 'default';
};

export type PlitePageBreak = {
  blockIndex: number;
  fragmentId: string;
  pageIndex: number;
  path: Path;
};

export type PlitePageBreakSnapshot = {
  breaks: readonly PlitePageBreak[];
  documentKey: string;
  documentVersion: number;
  measurementProfile: PlitePageLayoutMeasurementProfile;
  root: RootKey;
  schemaVersion: 1;
  writerId?: string;
};

export type PlitePageBreakSnapshotStatus =
  | 'accepted'
  | 'none'
  | 'stale-document'
  | 'stale-profile'
  | 'stale-root'
  | 'written';

export type PlitePageBreakSnapshotSource =
  | EditorStateField<PlitePageBreakSnapshot | null>
  | PlitePageBreakSnapshot
  | null;

export type PlitePageBreaksOptions =
  | {
      mode: 'read';
      source: PlitePageBreakSnapshotSource;
    }
  | {
      mode: 'write';
      source: EditorStateField<PlitePageBreakSnapshot | null>;
      writerId: string;
    };

export type PretextPageLayoutEngineOptions = {
  estimateBlock?: (context: {
    block: PlitePageLayoutBlock;
    blockIndex: number;
    page: PlitePageLayoutPage;
    settings: PlitePageSettings;
  }) => boolean;
  maxPreparedEntries?: number;
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'normal' | 'keep-all';
};

export type PlitePageSettingsSource<
  TSettings extends PlitePageSettings = PlitePageSettings,
> = EditorStateField<TSettings> | TSettings;

/** Simplified layout options that choose a built-in engine when possible. */
export type PliteLayoutOptions<
  TSettings extends PlitePageSettings = PlitePageSettings,
> = {
  engine?: PlitePageLayoutEngine;
  nodeLayout?: PliteNodeLayoutProvider;
  page: PlitePageSettingsSource<TSettings>;
  pageBreaks?: PlitePageBreaksOptions | null;
  root?: RootKey;
  textChangeRefresh?: PlitePageLayoutTextChangeRefresh;
  typography?: PlitePageLayoutTypography;
};

export type PlitePageLayoutDeferredTextChangeRefresh = {
  delayMs?: number;
  maxDelayMs?: number;
  mode: 'deferred';
};

export type PlitePageLayoutTextChangeRefresh =
  | 'sync'
  | 'deferred'
  | PlitePageLayoutDeferredTextChangeRefresh;

/** Full page-layout options for callers that own the measurement engine. */
export type PlitePageLayoutOptions<
  TSettings extends PlitePageSettings = PlitePageSettings,
> = {
  engine: PlitePageLayoutEngine;
  nodeLayout?: PliteNodeLayoutProvider;
  page: PlitePageSettingsSource<TSettings>;
  pageBreaks?: PlitePageBreaksOptions | null;
  root?: RootKey;
  textChangeRefresh?: PlitePageLayoutTextChangeRefresh;
  typography?: PlitePageLayoutTypography;
};

export type PlitePageLayoutProjectRangeOptions =
  PlitePageLayoutGeometryOptions & {
    root?: RootKey;
  };

/** Live derived layout reader. It owns subscriptions, not document content. */
export type PlitePageLayout = {
  destroy: () => void;
  getFragments: (path: Path) => readonly PlitePageLayoutFragment[];
  getMetrics: () => PlitePageLayoutMetrics;
  getSnapshot: () => PlitePageLayoutSnapshot;
  projectRange: (
    range: Range,
    options?: PlitePageLayoutProjectRangeOptions
  ) => readonly PlitePageRect[];
  refresh: (reason?: PlitePageLayoutRefreshReason) => void;
  subscribe: (listener: () => void) => () => void;
};

const PAGE_PRESETS: Record<PlitePagePreset, { height: number; width: number }> =
  {
    a4: { height: 1123, width: 794 },
    letter: { height: 1056, width: 816 },
  };

const DEFAULT_SETTINGS: PlitePageSettings = {
  margins: 96,
  preset: 'a4',
};

const DEFAULT_TEXT_STYLE: PlitePageLayoutTextStyle = {
  font: '400 16px Inter',
  letterSpacing: 0,
};

const DEFAULT_BLOCK_STYLE: PlitePageLayoutBlockStyle = {
  blockSpacing: 12,
  lineHeight: 24,
};

const DEFAULT_MEASUREMENT_PROFILE: PlitePageLayoutMeasurementProfile = {
  engine: { id: 'none' },
  page: DEFAULT_SETTINGS,
  root: MAIN_ROOT_KEY,
  schemaVersion: 1,
  typography: 'default',
};

const TEXT_CHANGE_REFRESH_DELAY_MS = 40;
const TEXT_CHANGE_REFRESH_MAX_DELAY_MS = 80;

const normalizeRefreshDelay = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;

const getTextChangeRefreshOptions = (
  refresh: PlitePageLayoutTextChangeRefresh | undefined
):
  | {
      delayMs: number;
      maxDelayMs: number;
      mode: 'deferred';
    }
  | {
      mode: 'sync';
    } => {
  if (refresh === 'deferred') {
    return {
      delayMs: TEXT_CHANGE_REFRESH_DELAY_MS,
      maxDelayMs: TEXT_CHANGE_REFRESH_MAX_DELAY_MS,
      mode: 'deferred',
    };
  }

  if (refresh && typeof refresh === 'object' && refresh.mode === 'deferred') {
    const delayMs = normalizeRefreshDelay(
      refresh.delayMs,
      TEXT_CHANGE_REFRESH_DELAY_MS
    );
    const maxDelayMs = normalizeRefreshDelay(
      refresh.maxDelayMs,
      Math.max(delayMs, TEXT_CHANGE_REFRESH_MAX_DELAY_MS)
    );

    return {
      delayMs,
      maxDelayMs: Math.max(delayMs, maxDelayMs),
      mode: 'deferred',
    };
  }

  return { mode: 'sync' };
};

const getNow = () =>
  typeof performance === 'undefined' ? Date.now() : performance.now();

const profileLayoutDuration = <T>(id: string, callback: () => T): T => {
  const profiler = (
    globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: {
          duration: number;
          id: string;
          kind: 'layout-time';
        }) => void;
      };
    }
  ).__PLITE_REACT_RENDER_PROFILER__;

  if (!profiler) {
    return callback();
  }

  const start = getNow();

  try {
    return callback();
  } finally {
    profiler.record?.({
      duration: getNow() - start,
      id,
      kind: 'layout-time',
    });
  }
};

const isElement = (node: Descendant): node is Element => !NodeApi.isText(node);

const getStableProfileKey = (value: unknown) => JSON.stringify(value);

const createPlitePageLayoutMeasurementProfile = ({
  engine,
  root,
  settings,
  typography,
}: {
  engine: PlitePageLayoutEngine;
  root: RootKey;
  settings: PlitePageSettings;
  typography?: PlitePageLayoutTypography;
}): PlitePageLayoutMeasurementProfile => ({
  engine: {
    id: engine.id ?? 'anonymous',
    profile: engine.measurementProfile,
  },
  page: normalizePlitePageSettings(settings),
  root,
  schemaVersion: 1,
  typography: typography ? 'custom' : 'default',
});

export const createPlitePageBreakSnapshot = ({
  documentKey,
  fragments,
  measurementProfile,
  root,
  version,
  writerId,
}: {
  documentKey: string;
  fragments: readonly PlitePageLayoutFragment[];
  measurementProfile: PlitePageLayoutMeasurementProfile;
  root: RootKey;
  version: number;
  writerId?: string;
}): PlitePageBreakSnapshot => {
  const breaksByPageIndex = new Map<number, PlitePageBreak>();

  for (const fragment of fragments) {
    if (fragment.pageIndex === 0 || breaksByPageIndex.has(fragment.pageIndex)) {
      continue;
    }

    breaksByPageIndex.set(fragment.pageIndex, {
      blockIndex: fragment.blockIndex,
      fragmentId: fragment.id,
      pageIndex: fragment.pageIndex,
      path: fragment.path,
    });
  }

  return {
    breaks: [...breaksByPageIndex.values()].sort(
      (left, right) => left.pageIndex - right.pageIndex
    ),
    documentKey,
    documentVersion: version,
    measurementProfile,
    root,
    schemaVersion: 1,
    writerId,
  };
};

const readPlitePageBreakSnapshot = (
  editor: EditorType<Value>,
  source: PlitePageBreakSnapshotSource
) => {
  if (!source) {
    return null;
  }

  if ('key' in source) {
    return editor.read((state) => state.getField(source));
  }

  return source;
};

const getPlitePageBreakSnapshotStatus = ({
  documentKey,
  measurementProfile,
  root,
  snapshot,
  version,
}: {
  documentKey: string;
  measurementProfile: PlitePageLayoutMeasurementProfile;
  root: RootKey;
  snapshot: PlitePageBreakSnapshot | null;
  version: number;
}): PlitePageBreakSnapshotStatus => {
  if (!snapshot) {
    return 'none';
  }

  if (snapshot.root !== root) {
    return 'stale-root';
  }

  if (
    snapshot.documentKey !== documentKey ||
    snapshot.documentVersion > version
  ) {
    return 'stale-document';
  }

  if (
    getStableProfileKey(snapshot.measurementProfile) !==
    getStableProfileKey(measurementProfile)
  ) {
    return 'stale-profile';
  }

  return 'accepted';
};

const samePlitePageBreakSnapshot = (
  left: PlitePageBreakSnapshot | null,
  right: PlitePageBreakSnapshot
) => Boolean(left && getStableProfileKey(left) === getStableProfileKey(right));

const getStableHashKey = (value: unknown): string => {
  const source = getStableProfileKey(value);
  let hash = 2_166_136_261;

  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return `${source.length}:${(hash >>> 0).toString(36)}`;
};

const getPliteLayoutDocumentKey = (
  blocks: readonly PlitePageLayoutBlock[]
): string =>
  getStableHashKey(
    blocks.map((block) => ({
      boxes: block.boxes?.map((box) => ({
        kind: box.kind,
        path: box.path,
        rect: box.rect,
        split: box.split,
      })),
      path: block.path,
      runs: block.runs?.map((run) => ({
        path: run.path,
        range: run.range,
        text: run.text,
        textStyle: run.textStyle,
      })),
      spacingAfter: block.spacingAfter,
      text: block.text,
      textStyle: block.textStyle,
      units: block.units?.map((unit) => ({
        key: unit.key,
        kind: unit.kind,
        path: unit.path,
        rect: unit.rect,
        split: unit.split,
      })),
    }))
  );

const canUseCanvasTextMeasurement = () => {
  if (typeof OffscreenCanvas !== 'undefined') {
    return true;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    return Boolean(document.createElement('canvas').getContext('2d'));
  } catch {
    return false;
  }
};

const normalizeMargins = (margins: PlitePageMargins) =>
  typeof margins === 'number'
    ? {
        bottom: margins,
        left: margins,
        right: margins,
        top: margins,
      }
    : margins;

export const getPlitePagePresetSize = (preset: PlitePagePreset) =>
  PAGE_PRESETS[preset];

/** Normalize page settings without resolving shorthand margins. */
export const normalizePlitePageSettings = (
  settings: PlitePageSettings
): PlitePageSettings => ({
  margins: settings.margins,
  preset: settings.preset,
});

/** Create one page rectangle and its content box from settings. */
export const createPlitePage = (
  settings: PlitePageSettings,
  index = 0
): PlitePageLayoutPage => {
  const size = getPlitePagePresetSize(settings.preset);
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

/** Compute page placements for single-page or spread rendering. */
export const getPlitePageLayoutGeometry = (
  pages: readonly PlitePageLayoutPage[],
  {
    pageGap = 24,
    pageLayoutMode = 'single',
  }: PlitePageLayoutGeometryOptions = {}
): PlitePageLayoutGeometry => {
  if (pages.length === 0) {
    return { height: 0, pagePlacements: [], width: 0 };
  }

  if (pageLayoutMode === 'spread') {
    const rows = Math.ceil(pages.length / 2);
    const rowTops: number[] = new Array(rows).fill(0);
    const rowWidths: number[] = new Array(rows).fill(0);
    let height = 0;

    for (let row = 0; row < rows; row++) {
      rowTops[row] = height;

      const left = pages[row * 2];
      const right = pages[row * 2 + 1];
      const rowHeight = Math.max(left?.height ?? 0, right?.height ?? 0);

      rowWidths[row] = (left?.width ?? 0) + (right ? pageGap + right.width : 0);
      height += rowHeight + (row < rows - 1 ? pageGap : 0);
    }

    return {
      height,
      pagePlacements: pages.map((_, index) => {
        const row = Math.floor(index / 2);

        if (index % 2 === 0) {
          return { left: 0, top: rowTops[row] ?? 0 };
        }

        return {
          left: (pages[row * 2]?.width ?? 0) + pageGap,
          top: rowTops[row] ?? 0,
        };
      }),
      width: Math.max(0, ...rowWidths),
    };
  }

  const pagePlacements: PlitePageLayoutPlacement[] = [];
  let height = 0;
  let width = 0;

  pages.forEach((page, index) => {
    pagePlacements.push({ left: 0, top: height });
    height += page.height + (index < pages.length - 1 ? pageGap : 0);
    width = Math.max(width, page.width);
  });

  return { height, pagePlacements, width };
};

/** Stable key for layout maps keyed by Plite path. */
export const getPlitePageLayoutPathKey = (path: Path) => path.join('.');

const getRunId = (path: Path, start: number, end: number) =>
  `${path.join('.')}:${start}-${end}`;

const compareLayoutPaths = (left: Path, right: Path): number => {
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) {
      return left[index]! < right[index]! ? -1 : 1;
    }
  }

  if (left.length === right.length) {
    return 0;
  }

  return left.length < right.length ? -1 : 1;
};

const compareLayoutPoints = (left: Point, right: Point): number => {
  const pathComparison = compareLayoutPaths(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const getLayoutRangeEdges = (range: Range): [Point, Point] =>
  compareLayoutPoints(range.anchor, range.focus) <= 0
    ? [range.anchor, range.focus]
    : [range.focus, range.anchor];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getPlitePageLayoutProjection = (
  snapshot: PlitePageLayoutSnapshot,
  options: PlitePageLayoutProjectionOptions = {}
): PlitePageLayoutProjection => {
  const {
    geometry: providedGeometry,
    hitTesting = {},
    ...geometryOptions
  } = options;
  const geometry =
    providedGeometry ??
    getPlitePageLayoutGeometry(snapshot.pages, geometryOptions);
  const blockBoxes = new Map<string, PlitePageLayoutProjectedBlock>();
  const lines: PlitePageLayoutProjectedLine[] = [];
  const units: PlitePageLayoutProjectedUnit[] = [];
  const inlineInset = hitTesting === false ? 0 : (hitTesting.inlineInset ?? 0);

  snapshot.fragments.forEach((fragment) => {
    const page = snapshot.pages[fragment.pageIndex] ?? snapshot.page;
    const placement = geometry.pagePlacements[fragment.pageIndex] ?? {
      left: 0,
      top: page.index * page.height,
    };

    fragment.lines.forEach((line, lineIndex) => {
      const left = placement.left + page.content.left;
      const top = placement.top + line.top;
      const right = left + page.content.width;
      const bottom = top + line.height;
      const textRect = {
        height: line.height,
        left: left + inlineInset,
        top,
        width: line.width,
      };

      lines.push({
        ...line,
        blockIndex: fragment.blockIndex,
        fragmentId: fragment.id,
        hitRect: textRect,
        left,
        lineIndex,
        pageIndex: fragment.pageIndex,
        path: [...fragment.path],
        textRect,
        top,
      });

      const pathKey = getPlitePageLayoutPathKey(fragment.path);
      const existing = blockBoxes.get(pathKey);

      if (!existing) {
        blockBoxes.set(pathKey, {
          blockIndex: fragment.blockIndex,
          height: line.height,
          left,
          path: [...fragment.path],
          top,
          width: page.content.width,
        });
        return;
      }

      const nextLeft = Math.min(existing.left, left);
      const nextTop = Math.min(existing.top, top);
      const nextRight = Math.max(existing.left + existing.width, right);
      const nextBottom = Math.max(existing.top + existing.height, bottom);

      blockBoxes.set(pathKey, {
        ...existing,
        height: nextBottom - nextTop,
        left: nextLeft,
        top: nextTop,
        width: nextRight - nextLeft,
      });
    });

    fragment.units?.forEach((unit) => {
      const left = placement.left + page.content.left + unit.rect.left;
      const top = placement.top + unit.rect.top;
      const right = left + unit.rect.width;
      const bottom = top + unit.rect.height;

      units.push({
        ...unit,
        blockIndex: fragment.blockIndex,
        fragmentId: fragment.id,
        pageIndex: fragment.pageIndex,
        path: [...unit.path],
        rect: {
          ...unit.rect,
          left,
          top,
        },
      });

      const pathKey = getPlitePageLayoutPathKey(fragment.path);
      const existing = blockBoxes.get(pathKey);

      if (!existing) {
        blockBoxes.set(pathKey, {
          blockIndex: fragment.blockIndex,
          height: unit.rect.height,
          left,
          path: [...fragment.path],
          top,
          width: Math.max(page.content.width, unit.rect.width),
        });
        return;
      }

      const nextLeft = Math.min(existing.left, left);
      const nextTop = Math.min(existing.top, top);
      const nextRight = Math.max(existing.left + existing.width, right);
      const nextBottom = Math.max(existing.top + existing.height, bottom);

      blockBoxes.set(pathKey, {
        ...existing,
        height: nextBottom - nextTop,
        left: nextLeft,
        top: nextTop,
        width: nextRight - nextLeft,
      });
    });
  });

  const blocks = [...blockBoxes.values()];
  const blockByIndex = new Map(
    blocks.map((block) => [block.blockIndex, block])
  );
  const maxBlockGap =
    hitTesting === false || hitTesting.blockGap === false
      ? 0
      : (hitTesting.blockGap?.max ?? 48);
  const linesWithHitRects = lines.map((line) => {
    const block = blockByIndex.get(line.blockIndex);

    if (!block || hitTesting === false) {
      return {
        ...line,
        hitRect: line.textRect,
      };
    }

    const blockTextLength = snapshot.blocks[line.blockIndex]?.text.length ?? 0;
    const nextBlock = blockByIndex.get(line.blockIndex + 1);
    const blockGap =
      nextBlock &&
      line.end >= blockTextLength &&
      Math.abs(nextBlock.left - block.left) < 1
        ? Math.max(0, nextBlock.top - (block.top + block.height))
        : 0;
    const extendsBlockGap = blockGap > 0 && blockGap <= maxBlockGap;

    return {
      ...line,
      hitRect: {
        height: line.textRect.height + (extendsBlockGap ? blockGap : 0),
        left: line.textRect.left,
        top: line.textRect.top,
        width: Math.max(
          line.textRect.width,
          block.left + block.width - line.textRect.left
        ),
      },
    };
  });

  return {
    blocks,
    geometry,
    lines: linesWithHitRects,
    root: snapshot.root,
    units,
  };
};

/** Convert projected line runs into Plite decorations keyed by path. */
export const getPlitePageLayoutDecorations = <TData = unknown>(
  projection: PlitePageLayoutProjection,
  options: PlitePageLayoutDecorationOptions<TData> = {}
): Map<string, PlitePageLayoutDecoration<TData>[]> => {
  const decorations = new Map<string, PlitePageLayoutDecoration<TData>[]>();
  const blockByIndex = new Map(
    projection.blocks.map((block) => [block.blockIndex, block])
  );
  const rectSpace = options.rects ?? 'page';
  const root = projection.root === MAIN_ROOT_KEY ? undefined : projection.root;

  projection.lines.forEach((line) => {
    const block = blockByIndex.get(line.blockIndex);

    line.runs?.forEach((run) => {
      const pathKey = getPlitePageLayoutPathKey(run.path);
      const rects = getDecorationRects(line, block, run, rectSpace);
      const context = { block, line, rects, run };

      if (options.filter && !options.filter(context)) {
        return;
      }

      const decoration: PlitePageLayoutDecoration<TData> = {
        key:
          options.key?.(context) ??
          `plite-layout:${line.fragmentId}:${line.lineIndex}:${pathKey}:${run.leafRange.start}-${run.leafRange.end}`,
        range: {
          anchor: {
            path: [...run.path],
            offset: run.leafRange.start,
            ...(root ? { root } : {}),
          },
          focus: {
            path: [...run.path],
            offset: run.leafRange.end,
            ...(root ? { root } : {}),
          },
        },
      };
      const data = options.data?.(context);

      if (data !== undefined) {
        decoration.data = data;
      }

      const pathDecorations = decorations.get(pathKey) ?? [];
      pathDecorations.push(decoration);
      decorations.set(pathKey, pathDecorations);
    });
  });

  return decorations;
};

const getDecorationRects = (
  line: PlitePageLayoutProjectedLine,
  block: PlitePageLayoutProjectedBlock | undefined,
  run: PlitePageLayoutPlacedRun,
  rectSpace: PlitePageLayoutDecorationRectSpace
): PlitePageLayoutDecorationRects => {
  const textRect = {
    height: line.textRect.height,
    left: line.textRect.left + run.left,
    top: line.textRect.top,
    width: run.width,
  };
  const runTextRight = textRect.left + textRect.width;
  const lineHitRight = line.hitRect.left + line.hitRect.width;
  const hitRight =
    run.range.end >= line.end
      ? Math.max(lineHitRight, runTextRight)
      : runTextRight;
  const hitRect = {
    height: line.hitRect.height,
    left: textRect.left,
    top: line.hitRect.top,
    width: Math.max(0, hitRight - textRect.left),
  };

  if (rectSpace === 'page' || !block) {
    return {
      hitRect,
      textRect,
    };
  }

  return {
    hitRect: getRectRelativeToBlock(hitRect, block),
    textRect: getRectRelativeToBlock(textRect, block),
  };
};

const getRectRelativeToBlock = (
  rect: PlitePageRect,
  block: PlitePageLayoutProjectedBlock
): PlitePageRect => ({
  height: rect.height,
  left: rect.left - block.left,
  top: rect.top - block.top,
  width: rect.width,
});

const getRunWidthAtOffset = (
  run: PlitePageLayoutPlacedRun,
  blockOffset: number
) => {
  const rangeLength = run.range.end - run.range.start;

  if (rangeLength <= 0) {
    return 0;
  }

  return run.width * clamp((blockOffset - run.range.start) / rangeLength, 0, 1);
};

const getProjectedPointBlockOffset = (
  projection: PlitePageLayoutProjection,
  point: Point
) => {
  const topLevelIndex = point.path[0];

  if (topLevelIndex === undefined) {
    return null;
  }

  if (point.path.length === 1) {
    return point.offset;
  }

  const matchingRuns: PlitePageLayoutPlacedRun[] = [];

  for (const line of projection.lines) {
    if (line.path[0] !== topLevelIndex) {
      continue;
    }

    for (const run of line.runs ?? []) {
      if (compareLayoutPaths(run.path, point.path) !== 0) {
        continue;
      }

      matchingRuns.push(run);
    }
  }

  const containingRun =
    matchingRuns.find(
      (run) =>
        run.leafRange.start <= point.offset && point.offset < run.leafRange.end
    ) ??
    matchingRuns.find(
      (run) =>
        run.leafRange.start <= point.offset && point.offset <= run.leafRange.end
    );

  if (containingRun) {
    return (
      containingRun.range.start + point.offset - containingRun.leafRange.start
    );
  }

  const firstRun = matchingRuns[0];
  const lastRun = matchingRuns.at(-1);

  if (!firstRun || !lastRun) {
    return point.offset;
  }

  return point.offset < firstRun.leafRange.start
    ? firstRun.range.start
    : lastRun.range.end;
};

const getProjectedCaretRect = (
  projection: PlitePageLayoutProjection,
  point: Point
): PlitePageRect[] => {
  const blockIndex = point.path[0];
  const blockOffset = getProjectedPointBlockOffset(projection, point);

  if (blockIndex === undefined || blockOffset === null) {
    return [];
  }

  const blockLines = projection.lines.filter(
    (line) => line.path[0] === blockIndex
  );
  const line =
    blockLines.find(
      (candidate) =>
        candidate.start <= blockOffset && blockOffset < candidate.end
    ) ??
    blockLines.find(
      (candidate) =>
        candidate.start <= blockOffset && blockOffset <= candidate.end
    );

  if (!line) {
    return [];
  }

  const runs = line.runs ?? [];
  const run =
    runs.find(
      (candidate) =>
        candidate.range.start <= blockOffset &&
        blockOffset < candidate.range.end
    ) ??
    runs.find(
      (candidate) =>
        candidate.range.start <= blockOffset &&
        blockOffset <= candidate.range.end
    );
  const left = run
    ? line.textRect.left + run.left + getRunWidthAtOffset(run, blockOffset)
    : line.textRect.left;

  return [
    {
      height: line.textRect.height,
      left,
      top: line.textRect.top,
      width: 0,
    },
  ];
};

const projectRangeThroughRuns = (
  projection: PlitePageLayoutProjection,
  range: Range
): PlitePageRect[] => {
  const [startPoint, endPoint] = getLayoutRangeEdges(range);

  if (compareLayoutPoints(startPoint, endPoint) === 0) {
    return getProjectedCaretRect(projection, startPoint);
  }

  const startBlockIndex = startPoint.path[0];
  const endBlockIndex = endPoint.path[0];
  const startBlockOffset = getProjectedPointBlockOffset(projection, startPoint);
  const endBlockOffset = getProjectedPointBlockOffset(projection, endPoint);

  if (
    startBlockIndex === undefined ||
    endBlockIndex === undefined ||
    startBlockOffset === null ||
    endBlockOffset === null
  ) {
    return [];
  }

  const rects: PlitePageRect[] = [];

  for (const line of projection.lines) {
    const lineBlockIndex = line.path[0];

    if (
      lineBlockIndex === undefined ||
      lineBlockIndex < startBlockIndex ||
      lineBlockIndex > endBlockIndex
    ) {
      continue;
    }

    const requestedStart =
      lineBlockIndex === startBlockIndex ? startBlockOffset : line.start;
    const requestedEnd =
      lineBlockIndex === endBlockIndex ? endBlockOffset : line.end;
    const lineStart = Math.max(line.start, requestedStart);
    const lineEnd = Math.min(line.end, requestedEnd);

    if (lineEnd <= lineStart) {
      continue;
    }

    if (!line.runs?.length) {
      rects.push({
        height: line.textRect.height,
        left: line.textRect.left,
        top: line.textRect.top,
        width: line.textRect.width,
      });
      continue;
    }

    for (const run of line.runs) {
      const start = Math.max(run.range.start, lineStart);
      const end = Math.min(run.range.end, lineEnd);

      if (end <= start) {
        continue;
      }

      const left =
        line.textRect.left + run.left + getRunWidthAtOffset(run, start);
      const right =
        line.textRect.left + run.left + getRunWidthAtOffset(run, end);

      rects.push({
        height: line.textRect.height,
        left,
        top: line.textRect.top,
        width: Math.max(0, right - left),
      });
    }
  }

  return rects;
};

const getFirstLeaf = (element: Element): Text => {
  for (const [leaf] of NodeApi.texts(element)) {
    return leaf;
  }

  return { text: '' };
};

const getBlockStyle = (
  typography: PlitePageLayoutTypography | undefined,
  element: Element,
  path: Path
) => ({
  ...DEFAULT_BLOCK_STYLE,
  ...typography?.block?.({ element, path }),
});

const getTextStyle = (
  typography: PlitePageLayoutTypography | undefined,
  element: Element,
  path: Path,
  leaf: Text = getFirstLeaf(element)
) => ({
  ...DEFAULT_TEXT_STYLE,
  ...typography?.text?.({
    element,
    leaf,
    path,
  }),
});

const extractLayoutRuns = (
  element: Element,
  path: Path,
  typography: PlitePageLayoutTypography | undefined
): PlitePageLayoutRun[] => {
  const runs: PlitePageLayoutRun[] = [];
  let offset = 0;

  for (const [leaf, leafPath] of NodeApi.texts(element)) {
    const start = offset;
    const end = start + leaf.text.length;
    const fullPath = [...path, ...leafPath];

    runs.push({
      id: getRunId(fullPath, start, end),
      path: fullPath,
      range: { end, start },
      text: leaf.text,
      textStyle: getTextStyle(typography, element, fullPath, leaf),
    });
    offset = end;
  }

  if (runs.length === 0) {
    const fullPath = [...path, 0];

    return [
      {
        id: getRunId(fullPath, 0, 0),
        path: fullPath,
        range: { end: 0, start: 0 },
        text: '',
        textStyle: getTextStyle(typography, element, fullPath, { text: '' }),
      },
    ];
  }

  return runs;
};

const createBox = ({
  height,
  kind,
  left = 0,
  path,
  split,
  top = 0,
  width = 0,
}: {
  height: number;
  kind: PlitePageLayoutBoxKind;
  left?: number;
  path: Path;
  split?: PlitePageLayoutBoxSplit;
  top?: number;
  width?: number;
}): PlitePageLayoutBox => ({
  kind,
  path,
  rect: { height, left, top, width },
  split,
});

const getElementChildrenOfType = (element: Element, type: string) =>
  element.children.filter(
    (child): child is Element => isElement(child) && child.type === type
  );

const createLayoutBoxes = (
  element: Element,
  path: Path,
  lineHeight: number
): PlitePageLayoutBox[] => {
  switch (element.type) {
    case 'code-block': {
      const lines = Math.max(1, NodeApi.string(element).split('\n').length);

      return [
        createBox({
          height: lines * lineHeight,
          kind: 'block',
          path,
          split: 'avoid',
        }),
        ...Array.from({ length: lines }, (_, index) =>
          createBox({
            height: lineHeight,
            kind: 'code-line',
            path: [...path, 0],
            split: 'line',
            top: index * lineHeight,
          })
        ),
      ];
    }
    case 'image':
      return [
        createBox({
          height: lineHeight,
          kind: 'image',
          path,
          split: 'avoid',
        }),
      ];
    case 'table':
      return createTableLayoutBoxes(element, path);
    case 'thematic-break':
      return [
        createBox({
          height: lineHeight,
          kind: 'thematic-break',
          path,
          split: 'avoid',
        }),
      ];
    default:
      return [];
  }
};

const createTableLayoutBoxes = (
  element: Element,
  path: Path
): PlitePageLayoutBox[] => {
  const rows = getElementChildrenOfType(element, 'table-row');
  const width = rows.reduce(
    (max, row) =>
      Math.max(max, getElementChildrenOfType(row, 'table-cell').length),
    0
  );
  const boxes = [
    createBox({
      height: rows.length,
      kind: 'table',
      path,
      split: 'row',
      width,
    }),
  ];

  rows.forEach((row, rowIndex) => {
    getElementChildrenOfType(row, 'table-cell').forEach((_, columnIndex) => {
      boxes.push(
        createBox({
          height: 1,
          kind: 'table-cell',
          left: columnIndex,
          path: [...path, rowIndex, columnIndex],
          split: 'avoid',
          top: rowIndex,
          width: 1,
        })
      );
    });
  });

  return boxes;
};

const resolveNodeLayoutPlan = (
  plan: PliteNodeLayoutPlan | null | undefined,
  getDefaultBoxes: () => readonly PlitePageLayoutBox[]
): {
  boxes: readonly PlitePageLayoutBox[];
  mode: 'text' | 'units';
  units?: readonly PlitePageLayoutUnit[];
} => {
  if (!plan || plan.type === 'text') {
    return {
      boxes: plan?.boxes ?? getDefaultBoxes(),
      mode: 'text',
    };
  }

  if (plan.type === 'box') {
    return {
      boxes: [plan.box],
      mode: 'units',
      units: [
        {
          key: `${getPlitePageLayoutPathKey(plan.box.path)}:${plan.box.kind}`,
          kind: plan.box.kind,
          path: [...plan.box.path],
          rect: plan.box.rect,
          split: plan.box.split === 'avoid' ? 'avoid' : 'page',
        },
      ],
    };
  }

  return {
    boxes: plan.boxes ?? getDefaultBoxes(),
    mode: 'units',
    units: plan.units,
  };
};

const extractLayoutBlocks = (
  editor: EditorType<Value>,
  root: RootKey,
  settings: PlitePageSettings,
  measurementProfile: PlitePageLayoutMeasurementProfile,
  typography: PlitePageLayoutTypography | undefined,
  nodeLayout: PliteNodeLayoutProvider | undefined
): PlitePageLayoutBlock[] => {
  const children = editor.read((state) =>
    state.value.root(toPublicRootOption(root))
  );

  return children.flatMap((node: Descendant, index: number) => {
    if (!isElement(node)) {
      return [];
    }

    const path = [index];
    const blockStyle = getBlockStyle(typography, node, path);
    let defaultBoxes: readonly PlitePageLayoutBox[] | null = null;
    let defaultTextStyle: PlitePageLayoutTextStyle | null = null;
    const getDefaultBoxes = () => {
      defaultBoxes ??= createLayoutBoxes(node, path, blockStyle.lineHeight);

      return defaultBoxes;
    };
    const getDefaultTextStyle = () => {
      defaultTextStyle ??= getTextStyle(typography, node, path, { text: '' });

      return defaultTextStyle;
    };
    const resolvedLayout = resolveNodeLayoutPlan(
      nodeLayout?.({
        defaults: {
          block: blockStyle,
          get boxes() {
            return getDefaultBoxes();
          },
          get text() {
            return getDefaultTextStyle();
          },
        },
        element: node,
        measurementProfile,
        pageSettings: settings,
        path,
      }),
      getDefaultBoxes
    );
    const textLayout = resolvedLayout.mode === 'text';
    const runs = textLayout ? extractLayoutRuns(node, path, typography) : [];
    const text = textLayout ? NodeApi.string(node) : '';
    const textStyle = runs[0]?.textStyle ?? getDefaultTextStyle();

    return {
      boxes: resolvedLayout.boxes,
      element: node,
      lineHeight: blockStyle.lineHeight,
      path,
      runs,
      spacingAfter: blockStyle.blockSpacing ?? 0,
      text,
      textStyle,
      units: resolvedLayout.units,
    };
  });
};

const isPlitePageSettings = <TSettings extends PlitePageSettings>(
  source: PlitePageSettingsSource<TSettings>
): source is TSettings => 'margins' in source && 'preset' in source;

const readLayoutSettings = <TSettings extends PlitePageSettings>(
  editor: EditorType<Value>,
  source: PlitePageSettingsSource<TSettings> | null | undefined
): PlitePageSettings => {
  if (!source) {
    return DEFAULT_SETTINGS;
  }

  if (isPlitePageSettings(source)) {
    return normalizePlitePageSettings(source);
  }

  return normalizePlitePageSettings(
    editor.read((state) => state.getField(source))
  );
};

const createEmptyLayoutSnapshot = (
  settings: PlitePageSettings,
  version: number,
  root: RootKey = MAIN_ROOT_KEY
): PlitePageLayoutSnapshot => {
  const page = createPlitePage(settings);

  return {
    blocks: [],
    fragments: [],
    measurementProfile: {
      ...DEFAULT_MEASUREMENT_PROFILE,
      page: settings,
      root,
    },
    page,
    pageBreaks: null,
    pageBreaksStatus: 'none',
    pages: [page],
    root,
    settings,
    version,
  };
};

type PlitePageLayoutFragmentUnitMatch = {
  fragment: PlitePageLayoutFragment;
  unit: PlitePageLayoutUnit;
};

type PlitePageLayoutFragmentIndex = {
  exactFragments: Map<string, readonly PlitePageLayoutFragment[]>;
  unitsByAncestorPath: Map<string, readonly PlitePageLayoutFragmentUnitMatch[]>;
  unitsByPath: Map<string, readonly PlitePageLayoutFragmentUnitMatch[]>;
};

const SNAPSHOT_FRAGMENT_INDEX = new WeakMap<
  PlitePageLayoutSnapshot,
  PlitePageLayoutFragmentIndex
>();

const appendFragmentIndexValue = <T>(
  map: Map<string, T[]>,
  key: string,
  value: T
) => {
  const values = map.get(key);

  if (values) {
    values.push(value);
  } else {
    map.set(key, [value]);
  }
};

const getPlitePageLayoutFragmentIndex = (
  snapshot: PlitePageLayoutSnapshot
): PlitePageLayoutFragmentIndex => {
  const cached = SNAPSHOT_FRAGMENT_INDEX.get(snapshot);

  if (cached) {
    return cached;
  }

  const exactFragments = new Map<string, PlitePageLayoutFragment[]>();
  const unitsByAncestorPath = new Map<
    string,
    PlitePageLayoutFragmentUnitMatch[]
  >();
  const unitsByPath = new Map<string, PlitePageLayoutFragmentUnitMatch[]>();

  for (const fragment of snapshot.fragments) {
    appendFragmentIndexValue(
      exactFragments,
      getPlitePageLayoutPathKey(fragment.path),
      fragment
    );

    for (const unit of fragment.units ?? []) {
      const match = { fragment, unit };
      const unitPathKey = getPlitePageLayoutPathKey(unit.path);

      appendFragmentIndexValue(unitsByPath, unitPathKey, match);

      for (let index = 0; index <= unit.path.length; index++) {
        appendFragmentIndexValue(
          unitsByAncestorPath,
          getPlitePageLayoutPathKey(unit.path.slice(0, index)),
          match
        );
      }
    }
  }

  const index = {
    exactFragments,
    unitsByAncestorPath,
    unitsByPath,
  };

  SNAPSHOT_FRAGMENT_INDEX.set(snapshot, index);
  return index;
};

const addFragmentUnitMatches = (
  target: Map<string, PlitePageLayoutFragmentUnitMatch>,
  matches: readonly PlitePageLayoutFragmentUnitMatch[] | undefined
) => {
  if (!matches) {
    return;
  }

  for (const match of matches) {
    target.set(`${match.fragment.id}:${match.unit.key}`, match);
  }
};

const getAncestorPathKeys = (path: Path) => {
  const keys: string[] = [];

  for (let index = path.length; index >= 0; index--) {
    keys.push(getPlitePageLayoutPathKey(path.slice(0, index)));
  }

  return keys;
};

export const getPlitePageLayoutFragments = (
  snapshot: PlitePageLayoutSnapshot,
  path: Path
): readonly PlitePageLayoutFragment[] => {
  const index = getPlitePageLayoutFragmentIndex(snapshot);
  const pathKey = getPlitePageLayoutPathKey(path);
  const exactFragments = index.exactFragments.get(pathKey);

  if (exactFragments) {
    return exactFragments;
  }

  const matchedUnits = new Map<string, PlitePageLayoutFragmentUnitMatch>();

  for (const ancestorPathKey of getAncestorPathKeys(path)) {
    addFragmentUnitMatches(
      matchedUnits,
      index.unitsByPath.get(ancestorPathKey)
    );
  }
  addFragmentUnitMatches(matchedUnits, index.unitsByAncestorPath.get(pathKey));

  if (matchedUnits.size === 0) {
    return [];
  }

  const unitsByFragment = new Map<string, PlitePageLayoutUnit[]>();
  const fragmentsById = new Map<string, PlitePageLayoutFragment>();

  for (const { fragment, unit } of matchedUnits.values()) {
    fragmentsById.set(fragment.id, fragment);
    appendFragmentIndexValue(unitsByFragment, fragment.id, unit);
  }

  return [...fragmentsById.values()].map((fragment) => ({
    ...fragment,
    units: unitsByFragment.get(fragment.id) ?? [],
  }));
};

const readLayoutRoot = <TSettings extends PlitePageSettings>(
  editor: EditorType<Value>,
  options: PlitePageLayoutOptions<TSettings>
): RootKey => {
  assertPublicRootKey(options.root);

  return options.root ?? editor.read((state) => state.view.root());
};

const resolveProjectionRoot = (
  range: Range,
  layoutRoot: RootKey,
  options: PlitePageLayoutProjectRangeOptions | undefined
): RootKey | null => {
  assertPublicRootKey(options?.root);
  assertPublicRootKey(range.anchor.root);
  assertPublicRootKey(range.focus.root);

  const fallbackRoot = options?.root ?? layoutRoot;
  const anchorRoot = range.anchor.root ?? fallbackRoot;
  const focusRoot = range.focus.root ?? fallbackRoot;

  if (anchorRoot !== focusRoot) {
    return null;
  }

  if (options?.root && options.root !== anchorRoot) {
    return null;
  }

  return anchorRoot;
};

const createEstimatedLines = (
  block: PlitePageLayoutMeasuredBlock
): PlitePageLayoutMeasuredLine[] => {
  if (block.lines && block.lines.length > 0) {
    return block.lines.map((line) => {
      const runs =
        line.runs ??
        (block.runs
          ? createEstimatedLineRuns(block, line.start, line.end)
          : []);

      return runs.length > 0 ? { ...line, runs } : { ...line };
    });
  }

  const lineCount = Math.max(1, block.lineCount);
  const charactersPerLine = Math.max(
    1,
    Math.ceil(block.text.length / lineCount)
  );
  const lines: PlitePageLayoutMeasuredLine[] = [];

  for (let index = 0; index < lineCount; index++) {
    const start = Math.min(block.text.length, index * charactersPerLine);
    const end =
      index === lineCount - 1
        ? block.text.length
        : Math.min(block.text.length, start + charactersPerLine);

    lines.push({
      end,
      height: block.lineHeight,
      runs: createEstimatedLineRuns(block, start, end),
      start,
      text: block.text.slice(start, end),
      width: 0,
    });
  }

  return lines;
};

const createEstimatedLineRuns = (
  block: PlitePageLayoutBlock,
  lineStart: number,
  lineEnd: number
): PlitePageLayoutPlacedRun[] =>
  (block.runs ?? []).flatMap((run) => {
    const start = Math.max(lineStart, run.range.start);
    const end = Math.min(lineEnd, run.range.end);

    if (end < start || (end === start && run.text.length > 0)) {
      return [];
    }

    const textStart = start - run.range.start;
    const textEnd = end - run.range.start;

    return [
      {
        ...run,
        leafRange: {
          end: textEnd,
          start: textStart,
        },
        left: estimateTextWidth(block.text.slice(lineStart, start)),
        range: { end, start },
        text: run.text.slice(textStart, textEnd),
        width: estimateTextWidth(run.text.slice(textStart, textEnd)),
      },
    ];
  });

const estimateTextWidth = (text: string) => text.length * 8;

const createEstimatedBlockLines = (
  block: PlitePageLayoutBlock,
  page: PlitePageLayoutPage
): PlitePageLayoutMeasuredLine[] => {
  const charactersPerLine = Math.max(18, Math.floor(page.content.width / 8));
  const lines: PlitePageLayoutMeasuredLine[] = [];
  const hardLines = block.text.split('\n');
  let offset = 0;

  hardLines.forEach((hardLine, hardLineIndex) => {
    if (hardLine.length === 0) {
      lines.push({
        end: offset,
        height: block.lineHeight,
        runs: createEstimatedLineRuns(block, offset, offset),
        start: offset,
        text: '',
        width: 0,
      });
    } else {
      for (
        let lineStart = 0;
        lineStart < hardLine.length;
        lineStart += charactersPerLine
      ) {
        const lineEnd = Math.min(
          hardLine.length,
          lineStart + charactersPerLine
        );
        const start = offset + lineStart;
        const end = offset + lineEnd;
        const text = block.text.slice(start, end);

        lines.push({
          end,
          height: block.lineHeight,
          runs: createEstimatedLineRuns(block, start, end),
          start,
          text,
          width: Math.min(page.content.width, estimateTextWidth(text)),
        });
      }
    }

    offset += hardLine.length;

    if (hardLineIndex < hardLines.length - 1) {
      offset += 1;
    }
  });

  return lines.length > 0
    ? lines
    : [
        {
          end: 0,
          height: block.lineHeight,
          start: 0,
          text: '',
          width: 0,
        },
      ];
};

const estimatePlitePageLayoutMeasuredBlock = (
  block: PlitePageLayoutBlock,
  blockIndex: number,
  page: PlitePageLayoutPage
): PlitePageLayoutMeasuredBlock => {
  const lines = createEstimatedBlockLines(block, page);

  return {
    ...block,
    blockIndex,
    lineCount: Math.max(1, lines.length),
    lines,
  };
};

const createUnitPlitePageLayoutMeasuredBlock = (
  block: PlitePageLayoutBlock,
  blockIndex: number
): PlitePageLayoutMeasuredBlock => ({
  ...block,
  blockIndex,
  lineCount: 0,
  lines: [],
});

export const createEstimatedPageLayoutEngine = (): PlitePageLayoutEngine => ({
  id: 'estimated',
  measurementProfile: { strategy: 'estimated' },
  compose(input) {
    const measuredBlocks = input.blocks.map((block, blockIndex) =>
      block.units?.length
        ? createUnitPlitePageLayoutMeasuredBlock(block, blockIndex)
        : estimatePlitePageLayoutMeasuredBlock(block, blockIndex, input.page)
    );

    return paginatePlitePageLayoutBlocks({
      measuredBlocks,
      page: input.page,
      settings: input.settings,
      version: input.version,
    });
  },
});

const getPretextPreparedKey = (
  text: string,
  font: string,
  letterSpacing: number | undefined,
  whiteSpace: NonNullable<PretextPageLayoutEngineOptions['whiteSpace']>,
  wordBreak: NonNullable<PretextPageLayoutEngineOptions['wordBreak']>
) => `${font}\0${letterSpacing ?? 0}\0${whiteSpace}\0${wordBreak}\0${text}`;

const getPretextMeasuredBlockCacheKey = (
  block: PlitePageLayoutBlock,
  pageContentWidth: number,
  getTextKey: (text: string) => string = getStableHashKey
) =>
  getStableHashKey({
    boxes: block.boxes?.map((box) => ({
      kind: box.kind,
      rect: box.rect,
      split: box.split,
    })),
    lineHeight: block.lineHeight,
    pageContentWidth,
    runs: block.runs?.map((run) => ({
      range: run.range,
      textStyle: run.textStyle,
    })),
    spacingAfter: block.spacingAfter,
    textKey: getTextKey(block.text),
    textStyle: block.textStyle,
    units: block.units?.map((unit) => ({
      key: unit.key,
      kind: unit.kind,
      rect: unit.rect,
      split: unit.split,
    })),
  });

const remapPretextMeasuredRun = (
  run: PlitePageLayoutPlacedRun,
  block: PlitePageLayoutBlock,
  measuredBlock: PlitePageLayoutMeasuredBlock
): PlitePageLayoutPlacedRun => {
  const runPath = (run as PlitePageLayoutPlacedRun & { path?: Path }).path;
  const matchingRun = block.runs?.find(
    (blockRun) =>
      Array.isArray(blockRun.path) &&
      blockRun.range.start <= run.range.start &&
      blockRun.range.end >= run.range.end
  );
  const path = runPath
    ? measuredBlock.path.length <= runPath.length
      ? [...block.path, ...runPath.slice(measuredBlock.path.length)]
      : [...runPath]
    : matchingRun
      ? [...matchingRun.path]
      : [...block.path, 0];

  return {
    ...run,
    id: getRunId(path, run.range.start, run.range.end),
    path,
  };
};

const remapPretextMeasuredBlock = ({
  block,
  blockIndex,
  measuredBlock,
}: {
  block: PlitePageLayoutBlock;
  blockIndex: number;
  measuredBlock: PlitePageLayoutMeasuredBlock;
}): PlitePageLayoutMeasuredBlock => ({
  ...block,
  blockIndex,
  lineCount: measuredBlock.lineCount,
  lines: measuredBlock.lines?.map((line) => ({
    ...line,
    runs: line.runs?.map((run) =>
      remapPretextMeasuredRun(run, block, measuredBlock)
    ),
  })),
});

const COLLAPSIBLE_BOUNDARY_RE = /[ \t\n\f\r]+/;
const LEADING_COLLAPSIBLE_BOUNDARY_RE = /^[ \t\n\f\r]+/;
const TRAILING_COLLAPSIBLE_BOUNDARY_RE = /[ \t\n\f\r]+$/;

const getLeadingCollapsibleLength = (text: string) =>
  text.match(LEADING_COLLAPSIBLE_BOUNDARY_RE)?.[0].length ?? 0;

const getTrailingCollapsibleLength = (text: string) =>
  text.match(TRAILING_COLLAPSIBLE_BOUNDARY_RE)?.[0].length ?? 0;

export const pretextPageLayoutEngine = ({
  estimateBlock,
  maxPreparedEntries = 5000,
  whiteSpace = 'pre-wrap',
  wordBreak = 'normal',
}: PretextPageLayoutEngineOptions = {}): PlitePageLayoutEngine => {
  const preparedCache = new Map<
    string,
    ReturnType<typeof prepareWithSegments>
  >();
  const measuredBlockCache = new Map<
    string,
    {
      measuredBlock: PlitePageLayoutMeasuredBlock;
      text: string;
    }
  >();
  const textKeyCache = new Map<string, string>();

  const getPrepared = (
    text: string,
    font: string,
    letterSpacing: number | undefined
  ) => {
    const key = getPretextPreparedKey(
      text,
      font,
      letterSpacing,
      whiteSpace,
      wordBreak
    );
    const cached = preparedCache.get(key);

    if (cached) {
      return cached;
    }

    const prepared = prepareWithSegments(text, font, {
      letterSpacing,
      whiteSpace,
      wordBreak,
    });
    preparedCache.set(key, prepared);

    if (preparedCache.size > maxPreparedEntries) {
      const [oldestKey] = preparedCache.keys();

      if (oldestKey) {
        preparedCache.delete(oldestKey);
      }
    }

    return prepared;
  };

  const getTextKey = (text: string) => {
    const cached = textKeyCache.get(text);

    if (cached) {
      return cached;
    }

    const key = getStableHashKey(text);
    textKeyCache.set(text, key);

    if (textKeyCache.size > maxPreparedEntries) {
      const [oldestKey] = textKeyCache.keys();

      if (oldestKey) {
        textKeyCache.delete(oldestKey);
      }
    }

    return key;
  };

  const measureInlineText = (
    text: string,
    font: string,
    letterSpacing: number | undefined
  ) => measureNaturalWidth(getPrepared(text, font, letterSpacing));

  const createLineRuns = (
    block: PlitePageLayoutBlock,
    lineStart: number,
    lineEnd: number
  ): PlitePageLayoutPlacedRun[] => {
    const lineRuns: PlitePageLayoutPlacedRun[] = [];
    let left = 0;

    for (const run of block.runs ?? []) {
      const start = Math.max(lineStart, run.range.start);
      const end = Math.min(lineEnd, run.range.end);

      if (end < start || (end === start && run.text.length > 0)) {
        continue;
      }

      const textStart = start - run.range.start;
      const textEnd = end - run.range.start;
      const text = run.text.slice(textStart, textEnd);
      const width = measureInlineText(
        text,
        run.textStyle.font,
        run.textStyle.letterSpacing
      );

      lineRuns.push({
        ...run,
        leafRange: {
          end: textEnd,
          start: textStart,
        },
        left,
        range: { end, start },
        text,
        width,
      });
      left += width;
    }

    return lineRuns;
  };

  const createRichInlineLines = (
    block: PlitePageLayoutBlock,
    maxWidth: number
  ): PlitePageLayoutMeasuredLine[] | null => {
    if (
      whiteSpace !== 'normal' ||
      wordBreak !== 'normal' ||
      !block.runs ||
      block.runs.length <= 1
    ) {
      return null;
    }

    const sourceItems = block.runs.map((run) => {
      const sourceStart = getLeadingCollapsibleLength(run.text);
      const sourceEnd =
        run.text.length - getTrailingCollapsibleLength(run.text);
      const text =
        sourceEnd <= sourceStart ? '' : run.text.slice(sourceStart, sourceEnd);

      return {
        prepared: getPrepared(
          text,
          run.textStyle.font,
          run.textStyle.letterSpacing
        ),
        run,
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
    const lines: PlitePageLayoutMeasuredLine[] = [];

    walkRichInlineLineRanges(prepared, maxWidth, (range) => {
      const line = materializeRichInlineLineRange(prepared, range);
      const runs: PlitePageLayoutPlacedRun[] = [];
      let left = 0;

      for (const fragment of line.fragments) {
        const source = sourceItems[fragment.itemIndex];

        if (!source) {
          continue;
        }

        if (fragment.gapBefore > 0) {
          const previousSource = sourceItems[fragment.itemIndex - 1];
          const gapSource =
            previousSource &&
            previousSource.sourceEnd < previousSource.run.text.length
              ? {
                  end: previousSource.run.text.length,
                  source: previousSource,
                  start: previousSource.sourceEnd,
                }
              : source.sourceStart > 0
                ? {
                    end: source.sourceStart,
                    source,
                    start: 0,
                  }
                : null;

          if (gapSource && gapSource.end > gapSource.start) {
            runs.push({
              ...gapSource.source.run,
              leafRange: {
                end: gapSource.end,
                start: gapSource.start,
              },
              left,
              range: {
                end: gapSource.source.run.range.start + gapSource.end,
                start: gapSource.source.run.range.start + gapSource.start,
              },
              text: gapSource.source.run.text.slice(
                gapSource.start,
                gapSource.end
              ),
              width: fragment.gapBefore,
            });
          }

          left += fragment.gapBefore;
        }

        const textStart =
          source.sourceStart +
          getPretextPreparedTextOffset(source.prepared, fragment.start);
        const textEnd =
          source.sourceStart +
          getPretextPreparedTextOffset(source.prepared, fragment.end);

        if (
          textEnd < textStart ||
          (textEnd === textStart && source.run.text.length > 0)
        ) {
          left += fragment.occupiedWidth;
          continue;
        }

        runs.push({
          ...source.run,
          leafRange: {
            end: textEnd,
            start: textStart,
          },
          left,
          range: {
            end: source.run.range.start + textEnd,
            start: source.run.range.start + textStart,
          },
          text: fragment.text,
          width: fragment.occupiedWidth,
        });
        left += fragment.occupiedWidth;
      }

      lines.push({
        end: runs.at(-1)?.range.end ?? 0,
        height: block.lineHeight,
        runs: runs.length > 0 ? runs : undefined,
        start: runs[0]?.range.start ?? 0,
        text: line.fragments
          .map(
            (fragment) => `${fragment.gapBefore > 0 ? ' ' : ''}${fragment.text}`
          )
          .join(''),
        width: line.width,
      });
    });

    if (lines.length > 0) {
      return lines;
    }

    if (COLLAPSIBLE_BOUNDARY_RE.test(block.text)) {
      return [
        {
          end: 0,
          height: block.lineHeight,
          start: 0,
          text: '',
          width: 0,
        },
      ];
    }

    return null;
  };

  const withMeasuredRuns = (
    block: PlitePageLayoutBlock,
    line: Omit<PlitePageLayoutMeasuredLine, 'runs'>
  ): PlitePageLayoutMeasuredLine => {
    if (block.runs?.length === 1) {
      const run = block.runs[0]!;
      const lineEnd =
        line.end === line.start && line.text.length > 0
          ? line.start + line.text.length
          : line.end;
      const start = Math.max(line.start, run.range.start);
      const end = Math.min(lineEnd, run.range.end);

      if (end < start || (end === start && run.text.length > 0)) {
        return line;
      }

      const textStart = start - run.range.start;
      const textEnd = end - run.range.start;

      return {
        ...line,
        runs: [
          {
            ...run,
            leafRange: {
              end: textEnd,
              start: textStart,
            },
            left: 0,
            range: { end, start },
            text: run.text.slice(textStart, textEnd),
            width: line.width,
          },
        ],
      };
    }

    const runs = createLineRuns(block, line.start, line.end);

    if (runs.length === 0) {
      return line;
    }

    const width = runs.at(-1)!.left + runs.at(-1)!.width;

    return {
      ...line,
      runs,
      width,
    };
  };

  return {
    id: 'pretext',
    measurementProfile: {
      estimatedBlocks: Boolean(estimateBlock),
      whiteSpace,
      wordBreak,
    },
    compose(input) {
      let recordedCacheHit = false;
      let recordedCacheMiss = false;
      const recordCacheEvent = (
        id: 'measured-block-cache-hit' | 'measured-block-cache-miss'
      ) => {
        if (id === 'measured-block-cache-hit') {
          if (recordedCacheHit) {
            return;
          }
          recordedCacheHit = true;
        } else {
          if (recordedCacheMiss) {
            return;
          }
          recordedCacheMiss = true;
        }

        profileLayoutDuration(id, () => {});
      };
      const measureBlock = (
        block: PlitePageLayoutBlock,
        blockIndex: number
      ): PlitePageLayoutMeasuredBlock => {
        const richInlineLines = createRichInlineLines(
          block,
          input.page.content.width
        );

        if (richInlineLines) {
          return {
            ...block,
            blockIndex,
            lineCount: Math.max(1, richInlineLines.length),
            lines: richInlineLines,
          };
        }

        const prepared = getPrepared(
          block.text,
          block.textStyle.font,
          block.textStyle.letterSpacing
        );
        const result = layoutWithLines(
          prepared,
          input.page.content.width,
          block.lineHeight
        );

        return {
          ...block,
          blockIndex,
          lineCount: Math.max(1, result.lineCount),
          lines:
            result.lines.length === 0
              ? [
                  withMeasuredRuns(block, {
                    end: 0,
                    height: block.lineHeight,
                    start: 0,
                    text: '',
                    width: 0,
                  }),
                ]
              : result.lines.map((line) =>
                  withMeasuredRuns(block, {
                    end: getPretextPreparedTextOffset(prepared, line.end),
                    height: block.lineHeight,
                    start: getPretextPreparedTextOffset(prepared, line.start),
                    text: line.text,
                    width: line.width,
                  })
                ),
        };
      };

      const measuredBlocks = profileLayoutDuration(
        'pretext-measure-blocks',
        () =>
          input.blocks.map((block, blockIndex) => {
            if (block.units?.length) {
              return createUnitPlitePageLayoutMeasuredBlock(block, blockIndex);
            }

            if (
              estimateBlock?.({
                block,
                blockIndex,
                page: input.page,
                settings: input.settings,
              })
            ) {
              return estimatePlitePageLayoutMeasuredBlock(
                block,
                blockIndex,
                input.page
              );
            }

            const key = getPretextMeasuredBlockCacheKey(
              block,
              input.page.content.width,
              getTextKey
            );
            const cached = measuredBlockCache.get(key);

            if (cached && cached.text === block.text) {
              recordCacheEvent('measured-block-cache-hit');
              return remapPretextMeasuredBlock({
                block,
                blockIndex,
                measuredBlock: cached.measuredBlock,
              });
            }

            recordCacheEvent('measured-block-cache-miss');

            const measuredBlock = measureBlock(block, blockIndex);

            measuredBlockCache.set(key, {
              measuredBlock,
              text: block.text,
            });

            if (measuredBlockCache.size > maxPreparedEntries) {
              const [oldestKey] = measuredBlockCache.keys();

              if (oldestKey) {
                measuredBlockCache.delete(oldestKey);
              }
            }

            return measuredBlock;
          })
      );

      return profileLayoutDuration('pretext-paginate-blocks', () =>
        paginatePlitePageLayoutBlocks({
          measuredBlocks,
          page: input.page,
          settings: input.settings,
          version: input.version,
        })
      );
    },
  };
};

const getPretextPreparedTextOffset = (
  prepared: ReturnType<typeof prepareWithSegments>,
  cursor: { graphemeIndex: number; segmentIndex: number }
): number => {
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

export const paginatePlitePageLayoutBlocks = ({
  measuredBlocks,
  page,
  settings,
  version,
}: {
  measuredBlocks: readonly PlitePageLayoutMeasuredBlock[];
  page: PlitePageLayoutPage;
  settings: PlitePageSettings;
  version: number;
}): PlitePageLayoutEngineOutput => {
  const pages: PlitePageLayoutPage[] = [page];
  const fragments: PlitePageLayoutFragment[] = [];
  let pageIndex = 0;
  let cursorTop = page.content.top;

  measuredBlocks.forEach((block) => {
    if (block.units?.length) {
      let consumedUnits = 0;
      let fragmentIndex = 0;

      while (consumedUnits < block.units.length) {
        const page = pages[pageIndex]!;
        const pageBottom = page.content.top + page.content.height;
        const fragmentTop = cursorTop;
        const fragmentUnits: PlitePageLayoutUnit[] = [];
        let fragmentHeight = 0;

        while (consumedUnits < block.units.length) {
          const unit = block.units[consumedUnits]!;
          const unitHeight = Math.max(0, unit.rect.height);
          const remainingPageHeight = Math.max(0, pageBottom - cursorTop);
          const pageIsEmpty = cursorTop === page.content.top;

          if (unitHeight > remainingPageHeight && !pageIsEmpty) {
            break;
          }

          fragmentUnits.push({
            ...unit,
            path: [...unit.path],
            rect: {
              ...unit.rect,
              top: fragmentTop + fragmentHeight,
            },
          });
          fragmentHeight += unitHeight;
          cursorTop += unitHeight;
          consumedUnits++;

          if (unitHeight > remainingPageHeight && pageIsEmpty) {
            break;
          }
        }

        if (fragmentUnits.length === 0) {
          pageIndex++;
          pages[pageIndex] = createPlitePage(settings, pageIndex);
          cursorTop = pages[pageIndex]!.content.top;
          continue;
        }

        const isLastFragment = consumedUnits === block.units.length;
        const height =
          fragmentHeight + (isLastFragment ? block.spacingAfter : 0);

        fragments.push({
          blockIndex: block.blockIndex,
          height,
          id: `${block.path.join('.')}:${version}:${fragmentIndex}`,
          lineCount: 0,
          lines: [],
          pageIndex,
          path: block.path,
          text: block.text,
          top: fragmentTop,
          units: fragmentUnits,
        });
        cursorTop += isLastFragment ? block.spacingAfter : 0;
        fragmentIndex++;

        if (consumedUnits < block.units.length) {
          pageIndex++;
          pages[pageIndex] = createPlitePage(settings, pageIndex);
          cursorTop = pages[pageIndex]!.content.top;
        }
      }

      return;
    }

    const measuredLines = createEstimatedLines(block);
    const lineTotal = Math.max(block.lineCount, measuredLines.length);
    const page = pages[pageIndex]!;
    const blockContentHeight = lineTotal * block.lineHeight;
    const blockHeight = blockContentHeight + block.spacingAfter;
    const avoidSplitHeight =
      blockHeight <= page.content.height ? blockHeight : blockContentHeight;
    const avoidsSplit =
      avoidSplitHeight <= page.content.height &&
      block.boxes?.some(
        (box) =>
          box.split === 'avoid' &&
          getPlitePageLayoutPathKey(box.path) ===
            getPlitePageLayoutPathKey(block.path)
      );

    if (avoidsSplit && cursorTop !== page.content.top) {
      const pageBottom = page.content.top + page.content.height;
      const remainingPageHeight = Math.max(0, pageBottom - cursorTop);

      if (avoidSplitHeight > remainingPageHeight) {
        pageIndex++;
        pages[pageIndex] = createPlitePage(settings, pageIndex);
        cursorTop = pages[pageIndex]!.content.top;
      }
    }

    let consumedLines = 0;
    let remainingLines = lineTotal;
    let fragmentIndex = 0;

    while (remainingLines > 0) {
      const page = pages[pageIndex]!;
      const pageBottom = page.content.top + page.content.height;
      const remainingPageHeight = Math.max(0, pageBottom - cursorTop);
      const availableLines =
        cursorTop === page.content.top
          ? Math.max(1, Math.floor(page.content.height / block.lineHeight))
          : Math.floor(remainingPageHeight / block.lineHeight);

      if (availableLines <= 0) {
        pageIndex++;
        pages[pageIndex] = createPlitePage(settings, pageIndex);
        cursorTop = pages[pageIndex]!.content.top;
        continue;
      }

      const lineCount = Math.min(remainingLines, availableLines);
      const isLastFragment = lineCount === remainingLines;
      const fragmentLines = measuredLines
        .slice(consumedLines, consumedLines + lineCount)
        .map((line, index) => ({
          ...line,
          top: cursorTop + index * block.lineHeight,
        }));
      const height =
        lineCount * block.lineHeight +
        (isLastFragment ? block.spacingAfter : 0);

      fragments.push({
        blockIndex: block.blockIndex,
        height,
        id: `${block.path.join('.')}:${version}:${fragmentIndex}`,
        lineCount,
        lines: fragmentLines,
        pageIndex,
        path: block.path,
        text: block.text,
        top: cursorTop,
      });
      cursorTop += height;
      consumedLines += lineCount;
      remainingLines -= lineCount;
      fragmentIndex++;

      if (remainingLines > 0) {
        pageIndex++;
        pages[pageIndex] = createPlitePage(settings, pageIndex);
        cursorTop = pages[pageIndex]!.content.top;
      }
    }
  });

  return { fragments, pages };
};

/** Create a page-layout reader with an explicit measurement engine. */
export const createPlitePageLayout = <
  TSettings extends PlitePageSettings = PlitePageSettings,
>(
  editor: EditorType<Value>,
  getOptions: () => PlitePageLayoutOptions<TSettings>
): PlitePageLayout => {
  let snapshot = createEmptyLayoutSnapshot(DEFAULT_SETTINGS, 0);
  let metrics: PlitePageLayoutMetrics = {
    blockCount: 0,
    composeCount: 0,
    lastDurationMs: 0,
    pageCount: 1,
  };
  const listeners = new Set<() => void>();
  let scheduledRefresh: {
    animationFrame: number | null;
    firstScheduledAt: number;
    timeout: ReturnType<typeof setTimeout> | null;
  } | null = null;

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const cancelScheduledRefresh = () => {
    if (!scheduledRefresh) {
      return;
    }

    if (
      scheduledRefresh.animationFrame !== null &&
      typeof cancelAnimationFrame === 'function'
    ) {
      cancelAnimationFrame(scheduledRefresh.animationFrame);
    }

    if (scheduledRefresh.timeout !== null) {
      clearTimeout(scheduledRefresh.timeout);
    }

    scheduledRefresh = null;
  };

  const refresh = (_reason: PlitePageLayoutRefreshReason = 'editor') => {
    cancelScheduledRefresh();

    const startedAt = getNow();
    const options = getOptions();
    const root = profileLayoutDuration('read-root', () =>
      readLayoutRoot(editor, options)
    );
    const settings = profileLayoutDuration('read-settings', () =>
      readLayoutSettings(editor, options.page)
    );
    const page = createPlitePage(settings);
    const version = profileLayoutDuration('read-version', () =>
      editor.read(
        (state) =>
          state.value.lastCommit()?.version ?? state.runtime.snapshot().version
      )
    );
    const measurementProfile = profileLayoutDuration(
      'measurement-profile',
      () =>
        createPlitePageLayoutMeasurementProfile({
          engine: options.engine,
          root,
          settings,
          typography: options.typography,
        })
    );
    const blocks = profileLayoutDuration('extract-blocks', () =>
      extractLayoutBlocks(
        editor,
        root,
        settings,
        measurementProfile,
        options.typography,
        options.nodeLayout
      )
    );
    const output = profileLayoutDuration('engine-compose', () =>
      options.engine.compose({
        blocks,
        page,
        settings,
        version,
      })
    );
    const pageBreakResult = profileLayoutDuration('page-breaks', () => {
      let pageBreaks: PlitePageBreakSnapshot | null = null;
      let pageBreaksStatus: PlitePageBreakSnapshotStatus = 'none';
      let pageBreakSnapshotToWrite: PlitePageBreakSnapshot | null = null;
      let pageBreakSnapshotWriteSource: EditorStateField<PlitePageBreakSnapshot | null> | null =
        null;
      const pageBreakOptions = options.pageBreaks;

      if (pageBreakOptions?.mode === 'read') {
        const documentKey = getPliteLayoutDocumentKey(blocks);
        const readSnapshot = readPlitePageBreakSnapshot(
          editor,
          pageBreakOptions.source
        );
        pageBreaksStatus = getPlitePageBreakSnapshotStatus({
          documentKey,
          measurementProfile,
          root,
          snapshot: readSnapshot,
          version,
        });
        pageBreaks = pageBreaksStatus === 'accepted' ? readSnapshot : null;
      } else if (pageBreakOptions?.mode === 'write') {
        const documentKey = getPliteLayoutDocumentKey(blocks);
        const computedPageBreakSnapshot = createPlitePageBreakSnapshot({
          documentKey,
          fragments: output.fragments,
          measurementProfile,
          root,
          version,
          writerId: pageBreakOptions.writerId,
        });
        const writeSource = pageBreakOptions.source;
        const currentSnapshot = editor.read((state) =>
          state.getField(writeSource)
        );
        const shouldWrite = !samePlitePageBreakSnapshot(
          currentSnapshot,
          computedPageBreakSnapshot
        );

        pageBreaks = computedPageBreakSnapshot;
        pageBreaksStatus = shouldWrite ? 'written' : 'accepted';
        pageBreakSnapshotToWrite = shouldWrite
          ? computedPageBreakSnapshot
          : null;
        pageBreakSnapshotWriteSource = shouldWrite ? writeSource : null;
      }

      return {
        pageBreaks,
        pageBreaksStatus,
        pageBreakSnapshotToWrite,
        pageBreakSnapshotWriteSource,
      };
    });

    snapshot = {
      blocks,
      fragments: output.fragments,
      measurementProfile,
      page,
      pageBreaks: pageBreakResult.pageBreaks,
      pageBreaksStatus: pageBreakResult.pageBreaksStatus,
      pages: output.pages.length === 0 ? [page] : output.pages,
      root,
      settings,
      version,
    };
    metrics = {
      blockCount: blocks.length,
      composeCount: metrics.composeCount + 1,
      lastDurationMs: getNow() - startedAt,
      pageCount: snapshot.pages.length,
    };
    profileLayoutDuration('notify', notify);

    if (
      pageBreakResult.pageBreakSnapshotWriteSource &&
      pageBreakResult.pageBreakSnapshotToWrite
    ) {
      editor.update((tx) => {
        tx.setField(
          pageBreakResult.pageBreakSnapshotWriteSource!,
          pageBreakResult.pageBreakSnapshotToWrite!
        );
      });
    }
  };

  const scheduleRefreshAfterTextInput = (
    reason: PlitePageLayoutRefreshReason,
    refreshOptions: {
      delayMs: number;
      maxDelayMs: number;
    }
  ) => {
    const now = getNow();
    const firstScheduledAt = scheduledRefresh?.firstScheduledAt ?? now;
    const delay = Math.max(
      0,
      Math.min(
        refreshOptions.delayMs,
        refreshOptions.maxDelayMs - (now - firstScheduledAt)
      )
    );
    cancelScheduledRefresh();

    const run = () => {
      scheduledRefresh = null;
      refresh(reason);
    };

    scheduledRefresh = {
      animationFrame: null,
      firstScheduledAt,
      timeout: setTimeout(() => {
        if (!scheduledRefresh) {
          return;
        }

        if (typeof requestAnimationFrame === 'function') {
          scheduledRefresh.timeout = null;
          scheduledRefresh.animationFrame = requestAnimationFrame(run);
          return;
        }

        run();
      }, delay),
    };
  };

  const unsubscribeEditor = editor.subscribeCommit((change) => {
    const options = getOptions();
    const writePageBreaks =
      options.pageBreaks?.mode === 'write' ? options.pageBreaks : null;

    if (
      writePageBreaks &&
      change.operations.length === 0 &&
      change.dirtyStateKeys.length > 0 &&
      change.dirtyStateKeys.every((key) => key === writePageBreaks.source.key)
    ) {
      return;
    }

    const shouldRefresh =
      change.childrenChanged ||
      change.dirtyStateKeys.length > 0 ||
      change.textChanged ||
      change.structureChanged;

    if (!shouldRefresh) {
      return;
    }

    const textOnlyChange = Boolean(
      change?.textChanged &&
        change.dirtyStateKeys.length === 0 &&
        !change.structureChanged
    );
    const textChangeRefresh = getTextChangeRefreshOptions(
      options.textChangeRefresh
    );

    if (textOnlyChange && textChangeRefresh.mode === 'deferred') {
      scheduleRefreshAfterTextInput('editor', textChangeRefresh);
    } else {
      refresh('editor');
    }
  });

  refresh('editor');

  return {
    destroy() {
      cancelScheduledRefresh();
      unsubscribeEditor();
      listeners.clear();
    },
    getFragments(path) {
      return getPlitePageLayoutFragments(snapshot, path);
    },
    getMetrics() {
      return metrics;
    },
    getSnapshot() {
      return snapshot;
    },
    projectRange(range, options) {
      const rangeRoot = resolveProjectionRoot(range, snapshot.root, options);

      if (rangeRoot !== snapshot.root) {
        return [];
      }

      const geometry = getPlitePageLayoutGeometry(snapshot.pages, options);
      const projection = getPlitePageLayoutProjection(snapshot, {
        geometry,
        hitTesting: false,
      });

      return projectRangeThroughRuns(projection, range);
    },
    refresh,
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

/** Create a layout reader with the built-in browser or estimated engine. */
export const createPliteLayout = <
  TSettings extends PlitePageSettings = PlitePageSettings,
>(
  editor: EditorType<Value>,
  getOptions: () => PliteLayoutOptions<TSettings>
): PlitePageLayout => {
  const fallbackEngine = canUseCanvasTextMeasurement()
    ? pretextPageLayoutEngine()
    : createEstimatedPageLayoutEngine();

  return createPlitePageLayout(editor, () => {
    const options = getOptions();
    const engine = options.engine ?? fallbackEngine;

    return {
      engine,
      nodeLayout: options.nodeLayout,
      page: options.page,
      pageBreaks: options.pageBreaks,
      root: options.root,
      textChangeRefresh: options.textChangeRefresh,
      typography: options.typography,
    };
  });
};
