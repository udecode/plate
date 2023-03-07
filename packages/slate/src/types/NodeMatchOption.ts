import { Value } from '../interfaces/editor/TEditor';
import { ENode, TNodeMatch } from '../interfaces/node/TNode';

export interface NodeMatchOption<V extends Value> {
  match?: TNodeMatch<ENode<V>>;
}
