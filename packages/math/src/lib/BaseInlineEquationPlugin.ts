import type { EditorUpdateTransaction } from '@platejs/slate';
import {
  type PluginConfig,
  type SlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import type { InsertInlineEquationOptions } from './transforms';

import { createInlineEquationNode } from './transforms';

type InlineEquationTx = {
  inlineEquation: {
    insert: (
      texExpression?: string,
      options?: InsertInlineEquationOptions
    ) => void;
  };
};

export type InlineEquationConfig = PluginConfig<
  typeof KEYS.inlineEquation,
  {},
  {},
  {},
  {},
  InlineEquationTx
>;

export const BaseInlineEquationPlugin: SlatePlugin<InlineEquationConfig> =
  createTSlatePlugin<InlineEquationConfig>({
    key: KEYS.inlineEquation,
    node: { isElement: true, isInline: true, isVoid: true },
  })
    .extendTxGroup(
      'inlineEquation',
      ({ editor, type }) =>
        (tx: EditorUpdateTransaction) => ({
          insert: (
            texExpression?: string,
            options?: InsertInlineEquationOptions
          ) => {
            const expression =
              texExpression ?? editor.api.string(editor.selection) ?? '';

            tx.nodes.insert(
              createInlineEquationNode(type, expression),
              options
            );
          },
        })
    );
