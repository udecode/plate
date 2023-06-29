import { TNode, Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';
import { DOMNode } from 'slate-react/dist/utils/dom';

import { TReactEditor } from '../types/TReactEditor';

/**
 * {@link ReactEditor.toSlateNode}
 */
export const toSlateNode = <V extends Value>(
  editor: TReactEditor<V>,
  domNode: DOMNode
) => {
  try {
    return ReactEditor.toSlateNode(editor as any, domNode) as TNode;
  } catch (error) {}
};
