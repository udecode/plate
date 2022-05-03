import { match, PlateEditor, Value } from '@udecode/plate-core';
import { Ancestor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = <V extends Value>(
  editor: PlateEditor<V>,
  node: Ancestor
) => node.children.some((n) => match(n, { type: getListTypes(editor) }));
