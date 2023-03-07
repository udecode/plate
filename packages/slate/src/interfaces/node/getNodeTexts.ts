import { Node, NodeTextsOptions } from 'slate';
import { Modify } from '../../../../utils/src/types/types';
import { TextOf } from '../text/TText';
import { NodeOf, TNode } from './TNode';
import { TNodeEntry } from './TNodeEntry';

/**
 * Return a generator of all leaf text nodes in a root node.
 */
export const getNodeTexts = <N extends TextOf<R>, R extends TNode = TNode>(
  root: R,
  options?: Modify<
    NonNullable<NodeTextsOptions>,
    {
      pass?: (entry: TNodeEntry<NodeOf<N>>) => boolean;
    }
  >
) =>
  Node.texts(root, options as any) as Generator<TNodeEntry<N>, void, undefined>;
