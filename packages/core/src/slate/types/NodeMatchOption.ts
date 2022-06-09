import { Value } from '../editor/TEditor';
import { ENode, TNodeMatch } from '../node/TNode';

export interface NodeMatchOption<V extends Value> {
  match?: TNodeMatch<ENode<V>>;
}
