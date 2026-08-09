import { defineBasePlugin } from '@platejs/core';
import { ElementApi, type ElementOf, property, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export const BaseCalloutPlugin = defineBasePlugin(PLUGINS.callout, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ decode, decoration, isInline, node, parseAttributes }) => {
          const props = parseAttributes(node.attributes);
          const paragraph =
            node.children.length === 1 && node.children[0]?.type === 'paragraph'
              ? node.children[0]
              : undefined;
          const content = decode(
            paragraph ? paragraph.children : node.children,
            decoration
          );

          if (
            content.some(
              (child) => ElementApi.isElement(child) && !isInline(child)
            )
          ) {
            throw new Error(
              'Callout children must be inline Markdown content.'
            );
          }

          return {
            ...props,
            children: content,
            type,
          };
        },
        encode: ({ encodePhrasing, node, propsToAttributes }) => {
          const { children, type: _, ...rest } = node;

          return {
            attributes: propsToAttributes(rest),
            children: [
              {
                children: encodePhrasing(children),
                type: 'paragraph',
              },
            ],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
  schema: {
    element: schema.element.textBlock({
      properties: {
        backgroundColor: property.string(),
        icon: property.string({ default: '💡', omitDefault: false }),
        variant: property.string(),
      },
    }),
  },

  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
});

export type CalloutElement = ElementOf<typeof BaseCalloutPlugin>;
