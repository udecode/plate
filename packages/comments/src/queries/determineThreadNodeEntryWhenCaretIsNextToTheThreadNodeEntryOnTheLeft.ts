import {
  getAboveNode,
  getPluginType,
  getPointAfter,
  PlateEditor,
} from '@udecode/plate-core';
import { Range } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { TThreadElement } from '../types';

export const determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft = (
  editor: PlateEditor
) => {
  let threadNodeEntry;

  if (editor.selection) {
    const type = getPluginType(editor, ELEMENT_THREAD);
    const firstPoint = Range.isBackward(editor.selection)
      ? editor.selection.focus
      : editor.selection.anchor;
    const secondPoint = Range.isBackward(editor.selection)
      ? editor.selection.anchor
      : editor.selection.focus;
    const threadNodeEntry1 = getAboveNode<TThreadElement>(editor, {
      at: getPointAfter(editor, firstPoint, {
        distance: 1,
        unit: 'character',
      }),
      match: { type },
    });

    if (threadNodeEntry1) {
      const threadNodeEntry2 = getAboveNode<TThreadElement>(editor, {
        at: secondPoint,
        match: { type },
      });

      if (threadNodeEntry2 && threadNodeEntry1[0] === threadNodeEntry2[0]) {
        threadNodeEntry = threadNodeEntry1;
      }
    }
  }

  return threadNodeEntry;
};
