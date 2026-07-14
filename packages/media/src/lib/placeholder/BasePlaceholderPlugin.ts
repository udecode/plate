import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertVideoPlaceholder,
} from './transforms';

export type MediaPlaceholderOptions = {
  rules?: PlaceholderRule[];
};

export type PlaceholderConfig = PluginConfig<
  'placeholder',
  MediaPlaceholderOptions,
  {},
  {
    placeholder: {
      audioPlaceholder: (
        options?: NodeInsertNodesOptions<TPlaceholderElement>
      ) => void;
      filePlaceholder: (
        options?: NodeInsertNodesOptions<TPlaceholderElement>
      ) => void;
      imagePlaceholder: (
        options?: NodeInsertNodesOptions<TPlaceholderElement>
      ) => void;
      videoPlaceholder: (
        options?: NodeInsertNodesOptions<TPlaceholderElement>
      ) => void;
    };
  }
>;

export type PlaceholderRule = {
  mediaType: string;
};

export const BasePlaceholderPlugin = createBasePlugin<PlaceholderConfig>({
  key: KEYS.placeholder,
  node: { isElement: true, isVoid: true },
}).extendTx(({ type }) => (tx) => ({
  audioPlaceholder: (options?: NodeInsertNodesOptions<TPlaceholderElement>) =>
    insertAudioPlaceholder(tx, type, options),
  filePlaceholder: (options?: NodeInsertNodesOptions<TPlaceholderElement>) =>
    insertFilePlaceholder(tx, type, options),
  imagePlaceholder: (options?: NodeInsertNodesOptions<TPlaceholderElement>) =>
    insertImagePlaceholder(tx, type, options),
  videoPlaceholder: (options?: NodeInsertNodesOptions<TPlaceholderElement>) =>
    insertVideoPlaceholder(tx, type, options),
}));
