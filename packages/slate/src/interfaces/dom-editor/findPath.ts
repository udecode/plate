import type { Path } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { FindPathOptions, TEditor } from '../editor';
import type { NodeOf } from '../node';

import { findNodePath } from '../../internal/queries/findNodePath';

export const findPath = <N extends NodeOf<E>, E extends TEditor>(
  editor: E,
  node: N,
  options?: FindPathOptions
): Path | undefined => {
  if (options) {
    return findNodePath(editor, node, options);
  }

  try {
    return DOMEditor.findPath(editor as any, node);
  } catch {
    return findNodePath(editor, node, options);
  }
};
