import type { TNode, Value } from '@udecode/slate';
import type { DOMNode } from 'slate-react/dist/utils/dom';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toSlateNode} */
export const toSlateNode = <V extends Value>(
  editor: TReactEditor<V>,
  domNode: DOMNode
) => {
  try {
    return ReactEditor.toSlateNode(editor as any, domNode) as TNode;
  } catch (error) {}
};
