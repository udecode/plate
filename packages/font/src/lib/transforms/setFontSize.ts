import type { Editor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const setFontSize = (editor: Editor, fontSize: string): void => {
  editor.tf.addMarks({
    [KEYS.fontSize]: fontSize,
  });
};
