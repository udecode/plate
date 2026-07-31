import { createBasePlugin } from '@platejs/core';
import {
  type Element,
  type NodeInsertNodesOptions,
  type NodeProps,
  property,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export const CODE_DRAWING_TYPE = {
  PlantUml: 'PlantUml',
  Graphviz: 'Graphviz',
  Flowchart: 'Flowchart',
  Mermaid: 'Mermaid',
} as const;

export const CODE_DRAWING_TYPE_ARRAY = [
  {
    value: CODE_DRAWING_TYPE.PlantUml,
    label: CODE_DRAWING_TYPE.PlantUml,
  },
  {
    value: CODE_DRAWING_TYPE.Graphviz,
    label: CODE_DRAWING_TYPE.Graphviz,
  },
  {
    value: CODE_DRAWING_TYPE.Flowchart,
    label: CODE_DRAWING_TYPE.Flowchart,
  },
  {
    value: CODE_DRAWING_TYPE.Mermaid,
    label: CODE_DRAWING_TYPE.Mermaid,
  },
] as const;

export type CodeDrawingType =
  (typeof CODE_DRAWING_TYPE)[keyof typeof CODE_DRAWING_TYPE];

export const VIEW_MODE = {
  Both: 'Both',
  Code: 'Code',
  Image: 'Image',
} as const;

export const VIEW_MODE_ARRAY = [
  {
    value: VIEW_MODE.Both,
    label: VIEW_MODE.Both,
  },
  {
    value: VIEW_MODE.Code,
    label: VIEW_MODE.Code,
  },
  {
    value: VIEW_MODE.Image,
    label: VIEW_MODE.Image,
  },
] as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const DEFAULT_MIN_HEIGHT = 300;
export const RENDER_DEBOUNCE_DELAY = 500;
export const DOWNLOAD_FILENAME = 'code-drawing.png';

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
  name: KEYS.codeDrawing,
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
