import {
  createEditor,
  definePlatePlugin,
  type PlateElementProps,
} from 'platejs/react';
import { schema } from 'plitejs';

const FigurePlugin = definePlatePlugin('typedFigure', {
  schema: {
    element: {
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

declare const figureProps: PlateElementProps<typeof FigurePlugin>;

void figureProps.slots.contentRoot('caption');

// @ts-expect-error Live position is an explicit usePath subscription, not an element prop.
void figureProps.path;

// @ts-expect-error Content-root slot names are inferred from the element schema.
void figureProps.slots.contentRoot('notes');

const editor = createEditor({
  plugins: [FigurePlugin],
  initialValue: {
    children: [
      {
        childRoots: { caption: 'caption:1' },
        children: [{ text: '' }],
        type: 'typedFigure',
      },
    ],
    meta: { revision: 1 },
    roots: {
      'caption:1': [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
    },
  },
});
editor.read.schema.create(FigurePlugin);
