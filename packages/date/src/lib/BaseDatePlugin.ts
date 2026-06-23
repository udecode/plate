import type { EditorUpdateTransaction } from '@platejs/plite';
import {
  type PluginConfig,
  type EditorPlugin,
  createEditorPlugin,
  KEYS,
} from 'platejs';

import type { InsertDateOptions } from './transforms';

import { createDateNodes } from './transforms';

type DateTx = {
  date: {
    insert: (options?: InsertDateOptions) => void;
  };
};

export type DateConfig = PluginConfig<typeof KEYS.date, {}, {}, {}, {}, DateTx>;

export const BaseDatePlugin: EditorPlugin<DateConfig> =
  createEditorPlugin<DateConfig>({
    key: KEYS.date,
    node: {
      isElement: true,
      isInline: true,
      isVoid: true,
    },
  }).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
    insert: ({ date, ...options }: InsertDateOptions = {}) => {
      tx.nodes.insert(createDateNodes(type, date), options);
    },
  }));
