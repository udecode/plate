import {
  getMarks,
  getPluginOptions,
  isSelectionExpanded,
  PlateEditor,
} from '@udecode/plate-common';

import { KEY_MARK_AFFINITY } from './createMarkAffinityPlugin';
import { getMarkBoundary } from './queries/getMarkBoundary';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { setMarkBoundaryAffinity } from './transforms/setMarkBoundaryAffinity';
import { MarkAffinityPlugin } from './types';

export const withMarkAffinity = (editor: PlateEditor) => {
  const { deleteBackward, move } = editor;

  /**
   * On backspace, if the deletion results in the cursor being at a mark
   * boundary, then the affinity should be forward. If the deletion removes
   * a character from the left mark, then the affinity should be backward.
   */
  editor.deleteBackward = (unit) => {
    if (
      unit === 'character' &&
      editor.selection &&
      !isSelectionExpanded(editor)
    ) {
      const [leftMarkEntryBefore] = getMarkBoundary(editor) ?? [null];
      const removingFromLeftMark =
        leftMarkEntryBefore && leftMarkEntryBefore[0].text.length > 1;

      deleteBackward(unit);

      const afterMarkBoundary = getMarkBoundary(editor);

      if (afterMarkBoundary) {
        setMarkBoundaryAffinity(
          editor,
          afterMarkBoundary,
          removingFromLeftMark ? 'backward' : 'forward'
        );
      }
      return;
    }

    deleteBackward(unit);
  };

  editor.move = (options) => {
    const { unit = 'character', distance = 1, reverse = false } = options || {};
    if (
      unit === 'character' &&
      distance === 1 &&
      editor.selection &&
      !isSelectionExpanded(editor)
    ) {
      const { validMarks } = getPluginOptions<MarkAffinityPlugin>(
        editor,
        KEY_MARK_AFFINITY
      );

      const _marks = getMarks(editor);
      const marks = _marks ? Object.keys(_marks) : [];

      //TODO: note the comment_x
      if (!validMarks) return move(options);
      if (marks.length > 0) {
        for (const mark of marks) {
          if (!validMarks.includes(mark)) return move(options);
        }
      }

      const beforeMarkBoundary = getMarkBoundary(editor);

      /**
       * If the cursor is at the start or end of a list of text nodes
       * then moving outside the mark should set the
       * affinity accordingly.
       */
      if (
        beforeMarkBoundary &&
        beforeMarkBoundary[reverse ? 0 : 1] === null &&
        getMarkBoundaryAffinity(editor, beforeMarkBoundary) ===
          (reverse ? 'forward' : 'backward')
      ) {
        setMarkBoundaryAffinity(
          editor,
          beforeMarkBoundary,
          reverse ? 'backward' : 'forward'
        );
        return;
      }

      move(options);

      const afterMarkBoundary = getMarkBoundary(editor);

      /**
       * If the move places the cursor at a mark boundary, then the affinity
       * should be set to the direction the cursor came from.
       */
      if (afterMarkBoundary) {
        setMarkBoundaryAffinity(
          editor,
          afterMarkBoundary,
          reverse ? 'forward' : 'backward'
        );
      }
      return;
    }

    move(options);
  };

  return editor;
};
