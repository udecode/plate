import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type { TEquationElement } from '@platejs/utils';

export type InsertEquationOptions = NodeInsertNodesOptions<TEquationElement>;

export const insertEquation = (
  tx: EditorUpdateTransaction,
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
