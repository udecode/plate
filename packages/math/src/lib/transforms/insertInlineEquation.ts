import type {
  NodeInsertNodesOptions,
  SlateEditor,
  TEquationElement,
} from 'platejs';

import { KEYS } from 'platejs';

export type InsertInlineEquationOptions =
  NodeInsertNodesOptions<TEquationElement>;

export const createInlineEquationNode = (
  type: string,
  texExpression: string
): TEquationElement => ({
  children: [{ text: '' }],
  texExpression,
  type,
});

export const insertInlineEquation = (
  editor: SlateEditor,
  texExpression?: string,
  options?: InsertInlineEquationOptions
) => {
  editor.update((tx) => {
    tx.nodes.insert(
      createInlineEquationNode(
        editor.getType(KEYS.inlineEquation),
        texExpression ?? editor.api.string(editor.selection)
      ),
      options
    );
  });
};
