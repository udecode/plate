import { getEditorTransformRegistry } from '../core/transform-registry';
import type { EditorStaticApi } from '../interfaces/editor';
import { Editor } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';

type BreakEditor = Parameters<EditorStaticApi['insertBreak']>[0];

export const insertParagraphAfterSelectedBlockVoid = (editor: BreakEditor) => {
  const selection = Editor.getSelection(editor);

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  const voidEntry = Editor.void(editor, {
    at: selection.anchor,
    mode: 'highest',
  });

  if (!voidEntry) {
    return false;
  }

  const [voidNode, voidPath] = voidEntry;

  if (Editor.isInline(editor, voidNode)) {
    return false;
  }

  getEditorTransformRegistry(editor).insertNodes(
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
