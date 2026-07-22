import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  isInline as editorIsInline,
  void as editorVoid,
} from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { insertNodes } from '../transforms-node/insert-nodes';
import { RangeApi } from '../interfaces/range';

type BreakEditor = Parameters<EditorStaticApi['insertBreak']>[0];

export const insertParagraphAfterSelectedBlockVoid = (editor: BreakEditor) => {
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

  insertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      at: PathApi.next(voidPath),
      select: true,
      voids: true,
    }
  );

  return true;
};
