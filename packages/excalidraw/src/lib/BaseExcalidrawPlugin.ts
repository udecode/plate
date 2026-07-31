import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';

import { createBasePlugin } from '@platejs/core';
import {
  type Element,
  type NodeInsertNodesOptions,
  type NodeProps,
  property,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type ExcalidrawDataState = ImportedDataState;

export interface TExcalidrawElement extends Element {
  data?: {
    elements: ExcalidrawDataState['elements'];
    state: ExcalidrawDataState['appState'];
  } | null;
  width?: string;
}

type ExcalidrawElementData = Exclude<TExcalidrawElement['data'], undefined>;

/** Enables support for Excalidraw drawing tool within a Slate document */
export const BaseExcalidrawPlugin = createBasePlugin({
  name: KEYS.excalidraw,
  schema: {
    element: {
      properties: {
        data: property.json({
          validate: (value): value is ExcalidrawElementData =>
            value === null ||
            (typeof value === 'object' &&
              !Array.isArray(value) &&
              value !== null &&
              'elements' in value &&
              Array.isArray(value.elements) &&
              'state' in value &&
              typeof value.state === 'object' &&
              !Array.isArray(value.state) &&
              value.state !== null),
          validationVersion: 1,
        }),
        width: property.string(),
      },
      void: 'block',
    },
  },
  update: ({ tx, type }) => ({
    insert: (
      props: NodeProps<TExcalidrawElement> = {},
      options: NodeInsertNodesOptions<TExcalidrawElement> = {}
    ) => {
      if (!tx.selection() && options.at === undefined) return;

      tx.blocks.insertAfter<TExcalidrawElement>(
        {
          children: [{ text: '' }],
          type,
          ...props,
        },
        options
      );
    },
  }),
});
