import { isEditorNodeSelectable } from '../core/editor-read-execution';
import { getEditorSchema } from '../core/editor-runtime';
import {
  type AnyEditor as Editor,
  above as editorAbove,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';

export type Reach = 'caret' | 'content' | 'structural';

export const isSkippedElement = (
  editor: Editor,
  node: unknown,
  path: Path,
  reach: Reach,
  origin?: Point
) =>
  reach !== 'structural' &&
  NodeApi.isElement(node) &&
  !isEditorNodeSelectable(editor, node) &&
  (reach === 'caret' ||
    (!getEditorSchema(editor).isInline(node) &&
      (!origin || !PathApi.isAncestor(path, origin.path))));

export const skippedAbove = (
  editor: Editor,
  location: Path | Point,
  reach: Reach,
  origin?: Point
) => {
  if (reach === 'structural') return undefined;

  return editorAbove(editor, {
    at: location,
    match: (node, path) => isSkippedElement(editor, node, path, reach, origin),
    mode: 'highest',
    voids: true,
  });
};

export const skipsPoint = (
  editor: Editor,
  point: Point,
  reach: Reach,
  origin?: Point
) => !!skippedAbove(editor, point, reach, origin);
