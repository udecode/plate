import {
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
  type Editor as RuntimeEditor,
} from './runtime-editor-api';

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

export const getLineBoundaryPoint = (
  editor: RuntimeEditor,
  point: Point,
  reverse: boolean
) => {
  const block = editorAbove(editor, {
    at: point,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });

  if (!block) return point;

  const lineBreak = getLineBreakPoint(block, point, reverse);

  if (lineBreak) return lineBreak;

  const target = reverse
    ? editorBefore(editor, point, { unit: 'line' })
    : editorAfter(editor, point, { unit: 'line' });

  // From the block's edge, a `unit: 'line'` step lands in the next block.
  return target && PathApi.isAncestor(block[1], target.path) ? target : point;
};

export const getLineBoundarySelection = (
  editor: RuntimeEditor,
  selection: Range,
  { extend, reverse }: { extend: boolean; reverse: boolean }
): Range => ({
  anchor: extend
    ? selection.anchor
    : getLineBoundaryPoint(editor, selection.anchor, reverse),
  focus: getLineBoundaryPoint(editor, selection.focus, reverse),
});
