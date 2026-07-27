import { createBasePlugin } from '@platejs/core';
import {
  type Element,
  type NodeInsertNodesOptions,
  type NodeProps,
  property,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import {
  type CodeDrawingType,
  CODE_DRAWING_TYPE_ARRAY,
  type ViewMode,
  VIEW_MODE_ARRAY,
} from './constants';

export type CodeDrawingData = {
  code?: string;
  drawingMode?: ViewMode;
  drawingType?: CodeDrawingType;
};

export interface TCodeDrawingElement extends Element {
  data?: CodeDrawingData;
}

/** Enables support for PlantUML, Graphviz, Flowchart, and Mermaid drawings. */
export const BaseCodeDrawingPlugin = createBasePlugin({
  key: KEYS.codeDrawing,
  schema: {
    element: {
      properties: {
        data: property.json({
          validate: (value): value is CodeDrawingData => {
            if (
              typeof value !== 'object' ||
              value === null ||
              Array.isArray(value)
            ) {
              return false;
            }

            return (
              (!('code' in value) || typeof value.code === 'string') &&
              (!('drawingMode' in value) ||
                VIEW_MODE_ARRAY.some(
                  ({ value: mode }) => mode === value.drawingMode
                )) &&
              (!('drawingType' in value) ||
                CODE_DRAWING_TYPE_ARRAY.some(
                  ({ value: type }) => type === value.drawingType
                ))
            );
          },
          validationVersion: 1,
        }),
      },
      void: 'block',
    },
  },
  type: NODES.codeDrawing,
  update: ({ tx, type }) => ({
    insert: (
      props: NodeProps<TCodeDrawingElement> = {},
      options: NodeInsertNodesOptions<TCodeDrawingElement> = {}
    ) => {
      const { data, ...restProps } = props;

      tx.blocks.insertAfter<TCodeDrawingElement>(
        {
          children: [{ text: '' }],
          type,
          data: {
            code: '',
            drawingMode: 'Both',
            drawingType: 'Mermaid',
            ...(data ?? {}),
          },
          ...restProps,
        },
        options
      );
    },
  }),
});
