import {
  getEditorString,
  getPointBefore,
  getRange,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { BaseRange } from 'slate';
import { IEmojiTriggeringController } from './EmojiTriggeringController';

export const FindTheTriggeringInput = <V extends Value>(
  editor: PlateEditor<V>,
  emojiTriggeringController: IEmojiTriggeringController
) => (text = '') => {
  const selection = editor.selection as BaseRange;
  let currentText = text;

  let endPoint = selection.anchor;
  let beforePoint;
  let i = emojiTriggeringController.getOptions().maxTextToSearch;

  do {
    emojiTriggeringController.setText(currentText);
    if (emojiTriggeringController.hasTriggeringMark) break;

    beforePoint = getPointBefore(editor, endPoint, {
      unit: 'character',
      distance: 1,
    });

    const foundText = getEditorString(
      editor,
      getRange(editor, selection, beforePoint)
    );

    endPoint = beforePoint!;
    currentText = `${foundText}${text}`;

    if (/^\s/.test(foundText)) {
      emojiTriggeringController.reset();
      break;
    }
  } while (--i > 0);
};
