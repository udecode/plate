import { type InferConfig, createBasePlugin } from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { BaseAudioPlugin } from '../BaseAudioPlugin';
import { BaseFilePlugin } from '../BaseFilePlugin';
import { BaseVideoPlugin } from '../BaseVideoPlugin';
import { BaseImagePlugin } from '../image/BaseImagePlugin';

export type MediaPlaceholderOptions = {
  rules?: PlaceholderRule[];
};

export type PlaceholderRule = {
  mediaType: string;
};

export const BasePlaceholderPlugin = createBasePlugin({
  dependencies: [
    BaseAudioPlugin,
    BaseFilePlugin,
    BaseImagePlugin,
    BaseVideoPlugin,
  ],
  key: KEYS.placeholder,
  options: {} as MediaPlaceholderOptions,
  schema: {
    element: {
      properties: {
        mediaType: property.string(),
      },
      void: 'block',
    },
  },
}).extendTx<{
  insert: (
    mediaType: string,
    options?: NodeInsertNodesOptions<TPlaceholderElement>
  ) => void;
}>(({ type }) => (tx) => ({
  insert: (mediaType, options) =>
    tx.nodes.insert<TPlaceholderElement>(
      {
        children: [{ text: '' }],
        mediaType,
        type,
      },
      options
    ),
}));

export type PlaceholderConfig = InferConfig<typeof BasePlaceholderPlugin>;
