import { getEditorOperationRoot } from '../core/public-state';
import { Editor, type EditorStaticApi } from '../interfaces/editor';
import type { PathRef } from '../interfaces/path-ref';
import { setPathRefRoot } from '../internal/root-location';

export const pathRef: EditorStaticApi['pathRef'] = (
  editor,
  path,
  options = {}
) => {
  const { affinity = 'forward', root = getEditorOperationRoot(editor) } =
    options;
  const ref: PathRef = {
    current: path,
    affinity,
    unref() {
      const { current } = ref;
      const pathRefs = Editor.pathRefs(editor);
      pathRefs.delete(ref);
      ref.current = null;
      return current;
    },
  };
  setPathRefRoot(ref, root);

  const refs = Editor.pathRefs(editor);
  refs.add(ref);
  return ref;
};
