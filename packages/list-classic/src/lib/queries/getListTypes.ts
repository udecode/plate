import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export const getListTypes = (editor: SlateEditor) => {
  return [editor.getType(KEYS.olClassic), editor.getType(KEYS.ulClassic), editor.getType(KEYS.checklist)];
};
