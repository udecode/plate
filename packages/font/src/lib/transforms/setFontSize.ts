import type { Editor } from '@udecode/plate';

import { BaseFontSizePlugin } from '../BaseFontSizePlugin';

export const setFontSize = (editor: Editor, fontSize: string): void => {
  editor.tf.addMarks({
    [BaseFontSizePlugin.key]: fontSize,
  });
};
