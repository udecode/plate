import { match, PlateEditor, TAncestor, Value } from '@udecode/plate-common/server';

import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = <V extends Value>(
  editor: PlateEditor<V>,
  node: TAncestor
) => node.children.some((n) => match(n, [], { type: getListTypes(editor) }));
