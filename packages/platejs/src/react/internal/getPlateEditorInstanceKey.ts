import { nanoid } from 'nanoid';

import type { EditorReference } from '../editor/Editor';

const EDITOR_TO_INSTANCE_KEY = new WeakMap<EditorReference, string>();

export const getPlateEditorInstanceKey = (editor: EditorReference): string => {
  let key = EDITOR_TO_INSTANCE_KEY.get(editor);

  if (!key) {
    key = nanoid();
    EDITOR_TO_INSTANCE_KEY.set(editor, key);
  }

  return key;
};
