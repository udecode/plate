import { schema } from '@platejs/plite';
import {
  createPlateEditor,
  createPlatePlugin,
  type PlateElementProps,
} from '@platejs/core/react';

const FigurePlugin = createPlatePlugin({
  key: 'typedFigure',
  schema: {
    element: {
      contentRoots: {
        caption: {
          content: schema.content.type('p', {
            default: { type: 'p' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
  type: 'figure',
});

declare const figureProps: PlateElementProps<typeof FigurePlugin>;

figureProps.slots.contentRoot('caption');

// @ts-expect-error Content-root slot names are inferred from the element schema.
figureProps.slots.contentRoot('notes');

const editor = createPlateEditor({
  nodeId: false,
  plugins: [FigurePlugin],
  initialValue: {
    children: [
      {
        childRoots: { caption: 'caption:1' },
        children: [{ text: '' }],
        type: 'figure',
      },
    ],
    meta: { revision: 1 },
    roots: {
      'caption:1': [{ children: [{ text: 'Caption' }], type: 'p' }],
    },
  },
});
const captionRoot: string =
  editor.read.schema.createAndFill(FigurePlugin).childRoots.caption;

void captionRoot;
