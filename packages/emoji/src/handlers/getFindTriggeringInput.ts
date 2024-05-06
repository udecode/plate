import type { BasePoint } from 'slate';

import {
  type PlateEditor,
  type Value,
  getEditorString,
  getPointBefore,
  getRange,
  isCollapsed,
} from '@udecode/plate-common/server';

import type { FindTriggeringInputProps } from '../types';
import type { IEmojiTriggeringController } from '../utils/index';

const isSpaceBreak = (char?: string) => !!char && /\s/.test(char);

const getPreviousChar = <V extends Value>(
  editor: PlateEditor<V>,
  point?: BasePoint
) =>
  point
    ? getEditorString(
        editor,
        getRange(editor, point, getPointBefore(editor, point))
      )
    : undefined;

const getPreviousPoint = <V extends Value>(
  editor: PlateEditor<V>,
  point?: BasePoint
) => (point ? getPointBefore(editor, point) : undefined);

const isBeginningOfTheLine = <V extends Value>(
  editor: PlateEditor<V>,
  point?: BasePoint
) => {
  const previousPoint = getPreviousPoint(editor, point);

  return point?.path[0] !== previousPoint?.path[0];
};

export const getFindTriggeringInput =
  <V extends Value>(
    editor: PlateEditor<V>,
    emojiTriggeringController: IEmojiTriggeringController
  ) =>
  ({ action = 'insert', char = '' }: FindTriggeringInputProps = {}) => {
    const { selection } = editor;

    if (!selection || !isCollapsed(selection) || isSpaceBreak(char)) {
      emojiTriggeringController.setIsTriggering(false);

      return;
    }

    const startPoint = selection.anchor;
    let currentPoint: BasePoint | undefined = startPoint;
    let previousPoint;

    let foundText = char;
    let previousChar;

    do {
      previousChar = getPreviousChar(editor, currentPoint);
      foundText = previousChar + foundText;
      previousPoint = getPreviousPoint(editor, currentPoint);

      if (isBeginningOfTheLine(editor, currentPoint)) {
        break;
      }

      currentPoint = previousPoint;
    } while (!isSpaceBreak(previousChar));

    foundText = foundText.trim();

    if (action === 'delete') foundText = foundText.slice(0, -1);

    emojiTriggeringController.setText(foundText);
  };
