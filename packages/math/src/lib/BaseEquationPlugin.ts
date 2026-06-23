import type { EditorUpdateTransaction } from '@platejs/slate';
import {
  type PluginConfig,
  type SlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import type { InsertEquationOptions } from './transforms';

import { createEquationNode } from './transforms';

import 'katex/dist/katex.min.css';

type EquationTx = {
  equation: {
    insert: (options?: InsertEquationOptions) => void;
  };
};

export type EquationConfig = PluginConfig<
  'equation',
  {},
  {},
  {},
  {},
  EquationTx
>;

export const BaseEquationPlugin: SlatePlugin<EquationConfig> =
  createTSlatePlugin<EquationConfig>({
    key: KEYS.equation,
    node: { isElement: true, isVoid: true },
  })
    .extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
      insert: (options?: InsertEquationOptions) => {
        tx.nodes.insert(createEquationNode(type), options);
      },
    }));
