import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  isInline as editorIsInline,
  void as editorVoid,
} from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { insertDefaultChild } from './insert-default-child';

type BreakEditor = Parameters<EditorStaticApi['insertBreak']>[0];

export const breakAtSelectedBlockVoid = (editor: BreakEditor) => {
  const selection = editorGetSelection(editor);

  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
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

  insertDefaultChild(editor, PathApi.next(voidPath), { voids: true });

  return true;
};
