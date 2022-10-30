import { EElement, Value } from '../slate/index';
import { PlateEditor } from '../types/index';
import {
  replaceNodeChildren,
  ReplaceNodeChildrenOptions,
} from './replaceNodeChildren';

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
