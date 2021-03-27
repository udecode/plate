import { match } from '@udecode/slate-plugins-common';
import { SPEditor } from '@udecode/slate-plugins-core';
import { Ancestor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (editor: SPEditor, node: Ancestor) =>
  node.children.some((n) => match(n, { type: getListTypes(editor) }));
