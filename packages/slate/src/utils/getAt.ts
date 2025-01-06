import isPlainObject from 'lodash/isPlainObject.js';

import { type Editor, type TNode, isNode } from '../interfaces';

export const getAt = <T>(
  editor: Editor,
  at?: T | TNode | null
): T | undefined => {
  if (at && isPlainObject(at) && isNode(at)) {
    return editor.api.findPath(at) as any;
  }

  return (at as T) ?? undefined;
};
