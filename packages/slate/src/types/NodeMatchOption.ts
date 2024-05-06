import type { Value } from '../interfaces/editor/TEditor';
import type { ENode, TNodeMatch } from '../interfaces/node/TNode';

export interface NodeMatchOption<V extends Value> {
  match?: TNodeMatch<ENode<V>>;
}
