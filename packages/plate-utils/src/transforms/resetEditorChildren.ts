import {
  PlateEditor,
  replaceNodeChildren,
  ReplaceNodeChildrenOptions,
} from '@udecode/plate-core';
import { EElement, Value } from '@udecode/slate';

/**
 * Replace editor children by default block.
 */
export const resetEditorChildren = <V extends Value>(
  editor: PlateEditor<V>,
  options?: Omit<ReplaceNodeChildrenOptions<EElement<V>, V>, 'at' | 'nodes'>
) => {
  replaceNodeChildren<EElement<V>>(editor, {
    at: [],
    nodes: editor.childrenFactory(),
    ...options,
  } as any);
};
