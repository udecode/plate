import { TEditor, Value } from './TEditor';
import { NodeOf, TNodeMatch } from './TNode';

export interface NodeMatchOption<V extends Value> {
  match?: TNodeMatch<NodeOf<TEditor<V>>>;
}
