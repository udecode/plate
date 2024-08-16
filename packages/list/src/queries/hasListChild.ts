import { type PlateEditor, type TAncestor, match } from '@udecode/plate-common';

import { getListTypes } from './getListTypes';

/** Is there a list child in the node. */
export const hasListChild = (editor: PlateEditor, node: TAncestor) =>
  node.children.some((n) => match(n, [], { type: getListTypes(editor) }));
