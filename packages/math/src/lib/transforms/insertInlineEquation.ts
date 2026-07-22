import type {
  EditorTransactionSpecBuilder,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type { TEquationElement } from '@platejs/utils';

export type InsertInlineEquationOptions =
  NodeInsertNodesOptions<TEquationElement> & {
    texExpression?: string;
  };

export const insertInlineEquation = (
  tx: Pick<EditorTransactionSpecBuilder, 'nodes' | 'text'>,
  type: string,
  { texExpression, ...options }: InsertInlineEquationOptions = {}
) => {
  tx.nodes.insert<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? tx.text.string(),
      type,
    },
    options
  );
};
