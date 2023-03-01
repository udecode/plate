import { ReactEditor } from 'slate-react';
import { DOMNode } from 'slate-react/dist/utils/dom';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if a DOM node is within the editor.
 */
export const hasEditorDOMNode = <V extends Value>(
  editor: TReactEditor<V>,
  target: DOMNode,
  options?: Parameters<typeof ReactEditor.hasDOMNode>[2]
) => {
  try {
    return ReactEditor.hasDOMNode(editor as any, target, options);
  } catch (e) {}

  return false;
};
