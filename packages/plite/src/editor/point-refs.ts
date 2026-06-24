import type { EditorStaticApi } from '../interfaces/editor';
import { POINT_REFS } from '../utils/weak-maps';

export const pointRefs: EditorStaticApi['pointRefs'] = (editor) => {
  let refs = POINT_REFS.get(editor);

  if (!refs) {
    refs = new Set();
    POINT_REFS.set(editor, refs);
  }

  return refs;
};
