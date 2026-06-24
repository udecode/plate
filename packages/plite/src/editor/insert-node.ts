import { getEditorTransformRegistry } from '../core/transform-registry';
import type { EditorStaticApi } from '../interfaces/editor';

export const insertNode: EditorStaticApi['insertNode'] = (
  editor,
  node,
  options
) => {
  getEditorTransformRegistry(editor).insertNodes(node, options);
};
