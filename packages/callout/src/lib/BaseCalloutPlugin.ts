import type { EditorUpdateTransaction } from '@platejs/plite';
import { type PluginConfig, createEditorPlugin, KEYS } from 'platejs';

import type { InsertCalloutOptions } from './transforms';

import { createCalloutNode } from './transforms';

type CalloutTx = {
  callout: {
    insert: (options?: InsertCalloutOptions) => void;
  };
};

export type CalloutConfig = PluginConfig<'callout', {}, {}, {}, {}, CalloutTx>;

export const BaseCalloutPlugin = createEditorPlugin<CalloutConfig>({
  key: KEYS.callout,
  node: {
    isElement: true,
  },
  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
}).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
  insert: ({ icon, variant, ...options }: InsertCalloutOptions = {}) => {
    tx.nodes.insert(createCalloutNode(type, { icon, variant }), options);
  },
}));
