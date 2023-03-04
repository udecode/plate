import {
  EElement,
  replaceNodeChildren,
  ReplaceNodeChildrenOptions,
  Value,
} from '@udecode/slate-utils';
import { PlateEditor } from '../../../core/src/types';

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
