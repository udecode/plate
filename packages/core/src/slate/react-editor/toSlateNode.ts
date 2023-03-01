import { ReactEditor } from 'slate-react';
import { DOMNode } from 'slate-react/dist/utils/dom';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TNode } from '../../../../slate-utils/src/slate/node/TNode';
import { TReactEditor } from './TReactEditor';

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
