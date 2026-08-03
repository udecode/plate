import { nanoid } from 'nanoid';

import type { PlateEditorReference } from '../editor/PlateEditor';

const EDITOR_TO_INSTANCE_KEY = new WeakMap<PlateEditorReference, string>();

export const getPlateEditorInstanceKey = (
  editor: PlateEditorReference
): string => {
  let key = EDITOR_TO_INSTANCE_KEY.get(editor);

  if (!key) {
    key = nanoid();
    EDITOR_TO_INSTANCE_KEY.set(editor, key);
  }

  return key;
};
