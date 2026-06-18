import type { EditorStaticApi } from '../interfaces/editor';
import { NORMALIZING } from '../utils/weak-maps';

export const setNormalizing: EditorStaticApi['setNormalizing'] = (
  editor,
  isNormalizing
) => {
  NORMALIZING.set(editor, isNormalizing);
};
