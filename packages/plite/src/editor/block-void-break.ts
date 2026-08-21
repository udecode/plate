import { getEditorRuntimeRoot, getEditorSchema } from '../core/editor-runtime';
import { toPublicRoot } from '../core/public-root';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  isInline as editorIsInline,
  void as editorVoid,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { insertNodes } from '../transforms-node/insert-nodes';

type BreakEditor = Parameters<EditorStaticApi['insertBreak']>[0];

export const insertDefaultBlockAfterSelectedBlockVoid = (
  editor: BreakEditor
) => {
  const selection = editorGetSelection(editor);

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  const voidEntry = editorVoid(editor, {
    at: selection.anchor,
    mode: 'highest',
  });

  if (!voidEntry) {
    return false;
  }

  const [voidNode, voidPath] = voidEntry;

  if (editorIsInline(editor, voidNode)) {
    return false;
  }

  const defaultChild = getEditorSchema(editor).createDefaultRootChild(
    toPublicRoot(getEditorRuntimeRoot(editor))
  );

  if (!ElementApi.isElement(defaultChild)) return false;

  insertNodes(editor, defaultChild, {
    at: PathApi.next(voidPath),
    select: true,
    voids: true,
  });

  return true;
};
