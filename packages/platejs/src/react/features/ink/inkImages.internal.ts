import {
  BaseInkPlugin,
  type InkMark,
  type InkPassage,
} from '../../../features/ink/lib';
import {
  inkHolds,
  inkText,
  lineStart,
  placeMark,
} from '../../../features/ink/lib/inkMatch.internal';
import type { Editor } from '../../core';
import { inkElementSpans, measureInkBlock } from './inkMeasure.internal';
import { inkOutlinePoints, inkStrokeOutlinesPoints } from './inkPaint.internal';
import type { InkImagesOptions, InkPassageImages } from './InkPlugin';

const CROP_PADDING = 8;
const INK_TEXT_COLOR = '#111111';
const VOID_PILL_COLOR = '#f3f4f6';

type DrawableRun = Readonly<{
  font: string;
  height: number;
  isVoid: boolean;
  left: number;
  text: string;
  top: number;
  width: number;
}>;

type DrawableMark = Readonly<{
  bounds: readonly [minX: number, minY: number, maxX: number, maxY: number];
  dx: number;
  dy: number;
  mark: InkMark;
  outlines: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
}>;

type CapturedPassage = Readonly<{
  cropLeft: number;
  cropTop: number;
  doc: Document;
  height: number;
  marks: readonly DrawableMark[];
  runs: readonly DrawableRun[];
  scale: 1 | 2;
  voids: Readonly<Record<number, string>>;
  width: number;
}>;

const fontOf = (element: Element, view: Window | null) => {
  const style = view?.getComputedStyle(element);

  if (!style) return '16px sans-serif';

  const weight = style.fontWeight || '400';
  const fontStyle = style.fontStyle || 'normal';
  const size = style.fontSize || '16px';
  const family = style.fontFamily || 'sans-serif';

  return `${fontStyle} ${weight} ${size} ${family}`;
};

