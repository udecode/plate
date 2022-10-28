import { TElement, Value } from '../slate/index';
import { PlateEditor } from '../types/index';
import { replaceNodeChildren } from './replaceNodeChildren';

/**
 * Replace editor children by default block.
 */
export const resetEditorChildren = <V extends Value>(
  editor: PlateEditor<V>
) => {
  replaceNodeChildren<TElement>(editor, {
    at: [],
    nodes: editor.childrenFactory(),
  });
};
