import type {
  NodeInsertNodesOptions,
  SlateEditor,
  TEquationElement,
} from 'platejs';

import { KEYS } from 'platejs';

export type InsertEquationOptions = NodeInsertNodesOptions<TEquationElement>;

export const createEquationNode = (type: string): TEquationElement => ({
  children: [{ text: '' }],
  texExpression: '',
  type,
});

export const insertEquation = (
  editor: SlateEditor,
  options?: InsertEquationOptions
) => {
  editor.update((tx) => {
    tx.nodes.insert(createEquationNode(editor.getType(KEYS.equation)), options);
  });
};
