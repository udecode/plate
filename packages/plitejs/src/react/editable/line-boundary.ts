import { NodeApi, PathApi, type Point } from '../..';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  isBlock as editorIsBlock,
  type Editor as RuntimeEditor,
} from './runtime-editor-api';

/**
 * The start or end of the text block holding `point`. A `unit: 'line'` step
 * from a point already on that edge lands in the neighboring block, so the
 * point stays.
 */
export const getLineBoundaryPoint = (
  editor: RuntimeEditor,
  point: Point,
  reverse: boolean
) => {
  const line = editorAbove(editor, {
    at: point,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  })?.[1];
  const target = reverse
    ? editorBefore(editor, point, { unit: 'line' })
    : editorAfter(editor, point, { unit: 'line' });

  return line && target && PathApi.isAncestor(line, target.path)
    ? target
    : point;
};
