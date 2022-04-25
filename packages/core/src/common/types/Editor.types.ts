import { Location } from 'slate';
import { AncestorOf } from '../../types/slate/TAncestor';
import { TEditor, Value } from '../../types/slate/TEditor';
import { NodeOf, TNode } from '../../types/slate/TNode';
import { Predicate } from '../queries/match';

export type ENodeMatch<N extends TNode> = Predicate<N>;

export interface ENodeMatchOptions<V extends Value> {
  match?: ENodeMatch<NodeOf<TEditor<V>>>;
  block?: boolean;
}

export interface EAncestorMatchOptions<V extends Value> {
  match?: ENodeMatch<AncestorOf<TEditor<V>>>;
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
