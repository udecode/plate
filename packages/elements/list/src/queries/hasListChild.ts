import { match } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { Ancestor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (editor: SPEditor, node: Ancestor) =>
  node.children.some((n) => match(n, { type: getListTypes(editor) }));
