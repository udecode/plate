import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  UnwrapNodesOptions,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_LINK } from '../createLinkPlugin';

/**
 * Unwrap link node.
 */
export const unwrapLink = <V extends Value>(
  editor: PlateEditor<V>,
  options?: UnwrapNodesOptions
) => {
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_LINK) },
    ...options,
  });
};
