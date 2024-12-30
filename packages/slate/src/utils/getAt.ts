import { type TEditor, type TNode, isNode } from '../interfaces';

export const getAt = <T>(
  editor: TEditor,
  at?: T | TNode | null
): T | undefined => {
  if (at && isNode(at)) {
    return editor.findPath(at) as any;
  }

  return at ?? undefined;
};
