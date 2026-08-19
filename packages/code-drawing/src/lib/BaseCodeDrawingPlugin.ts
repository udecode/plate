import { defineBasePlugin } from '@platejs/core';
import { type ElementOf, property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export const CODE_DRAWING_LANGUAGES = [
  'flowchart',
  'graphviz',
  'mermaid',
  'plantuml',
] as const;

export type CodeDrawingLanguage = (typeof CODE_DRAWING_LANGUAGES)[number];

export const CODE_DRAWING_VIEWS = ['code', 'preview', 'split'] as const;

export type CodeDrawingView = (typeof CODE_DRAWING_VIEWS)[number];

export const DEFAULT_MIN_HEIGHT = 300;
export const RENDER_DEBOUNCE_DELAY = 500;
export const DOWNLOAD_FILENAME = 'code-drawing.png';

/** Enables support for PlantUML, Graphviz, Flowchart, and Mermaid drawings. */
export const BaseCodeDrawingPlugin = defineBasePlugin(PLUGINS.codeDrawing, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ node, parseAttributes }) => ({
          ...parseAttributes(node.attributes),
          children: [{ text: '' }],
          type,
        }),
        encode: ({ node, propsToAttributes }) => {
          const { children: _, type: __, ...props } = node;

          return {
            attributes: propsToAttributes(props),
            children: [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
  schema: {
    element: {
      properties: {
        code: property.string({ default: '', omitDefault: false }),
        language: property.enum(CODE_DRAWING_LANGUAGES, {
          default: 'mermaid',
          omitDefault: false,
        }),
        view: property.enum(CODE_DRAWING_VIEWS, {
          default: 'split',
          omitDefault: false,
        }),
      },
      void: 'block',
    },
  },
});

export type CodeDrawingElement = ElementOf<typeof BaseCodeDrawingPlugin>;