const capturePassage = (
  view: Editor,
  passage: InkPassage,
  maxSide: number
): CapturedPassage | null => {
  if (!Number.isFinite(maxSide) || maxSide <= 0) return null;

  const { read } = view.plugin(BaseInkPlugin);
  const saved = read.copy(passage.copy);
  const blockId = passage.block ?? saved?.block;

  if (!blockId) return null;
  if (!passage.block && (!saved || saved.lines.length === 0)) return null;

  const holder = view.read((state) => state.nodes.byId(blockId));

  if (!holder) return null;

  const now = inkText(view.read.schema, holder.node);

  if (!passage.block && (!saved || !inkHolds(saved, now))) {
    return null;
  }

  const element = view.api.dom.resolveDOMNode(holder.key);

  if (!element) return null;

  const spans = inkElementSpans(element, now.text);

  if (!spans) return null;

  const doc = element.ownerDocument;
  const win = doc.defaultView;
  const blockRect = element.getBoundingClientRect();
  const measuredLive = passage.block
    ? measureInkBlock(element, now.text, {
        left: blockRect.left,
        top: blockRect.top,
      })
    : undefined;
  const liveLines = passage.block ? measuredLive?.lines : saved?.lines;

  if (!liveLines || liveLines.length === 0) return null;

  const range = doc.createRange();
  const passageStart = passage.start;
  const passageEnd = passage.start + passage.text.length;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  const includeBox = (
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    if (width <= 0 && height <= 0) return;
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + width);
    maxY = Math.max(maxY, top + height);
  };

  for (const [index, line] of liveLines.entries()) {
    const lStart = lineStart(liveLines, index);

    if (line.end <= passageStart || lStart >= passageEnd) continue;
    includeBox(line.left, line.top, line.width, line.height);
  }

  const runs: DrawableRun[] = [];
  const voids: Record<number, string> = {};

  for (const span of spans) {
    if (span.end <= passageStart || span.start >= passageEnd) continue;

    if (span.piece instanceof Element) {
      const rect = span.piece.getBoundingClientRect();
      const visible = (span.piece.textContent ?? '').trim();
      const left = rect.left - blockRect.left;
      const top = rect.top - blockRect.top;

      voids[span.start] = visible;
      includeBox(left, top, rect.width, rect.height);
      runs.push({
        font: fontOf(span.piece, win),
        height: rect.height,
        isVoid: true,
        left,
        text: visible,
        top,
        width: rect.width,
      });
      continue;
    }

    const { node } = span.piece;
    const font = fontOf(node.parentElement ?? element, win);

    for (const [lineIndex, line] of liveLines.entries()) {
      const lStart = lineStart(liveLines, lineIndex);
      const from = Math.max(span.start, passageStart, lStart);
      const to = Math.min(span.end, passageEnd, line.end);

      if (to <= from) continue;

      const text = node.data.slice(from - span.start, to - span.start);

      if (text.length === 0) continue;

      range.setStart(node, from - span.start);
      range.setEnd(node, to - span.start);

      const rect = range.getBoundingClientRect();
      const left = rect.left - blockRect.left;
      const top = rect.top - blockRect.top;

      includeBox(left, top, rect.width, rect.height);
      runs.push({
        font,
        height: rect.height,
        isVoid: false,
        left,
        text,
        top,
        width: rect.width,
      });
    }
  }

  const drawableMarks: DrawableMark[] = [];

  for (const entry of passage.marks) {
    const mark = read.mark(entry.id);

    if (!mark) continue;

    let dx = 0;
    let dy = 0;
    let outlines: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [];

    if (passage.block && measuredLive) {
      const copies = mark.blocks.flatMap((block) => {
        const copy = read.copy(block.copy);

        return copy ? [copy] : [];
      });

      if (copies.length !== mark.blocks.length) continue;

      const liveList = copies.map((copy) => {
        if (copy.block === blockId) {
          return {
            ...measuredLive,
            ...(now.voids !== undefined ? { voids: now.voids } : {}),
          };
        }

        const sibling = view.read((state) => state.nodes.byId(copy.block));

        if (!sibling) return undefined;

        const siblingElement = view.api.dom.resolveDOMNode(sibling.key);

        if (!siblingElement) return undefined;

        const siblingNow = inkText(view.read.schema, sibling.node);
        const siblingMeasured = measureInkBlock(
          siblingElement,
          siblingNow.text,
          {
            left: blockRect.left,
            top: blockRect.top,
          }
        );

        return (
          siblingMeasured && {
            ...siblingMeasured,
            ...(siblingNow.voids !== undefined
              ? { voids: siblingNow.voids }
              : {}),
          }
        );
      });
      const placement = placeMark({
        copies,
        live: liveList,
        margins: {
          left: Number.POSITIVE_INFINITY,
          right: Number.POSITIVE_INFINITY,
        },
        mark,
        nearby: [],
      });

      if (placement.type !== 'ink') continue;
      ({ dx, dy } = placement);
      outlines = placement.strokes
        ? inkStrokeOutlinesPoints(mark.brush, placement.strokes)
        : [inkOutlinePoints(mark)];
    } else {
      const markBlock = mark.blocks.find(
        (block) => block.copy === passage.copy
      );

      if (!markBlock) continue;
      dx = -markBlock.left;
      dy = -markBlock.top;
      outlines = [inkOutlinePoints(mark)];
    }

    const nonEmpty = outlines.filter((poly) => poly.length > 0);

    if (nonEmpty.length === 0) continue;

    let mMinX = Number.POSITIVE_INFINITY;
    let mMinY = Number.POSITIVE_INFINITY;
    let mMaxX = Number.NEGATIVE_INFINITY;
    let mMaxY = Number.NEGATIVE_INFINITY;

    for (const outline of nonEmpty) {
      for (const [x, y] of outline) {
        const lx = x + dx;
        const ly = y + dy;

        mMinX = Math.min(mMinX, lx);
        mMinY = Math.min(mMinY, ly);
        mMaxX = Math.max(mMaxX, lx);
        mMaxY = Math.max(mMaxY, ly);
      }
    }

    includeBox(mMinX, mMinY, mMaxX - mMinX, mMaxY - mMinY);
    drawableMarks.push({
      bounds: [mMinX, mMinY, mMaxX, mMaxY],
      dx,
      dy,
      mark,
      outlines: nonEmpty,
    });
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return null;
  }

  const cropLeft = minX - CROP_PADDING;
  const cropTop = minY - CROP_PADDING;
  const cssWidth = Math.max(1, Math.ceil(maxX - minX + CROP_PADDING * 2));
  const cssHeight = Math.max(1, Math.ceil(maxY - minY + CROP_PADDING * 2));
  const longSide = Math.max(cssWidth, cssHeight);

  if (longSide > maxSide) return null;

  const scale: 1 | 2 = longSide * 2 <= maxSide ? 2 : 1;

  return {
    cropLeft,
    cropTop,
    doc,
    height: Math.round(cssHeight * scale),
    marks: drawableMarks,
    runs,
    scale,
    voids,
    width: Math.round(cssWidth * scale),
  };
};

