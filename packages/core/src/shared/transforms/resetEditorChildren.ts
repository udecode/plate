import { EElement, Value } from '@udecode/slate';
import {
  replaceNodeChildren,
  ReplaceNodeChildrenOptions,
} from '@udecode/slate-utils';

import { PlateEditor } from '../types/index';

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
