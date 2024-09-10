import type { TEditor } from '../interfaces';
import type { NodeOf, TNodeMatch } from '../interfaces/node/TNode';

export interface NodeMatchOption<E extends TEditor> {
  match?: TNodeMatch<NodeOf<E>>;
}
