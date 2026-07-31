import { createBasePlugin } from '@platejs/core';
import {
  ElementApi,
  type NodeInsertNodesOptions,
  property,
  schema,
} from '@platejs/plite';
import { KEYS, type TCalloutElement } from '@platejs/utils';

export type InsertCalloutOptions = NodeInsertNodesOptions<TCalloutElement> & {
  icon?: string;
  variant?: TCalloutElement['variant'];
};

export const BaseCalloutPlugin = createBasePlugin({
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'callout',
        kind: 'node',
        decode: ({
          decode,
          decoration,
          registry,
          isInline,
          node,
          parseAttributes,
          type,
        }) => {
          const props = parseAttributes(node.attributes);
          const children = decode(node.children, decoration);
          const paragraph = children.length === 1 ? children[0] : undefined;

          if (
            children.some(
              (child) => ElementApi.isElement(child) && !isInline(child)
            ) &&
            (!ElementApi.isElement(paragraph) ||
              paragraph.type !== registry.getType(KEYS.p))
          ) {
            throw new Error(
              'Callout children must be inline Markdown content.'
            );
          }

          return {
            children:
              ElementApi.isElement(paragraph) &&
              paragraph.type === registry.getType(KEYS.p)
                ? paragraph.children
                : children,
            type,
            ...props,
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
            name: 'callout',
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
  name: KEYS.callout,
  schema: {
    element: schema.element.textBlock({
      properties: {
        backgroundColor: property.string(),
        icon: property.string(),
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
  update: ({ tx, type }) => ({
    insert: ({ icon, variant, ...options }: InsertCalloutOptions = {}) => {
      tx.nodes.insert<TCalloutElement>(
        {
          children: [{ text: '' }],
          icon: icon ?? '💡',
          type,
          ...(variant === undefined ? {} : { variant }),
        },
        options
      );
    },
  }),
});
