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

export const getFindTriggeringInput =
  <V extends Value>(
    editor: PlateEditor<V>,
    emojiTriggeringController: IEmojiTriggeringController
  ) =>
  (text = '') => {
    const selection = editor.selection as BaseRange;
    const startPoint = editor.selection as BaseRange;
    let currentText = text;

    let endPoint = selection.anchor;
    let nextPoint;
    let repeat = emojiTriggeringController.getOptions().maxTextToSearch;

    do {
      if (!endPoint) break;

      emojiTriggeringController.setText(currentText);
      if (emojiTriggeringController.hasTriggeringMark) break;

      nextPoint = getNextPoint(editor, endPoint);
      const foundText = getFoundText(editor, startPoint, nextPoint);

      endPoint = nextPoint!;
      currentText = `${foundText}${text}`;

      if (isBreakingCharInText(currentText)) {
        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;
      }
    } while (--repeat > 0);
  };
