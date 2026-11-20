import { isEditorNodeSelectable } from '../core/editor-read-execution';
import { getEditorSchema } from '../core/editor-runtime';
import {
  type AnyEditor as Editor,
  above as editorAbove,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';

export type Reach = 'caret' | 'content';

export const skippedAbove = (editor: Editor, point: Point, reach: Reach) =>
  editorAbove(editor, {
    at: point,
    match: (node) =>
      NodeApi.isElement(node) &&
      !isEditorNodeSelectable(editor, node) &&
      (reach === 'caret' || !getEditorSchema(editor).isInline(node)),
    mode: 'highest',
    voids: true,
  });

export const skipsPoint = (editor: Editor, point: Point, reach: Reach) =>
  !!skippedAbove(editor, point, reach);
