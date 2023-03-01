import { EElement, Value } from '../../../slate-utils/src/slate';
import {
  replaceNodeChildren,
  ReplaceNodeChildrenOptions,
} from '../../../slate-utils/src/transforms/replaceNodeChildren';
import { PlateEditor } from '../types';

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
