import { nanoid } from 'nanoid';

import type { PlateEditor } from '../editor/PlateEditor';

const EDITOR_TO_INSTANCE_KEY = new WeakMap<PlateEditor, string>();

export const getPlateEditorInstanceKey = (editor: PlateEditor): string => {
  let key = EDITOR_TO_INSTANCE_KEY.get(editor);

  if (!key) {
    key = nanoid();
    EDITOR_TO_INSTANCE_KEY.set(editor, key);
  }

  return key;
};
