import type { EElement, ValueOf } from '@udecode/slate';

import {
  type ReplaceNodeChildrenOptions,
  replaceNodeChildren,
} from '@udecode/slate-utils';

import type { PlateEditor } from '../types/index';

/** Replace editor children by default block. */
export const resetEditorChildren = <E extends PlateEditor = PlateEditor>(
  editor: E,
  options?: Omit<
    ReplaceNodeChildrenOptions<EElement<ValueOf<E>>, ValueOf<E>>,
    'at' | 'nodes'
  >
) => {
  replaceNodeChildren<EElement<ValueOf<E>>>(editor, {
    at: [],
    nodes: editor.childrenFactory(),
    ...options,
  } as any);
};
