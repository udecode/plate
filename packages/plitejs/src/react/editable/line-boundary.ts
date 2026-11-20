import {
  type Node,
  NodeApi,
  type NodeEntry,
  PathApi,
  type Point,
  type Range,
} from '../..';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  isBlock as editorIsBlock,
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

const getInnerLineEdge = (
  editor: RuntimeEditor,
  [block, blockPath]: NodeEntry,
  point: Point,
  reverse: boolean
): Point | null => {
  let runEdge: Point = point;

  for (const [{ text }, relativePath] of NodeApi.texts(block, { reverse })) {
    const path = [...blockPath, ...relativePath];
    const order = PathApi.compare(path, point.path);

    if (reverse ? order > 0 : order < 0) continue;
    if (isBlockElement(editor, NodeApi.get(block, relativePath.slice(0, 1)))) {
      return runEdge;
    }

    const index = reverse
      ? text.slice(0, order === 0 ? point.offset : undefined).lastIndexOf('\n')
      : text.indexOf('\n', order === 0 ? point.offset : 0);

    if (index !== -1) {
      return { offset: reverse ? index + 1 : index, path };
    }

    runEdge = { offset: reverse ? 0 : text.length, path };
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

  const start = getInnerLineEdge(editor, block, point, true);
  const end = getInnerLineEdge(editor, block, point, false);

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

  const lineEdge = getInnerLineEdge(editor, block, point, reverse);

  if (lineEdge) return lineEdge;

  const target = reverse
    ? editorBefore(editor, point, { unit: 'line' })
    : editorAfter(editor, point, { unit: 'line' });
  const targetBlock = target && blockAbove(editor, target);

  // From the line's edge, a `unit: 'line'` step lands in the next block, or in
  // a block nested in this one.
  return target && targetBlock && PathApi.equals(targetBlock[1], block[1])
    ? target
    : point;
};

export const getLineBoundarySelection = (
  editor: RuntimeEditor,
  selection: Range,
  { extend, reverse }: { extend: boolean; reverse: boolean }
): Range => {
  const focus = getLineBoundaryPoint(editor, selection.focus, reverse);

  return { anchor: extend ? selection.anchor : focus, focus };
};
