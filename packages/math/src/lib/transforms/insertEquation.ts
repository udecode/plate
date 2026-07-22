import type {
  EditorTransactionSpecBuilder,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type { TEquationElement } from '@platejs/utils';

export type InsertEquationOptions = NodeInsertNodesOptions<TEquationElement>;

export const insertEquation = (
  tx: Pick<EditorTransactionSpecBuilder, 'nodes'>,
  type: string,
  options?: InsertEquationOptions
) => {
  tx.nodes.insert<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: '',
      type,
    },
    options
  );
};
