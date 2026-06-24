import type { EditorStaticApi } from '../interfaces/editor';
import { NORMALIZING } from '../utils/weak-maps';

export const isNormalizing: EditorStaticApi['isNormalizing'] = (editor) => {
  const isNormalizing = NORMALIZING.get(editor);
  return isNormalizing === undefined ? true : isNormalizing;
};
