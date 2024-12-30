import isPlainObject from 'lodash/isPlainObject.js';

import { type TEditor, type TNode, isNode } from '../interfaces';

export const getAt = <T>(
  editor: TEditor,
  at?: T | TNode | null
): T | undefined => {
  if (at && isPlainObject(at) && isNode(at)) {
    return editor.findPath(at) as any;
  }

  return (at as T) ?? undefined;
};
