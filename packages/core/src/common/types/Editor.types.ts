import { Location } from 'slate';
import { Value } from '../../slate/editor/TEditor';
import { EAncestor } from '../../slate/node/TAncestor';
import { ENode, TNode } from '../../slate/node/TNode';
import { Predicate } from '../queries/match';

export type ENodeMatch<N extends TNode> = Predicate<N>;

export interface ENodeMatchOptions<V extends Value> {
  match?: ENodeMatch<ENode<V>>;
  block?: boolean;
}

export interface EAncestorMatchOptions<V extends Value> {
  match?: ENodeMatch<EAncestor<V>>;
  block?: boolean;
}

export interface EditorNodesOptions<V extends Value>
  extends ENodeMatchOptions<V> {
  at?: Location;
  mode?: 'highest' | 'lowest' | 'all';
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
}
