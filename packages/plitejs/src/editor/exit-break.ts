import { getEditorSchema } from '../core/editor-runtime';
import type { AnyEditor, EditorBreakExitOptions } from '../interfaces/editor';
import {
  above as editorAbove,
  getSelection as editorGetSelection,
  levels as editorLevels,
  parent as editorParent,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import {
  buildDefaultChild,
  insertDefaultChild,
  lastChildChain,
} from './insert-default-child';

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
    match: (node): node is Element =>
      NodeApi.isElement(node) && schema.isBlock(node),
    voids: true,
  });

  if (!block) return false;

  const [node, blockPath] = block;
  const landingAt = (path: Path) => (before ? path : PathApi.next(path));
  const ownsExit = (element: Element) =>
    schema.getElementBehavior(element).ownsExit;

  if (ownsExit(node) && (!match || match(node, blockPath))) {
    const at = landingAt(blockPath);
    const landing = buildDefaultChild(editor, at);

    if (landing && !lastChildChain(landing).some(ownsExit)) {
      return insertDefaultChild(editor, at, { block: landing });
    }
  }

  const landsInOwnType = (landing: Element, ancestor: Element) =>
    lastChildChain(landing).some(({ type }) => type === ancestor.type);
  const admitsTextBlock = (path: Path) => {
    const [parent] = editorParent(editor, path);

    if (!NodeApi.isElement(parent)) return false;

    const program = schema.getElementContent(parent.type);

    if (!program) return true;

    return [...(program.remainder ?? program).allowedElementTypes].some(
      (type) => schema.isElementTypeInGroup(type, 'textBlock')
    );
  };

  for (const [ancestor, path] of editorLevels(editor, {
    at: PathApi.parent(blockPath),
    reverse: true,
    voids: true,
  })) {
    if (!NodeApi.isElement(ancestor) || path.length === 0) continue;
    if (match && !match(ancestor, path)) continue;
    if (path.length === 1) return insertDefaultChild(editor, landingAt(path));
    if (!admitsTextBlock(path)) continue;

    const at = landingAt(path);
    const landing = buildDefaultChild(editor, at);

    if (landing && landsInOwnType(landing, ancestor)) continue;

    return insertDefaultChild(editor, at, { block: landing });
  }

  return insertDefaultChild(editor, landingAt(blockPath));
};
