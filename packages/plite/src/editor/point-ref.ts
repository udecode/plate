import { getEditorOperationRoot } from '../core/public-state';
import { pointRefs as editorPointRefs } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import type { PointRef } from '../interfaces/point-ref';
import { getPointRoot, setPointRefRootMeta } from '../internal/root-location';

export const pointRef: EditorStaticApi['pointRef'] = (
  editor,
  point,
  options = {}
) => {
  const { affinity = 'forward' } = options;
  const rootMeta = getPointRoot(point, getEditorOperationRoot(editor));
  const ref: PointRef = {
    current: point,
    affinity,
    unref() {
      const { current } = ref;
      const pointRefs = editorPointRefs(editor);
      pointRefs.delete(ref);
      ref.current = null;
      return current;
    },
  };

  setPointRefRootMeta(ref, rootMeta);

  const refs = editorPointRefs(editor);
  refs.add(ref);
  return ref;
};
