/**
 * Utilities for single-line deletion
 */

import { type Range, RangeApi } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { DOMEditor } from '../plugin/dom-editor';

const doRectsIntersect = (rect: DOMRect, compareRect: DOMRect) => {
  const middle = (compareRect.top + compareRect.bottom) / 2;

  return rect.top <= middle && rect.bottom >= middle;
};

const areRangesSameLine = (
  editor: DOMEditor<any>,
  range1: Range,
  range2: Range
) => {
  const rect1 = DOMEditor.resolveRangeRect(editor, range1);
  const rect2 = DOMEditor.resolveRangeRect(editor, range2);

  if (!rect1 || !rect2) {
    return false;
  }

  return doRectsIntersect(rect1, rect2) && doRectsIntersect(rect2, rect1);
};

/**
 * A helper utility that returns the end portion of a `Range`
 * which is located on a single line.
 *
 * @param {Editor<any>} editor The editor object to compare against
 * @param {Range} parentRange The parent range to compare against
 * @returns {Range} A valid portion of the parentRange which is one a single line
 */
export const findCurrentLineRange = (
  editor: DOMEditor<any>,
  parentRange: Range
): Range => {
  const parentRangeBoundary = Editor.range(editor, RangeApi.end(parentRange));
  const positions = Array.from(Editor.positions(editor, { at: parentRange }));

  let left = 0;
  let right = positions.length;
  let middle = Math.floor(right / 2);

  if (
    areRangesSameLine(
      editor,
      Editor.range(editor, positions[left]),
      parentRangeBoundary
    )
  ) {
    return Editor.range(editor, positions[left], parentRangeBoundary);
  }

  if (positions.length < 2) {
    return Editor.range(editor, positions.at(-1)!, parentRangeBoundary);
  }

  while (middle !== positions.length && middle !== left) {
    if (
      areRangesSameLine(
        editor,
        Editor.range(editor, positions[middle]),
        parentRangeBoundary
      )
    ) {
      right = middle;
    } else {
      left = middle;
    }

    middle = Math.floor((left + right) / 2);
  }

  return Editor.range(editor, positions[left], parentRangeBoundary);
};
