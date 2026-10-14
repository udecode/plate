import { getEditorSchema } from '../core/editor-runtime';
import { getActiveUpdateRoot } from '../core/public-state';
import type { AnyEditor, EditorBreakExitOptions } from '../interfaces/editor';
import {
  above as editorAbove,
  getSelection as editorGetSelection,
  parent as editorParent,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { insertDefaultChild } from './insert-default-child';

export const exitBreak = (
  editor: AnyEditor,
  { before = false, match }: EditorBreakExitOptions = {}
) => {
  const selection = editorGetSelection(editor);

  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
    return false;
  }

  const schema = getEditorSchema(editor);
  const block = editorAbove(editor, {
    at: selection.anchor,
    match: (node) => NodeApi.isElement(node) && schema.isBlock(node),
    voids: true,
  });

  if (!block) return false;

  const bodyPlan =
    block[1].length > 2
      ? schema.getRootContent(getActiveUpdateRoot(editor))?.defaultPlan
      : null;
  const bodyType = bodyPlan?.kind === 'element' ? bodyPlan.type : null;
  const parentHoldsBody = (path: Path) => {
    const [parent] = editorParent(editor, path);

    return (
      bodyType !== null &&
      NodeApi.isElement(parent) &&
      schema.canContain(parent, bodyType)
    );
  };
  const structure = editorAbove(editor, {
    at: block[1],
    match: (node, path) => {
      if (!NodeApi.isElement(node) || path.length === 0) return false;
      if (match && !match(node, path)) return false;

      return path.length === 1 || parentHoldsBody(path);
    },
    voids: true,
  });
  const path = structure?.[1] ?? block[1];

  return insertDefaultChild(editor, before ? path : PathApi.next(path));
};
