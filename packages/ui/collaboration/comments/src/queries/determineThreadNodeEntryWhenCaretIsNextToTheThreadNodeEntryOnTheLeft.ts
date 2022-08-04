import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  TAncestor,
} from '@udecode/plate-core';
import { ELEMENT_THREAD, ThreadElement } from '@xolvio/plate-comments';
import { Editor, NodeEntry, Range } from 'slate';

export function determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft(
  editor: PlateEditor
): NodeEntry<ThreadElement & TAncestor> | undefined {
  let threadNodeEntry;
  if (editor.selection) {
    const type = getPluginType(editor, ELEMENT_THREAD);
    const firstPoint = Range.isBackward(editor.selection)
      ? editor.selection.focus
      : editor.selection.anchor;
    const secondPoint = Range.isBackward(editor.selection)
      ? editor.selection.anchor
      : editor.selection.focus;
    const threadNodeEntry1 = getAboveNode<ThreadElement & TAncestor>(editor, {
      at: Editor.after(editor as any, firstPoint, {
        distance: 1,
        unit: 'character',
      }),
      match: { type },
    });
    if (threadNodeEntry1) {
      const threadNodeEntry2 = getAboveNode<ThreadElement & TAncestor>(editor, {
        at: secondPoint,
        match: { type },
      });
      if (threadNodeEntry2 && threadNodeEntry1[0] === threadNodeEntry2[0]) {
        threadNodeEntry = threadNodeEntry1;
      }
    }
  }
  return threadNodeEntry;
}
