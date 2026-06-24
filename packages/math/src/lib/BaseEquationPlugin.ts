import type { EditorUpdateTransaction } from '@platejs/plite';
import {
  type PluginConfig,
  type EditorPlugin,
  createEditorPlugin,
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

export const BaseEquationPlugin: EditorPlugin<EquationConfig> =
  createEditorPlugin<EquationConfig>({
    key: KEYS.equation,
    node: { isElement: true, isVoid: true },
  }).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
    insert: (options?: InsertEquationOptions) => {
      tx.nodes.insert(createEquationNode(type), options);
    },
  }));
