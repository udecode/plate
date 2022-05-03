import { ReactEditor } from 'slate-react';
import { DOMNode } from 'slate-react/dist/utils/dom';
import { Value } from '../types/TEditor';
import { TNode } from '../types/TNode';
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
  } catch (e) {}
};
