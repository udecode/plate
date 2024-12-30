import { type LeafEdge, Editor } from 'slate';

import type { At } from '../../types';
import type { NodeOf } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export type GetNodeEntryOptions = {
  depth?: number;
  edge?: LeafEdge;
};

export const getNodeEntry = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  at: At,
  options?: GetNodeEntryOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.node(editor as any, getAt(editor, at)!, options) as any;
  } catch (error) {}
};
