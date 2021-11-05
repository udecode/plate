import { match } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { Ancestor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (editor: PlateEditor, node: Ancestor) =>
  node.children.some((n) => match(n, { type: getListTypes(editor) }));
