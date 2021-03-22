import { match } from '@udecode/slate-plugins-common';
import { Ancestor, Editor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (editor: Editor, node: Ancestor) =>
  node.children.some((n) => match(n, { type: getListTypes(editor) }));
