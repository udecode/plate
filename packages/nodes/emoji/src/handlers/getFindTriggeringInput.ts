import { comboboxActions } from '@udecode/plate-combobox';
import {
  getEditorString,
  getPointBefore,
  getRange,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { BasePoint, BaseRange } from 'slate';
import { IEmojiTriggeringController } from '../utils';

const getNextPoint = <V extends Value>(
  editor: PlateEditor<V>,
  endPoint: BasePoint
) =>
  getPointBefore(editor, endPoint, {
    unit: 'character',
    distance: 1,
  });

const getFoundText = <V extends Value>(
  editor: PlateEditor<V>,
  start: BaseRange,
  end?: BasePoint
) => getEditorString(editor, getRange(editor, start, end));

const isBreakingCharInText = (text: string) => /\s/.test(text);
const isNextCharacterInSameLine = (
  firstPoint: BasePoint,
  secondPoint?: BasePoint
) => firstPoint?.path[0] === secondPoint?.path[0];

export const getFindTriggeringInput = <V extends Value>(
  editor: PlateEditor<V>,
  emojiTriggeringController: IEmojiTriggeringController
) => (text = '') => {
  let currentText = text;
  const selection = editor.selection as BaseRange;
  const startRange = editor.selection as BaseRange;
  const startPoint = startRange.anchor;

  let endPoint = selection.anchor;
  let nextPoint;
  let repeat = emojiTriggeringController.getOptions().maxTextToSearch;

  do {
    if (!endPoint) break;

    emojiTriggeringController.setText(currentText);
    if (emojiTriggeringController.hasTriggeringMark) break;

    nextPoint = getNextPoint(editor, endPoint);

    if (!isNextCharacterInSameLine(startPoint, nextPoint)) {
      emojiTriggeringController.reset();
      break;
    }

    const foundText = getFoundText(editor, startRange, nextPoint);

    endPoint = nextPoint!;
    currentText = `${foundText}${text}`;

    if (isBreakingCharInText(currentText)) {
      emojiTriggeringController.reset();
      comboboxActions.reset();
      break;
    }
  } while (--repeat > 0);
};
