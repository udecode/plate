import { type SlateEditor, setMarks } from '@udecode/plate-common';

import { BaseFontSizePlugin } from '../BaseFontSizePlugin';

export const setFontSize = (editor: SlateEditor, fontSize: string): void => {
  setMarks(editor, {
    [BaseFontSizePlugin.key]: fontSize,
  });
};
