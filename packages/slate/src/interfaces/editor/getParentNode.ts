import { type LeafEdge, parent } from 'slate';

import type { At } from '../../types';
import type { AncestorOf } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export type GetParentNodeOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export const getParentNode = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  at: At,
  options?: GetParentNodeOptions
): TNodeEntry<N> | undefined => {
  try {
    return parent(editor as any, getAt(editor, at)!, options) as any;
  } catch (error) {}
};
