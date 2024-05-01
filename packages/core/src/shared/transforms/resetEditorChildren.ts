import type { EElement, Value } from '@udecode/slate';

import {
  type ReplaceNodeChildrenOptions,
  replaceNodeChildren,
} from '@udecode/slate-utils';

import type { PlateEditor } from '../types/index';

/** Replace editor children by default block. */
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
