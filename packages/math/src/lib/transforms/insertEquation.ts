import type {
  NodeInsertNodesOptions,
  BasePlateEditor,
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
  editor: BasePlateEditor,
  options?: InsertEquationOptions
) => {
  editor.update((tx) => {
    tx.nodes.insert(createEquationNode(editor.getType(KEYS.equation)), options);
  });
};
