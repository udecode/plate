import type { ElementOf } from '@udecode/slate';

import {
  type ReplaceNodeChildrenOptions,
  replaceNodeChildren,
} from '@udecode/slate-utils';

import type { PlateEditor } from '../editor';

/** Replace editor children by default block. */
export const resetEditorChildren = <E extends PlateEditor = PlateEditor>(
  editor: E,
  options?: Omit<ReplaceNodeChildrenOptions<ElementOf<E>, E>, 'at' | 'nodes'>
) => {
  replaceNodeChildren<ElementOf<E>>(editor, {
    at: [],
    nodes: editor.api.childrenFactory(),
    ...options,
  } as any);
};
