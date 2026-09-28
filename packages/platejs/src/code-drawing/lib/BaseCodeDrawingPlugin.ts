import { definePlugin, type ElementOf, property, PLUGINS } from '../../core';

export const CODE_DRAWING_LANGUAGES = [
  'flowchart',
  'graphviz',
  'mermaid',
  'plantuml',
] as const;

export type CodeDrawingLanguage = (typeof CODE_DRAWING_LANGUAGES)[number];

export const CODE_DRAWING_VIEWS = ['code', 'preview', 'split'] as const;

export type CodeDrawingView = (typeof CODE_DRAWING_VIEWS)[number];

/** Enables support for PlantUML, Graphviz, Flowchart, and Mermaid drawings. */
export const BaseCodeDrawingPlugin = definePlugin(PLUGINS.codeDrawing, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: {
        tag: type,
        decode: ({ readTagAttributes }) => ({
          ...readTagAttributes().properties,
          children: [{ text: '' }],
          type,
        }),
        encode: ({ encodeAttributes, node }) => {
          const { children: _, type: __, ...props } = node;

          return {
            attributes: encodeAttributes(props),
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
