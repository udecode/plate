import type { Modify } from '@udecode/utils';

import { type NodeTextsOptions as SlateNodeTextsOptions, Node } from 'slate';

import type { TextOf } from '../text/TText';
import type { NodeOf, TNode } from './TNode';
import type { TNodeEntry } from './TNodeEntry';

export type NodeTextsOptions<
  N extends TextOf<R>,
  R extends TNode = TNode,
> = Modify<
  NonNullable<SlateNodeTextsOptions>,
  {
    pass?: (entry: TNodeEntry<NodeOf<N>>) => boolean;
  }
>;

/** Return a generator of all leaf text nodes in a root node. */
export const getNodeTexts = <N extends TextOf<R>, R extends TNode = TNode>(
  root: R,
  options?: NodeTextsOptions<N, R>
) =>
  Node.texts(root, options as any) as Generator<TNodeEntry<N>, void, undefined>;
