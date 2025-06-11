import type { SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const getListTypes = (editor: SlateEditor) => {
  return [editor.getType(KEYS.olClassic), editor.getType(KEYS.ulClassic)];
};
