import {
  type Node,
  NodeApi,
  type NodeEntry,
  PathApi,
  type Point,
  type Range,
} from '../..';
import { ReactEditor } from '../plugin/react-editor';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  isBlock as editorIsBlock,
  positions as editorPositions,
  range as editorRange,
  type Editor as RuntimeEditor,
} from './runtime-editor-api';

const isBlockElement = (editor: RuntimeEditor, node: Node) =>
  NodeApi.isElement(node) && editorIsBlock(editor, node);

const blockAbove = (editor: RuntimeEditor, at: Point) =>
  editorAbove(editor, {
    at,
    match: (node) => isBlockElement(editor, node),
  });

const getLineBreakPoint = (
  [block, blockPath]: NodeEntry,
  point: Point,
  reverse: boolean
): Point | null => {
  for (const [{ text }, relativePath] of NodeApi.texts(block, { reverse })) {
    const path = [...blockPath, ...relativePath];
    const order = PathApi.compare(path, point.path);

    if (reverse ? order > 0 : order < 0) continue;

    const index = reverse
      ? text.slice(0, order === 0 ? point.offset : undefined).lastIndexOf('\n')
      : text.indexOf('\n', order === 0 ? point.offset : 0);

    if (index !== -1) {
      return { offset: reverse ? index + 1 : index, path };
    }
  }

  return null;
};

export const getInnerLineRange = (
  editor: RuntimeEditor,
  block: NodeEntry,
  point: Point
): Range | null => {
  const pointBlock = blockAbove(editor, point);

  if (!pointBlock || !PathApi.equals(pointBlock[1], block[1])) return null;

  const start = getLineBreakPoint(block, point, true);
  const end = getLineBreakPoint(block, point, false);

  if (!start && !end) return null;

  const blockRange = editorRange(editor, block[1]);

  return {
    anchor: start ?? blockRange.anchor,
    focus: end ?? blockRange.focus,
  };
};

export const getLineBoundaryPoint = (
  editor: RuntimeEditor,
  point: Point,
  reverse: boolean
) => {
  const block = blockAbove(editor, point);

  if (!block) return point;

  const lineBreak = getLineBreakPoint(block, point, reverse);

  if (lineBreak) return lineBreak;

  const target = reverse
    ? editorBefore(editor, point, { unit: 'line' })
    : editorAfter(editor, point, { unit: 'line' });

  // From the block's edge, a `unit: 'line'` step lands in the next block.
  return target && PathApi.isAncestor(block[1], target.path) ? target : point;
};

const isOnLine = (rect: DOMRect | null, line: DOMRect) => {
  if (!rect) return false;

  const lineMiddle = (line.top + line.bottom) / 2;
  const rectMiddle = (rect.top + rect.bottom) / 2;

  return (
    rect.top <= lineMiddle &&
    rect.bottom >= lineMiddle &&
    line.top <= rectMiddle &&
    line.bottom >= rectMiddle
  );
};

export const getRenderedLineStart = (
  editor: RuntimeEditor,
  point: Point
): Point => {
  const lineStart = getLineBoundaryPoint(editor, point, true);
  const points = Array.from(
    editorPositions(editor, { at: { anchor: lineStart, focus: point } })
  );
  const characterRect = (index: number) =>
    ReactEditor.resolveRangeRect(editor, {
      anchor: points[index],
      focus: points[index + 1],
    });
  const last = points.length - 2;
  const caretLineRect = last >= 0 ? characterRect(last) : null;

  if (!caretLineRect) return lineStart;

  let low = 0;
  let high = last;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (isOnLine(characterRect(middle), caretLineRect)) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return points[low];
};

export const getLineBoundarySelection = (
  editor: RuntimeEditor,
  selection: Range,
  { extend, reverse }: { extend: boolean; reverse: boolean }
): Range => {
  const focus = getLineBoundaryPoint(editor, selection.focus, reverse);

  return { anchor: extend ? selection.anchor : focus, focus };
};
