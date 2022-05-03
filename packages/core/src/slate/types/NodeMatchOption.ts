import { Value } from './TEditor';
import { ENode, TNodeMatch } from './TNode';

export interface NodeMatchOption<V extends Value> {
  match?: TNodeMatch<ENode<V>>;
}
