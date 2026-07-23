import {
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
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

type PlaceholderContract = PluginConfig<
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

const defaultOptions: PlaceholderContract['options'] = {};

export type PlaceholderRule = {
  mediaType: string;
};

export const BasePlaceholderPlugin = createBasePlugin({
  key: KEYS.placeholder,
  options: defaultOptions,
  schema: {
    element: {
      properties: {
        mediaType: property.string(),
      },
      void: 'block',
    },
  },
}).extendTx(
  ({ type }) =>
    (tx) =>
      ({
        audioPlaceholder: (options) =>
          insertAudioPlaceholder(tx, type, options),
        filePlaceholder: (options) => insertFilePlaceholder(tx, type, options),
        imagePlaceholder: (options) =>
          insertImagePlaceholder(tx, type, options),
        videoPlaceholder: (options) =>
          insertVideoPlaceholder(tx, type, options),
      }) satisfies PlaceholderContract['tx']['placeholder']
);

export type PlaceholderConfig = InferConfig<typeof BasePlaceholderPlugin>;
