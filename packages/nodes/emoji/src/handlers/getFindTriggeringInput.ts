import {
  getEditorString,
  getPointBefore,
  getRange,
  isCollapsed,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { BasePoint } from 'slate';
import { IEmojiTriggeringController } from '../utils';

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

export const getFindTriggeringInput = <V extends Value>(
  editor: PlateEditor<V>,
  emojiTriggeringController: IEmojiTriggeringController
) => (char = '') => {
  const { selection } = editor;

  if (!selection || !isCollapsed(selection) || isSpaceBreak(char)) {
    emojiTriggeringController.setIsTriggering(false);
    return;
  }

  const startPoint = selection.anchor;
  let currentPoint: undefined | BasePoint = startPoint;
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

  emojiTriggeringController.setText(foundText);
};
