import type { EditorUpdateTransaction } from '@platejs/plite';
import {
  type PluginConfig,
  type EditorPlugin,
  createEditorPlugin,
  KEYS,
} from 'platejs';

import {
  type InsertPlaceholderOptions,
  createPlaceholderNode,
} from './transforms';

export type MediaPlaceholderOptions = {
  rules?: PlaceholderRule[];
};

type PlaceholderTx = {
  placeholder: {
    insert: (mediaType: string, options?: InsertPlaceholderOptions) => void;
  };
};

export type PlaceholderConfig = PluginConfig<
  typeof KEYS.placeholder,
  MediaPlaceholderOptions,
  {},
  {},
  {},
  PlaceholderTx
>;

export type PlaceholderRule = {
  mediaType: string;
};

export const BasePlaceholderPlugin: EditorPlugin<PlaceholderConfig> =
  createEditorPlugin<PlaceholderConfig>({
    key: KEYS.placeholder,
    node: { isElement: true, isVoid: true },
  }).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
    insert: (mediaType: string, options?: InsertPlaceholderOptions) => {
      tx.nodes.insert(createPlaceholderNode(type, mediaType), options);
    },
  }));
