import { Location } from 'slate';
import { EAncestor } from '../../slate/types/TAncestor';
import { Value } from '../../slate/types/TEditor';
import { ENode, TNode } from '../../slate/types/TNode';
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

export interface EditorParentOptions {
  depth?: number | undefined;
  edge?: 'start' | 'end' | undefined;
}