const paintMarks = (
  ctx: CanvasRenderingContext2D,
  captured: CapturedPassage
) => {
  for (const { dx, dy, mark, outlines } of captured.marks) {
    const shiftX = dx - captured.cropLeft;
    const shiftY = dy - captured.cropTop;

    ctx.save();
    ctx.fillStyle = mark.brush.color;
    ctx.globalAlpha = mark.brush.opacity;
    for (const outline of outlines) {
      if (outline.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(outline[0][0] + shiftX, outline[0][1] + shiftY);
      for (let index = 1; index < outline.length; index += 1) {
        ctx.lineTo(outline[index][0] + shiftX, outline[index][1] + shiftY);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
};

const drawCapturedPassage = (
  captured: CapturedPassage
): InkPassageImages | null => {
  const makeCanvas = () => {
    const canvas = captured.doc.createElement('canvas');

    canvas.width = captured.width;
    canvas.height = captured.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, captured.width, captured.height);
    ctx.scale(captured.scale, captured.scale);

    return { canvas, ctx };
  };

  const alone = makeCanvas();
  const onText = makeCanvas();

  if (!alone || !onText) return null;

  paintMarks(alone.ctx, captured);

  onText.ctx.textBaseline = 'middle';
  for (const run of captured.runs) {
    const x = run.left - captured.cropLeft;
    const y = run.top - captured.cropTop;

    if (run.isVoid) {
      onText.ctx.fillStyle = VOID_PILL_COLOR;
      onText.ctx.fillRect(x, y, run.width, run.height);
    }
    onText.ctx.font = run.font;
    onText.ctx.fillStyle = INK_TEXT_COLOR;
    onText.ctx.fillText(run.text, x, y + run.height / 2);
  }
  paintMarks(onText.ctx, captured);

  const boxes: Record<
    string,
    readonly [left: number, top: number, right: number, bottom: number]
  > = {};

  for (const { bounds, mark } of captured.marks) {
    const [mMinX, mMinY, mMaxX, mMaxY] = bounds;

    boxes[mark.id] = [
      Math.max(0, Math.floor((mMinX - captured.cropLeft) * captured.scale)),
      Math.max(0, Math.floor((mMinY - captured.cropTop) * captured.scale)),
      Math.min(
        captured.width,
        Math.ceil((mMaxX - captured.cropLeft) * captured.scale)
      ),
      Math.min(
        captured.height,
        Math.ceil((mMaxY - captured.cropTop) * captured.scale)
      ),
    ];
  }

  return {
    boxes,
    inkAlone: alone.canvas.toDataURL('image/png'),
    inkOnText: onText.canvas.toDataURL('image/png'),
    voids: captured.voids,
  };
};

export const renderInkPassageImages = (
  view: Editor,
  passages: readonly InkPassage[],
  { maxSide }: InkImagesOptions
): Promise<ReadonlyArray<InkPassageImages | null>> => {
  const snapshots = passages.map((passage) =>
    capturePassage(view, passage, maxSide)
  );

  return Promise.resolve(
    snapshots.map((snapshot) =>
      snapshot ? drawCapturedPassage(snapshot) : null
    )
  );
};
