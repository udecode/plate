import { DOMEditor } from 'slate-dom';

import type { Path } from '../../interfaces';
import type { Editor, EditorFindPathOptions } from '../../interfaces/editor';
import type { NodeOf } from '../../interfaces/node';

import { findNodePath } from '../../internal/queries/findNodePath';

export const findPath = <N extends NodeOf<E>, E extends Editor>(
  editor: E,
  node: N,
  options?: EditorFindPathOptions
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
