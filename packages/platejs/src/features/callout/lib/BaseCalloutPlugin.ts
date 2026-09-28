import {
  definePlugin,
  ElementApi,
  type ElementOf,
  property,
  schema,
  PLUGINS,
} from '../../../core';

const DEFAULT_CALLOUT_ICON = '💡';

export const BaseCalloutPlugin = definePlugin(PLUGINS.callout, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children }) => children,
      },
      markdown: {
        tag: type,
        decode: ({
          decode,
          marks,
          isInline,
          node,
          readTagAttributes,
          refuse,
        }) => {
          const props = readTagAttributes().properties;
          const paragraph =
            node.children.length === 1 && node.children[0]?.type === 'paragraph'
              ? node.children[0]
              : undefined;
          const content = decode(
            paragraph ? paragraph.children : node.children,
            marks
          );

          if (
            content.some(
              (child) => ElementApi.isElement(child) && !isInline(child)
            )
          ) {
            return refuse('Callout children must be inline Markdown content.');
          }

          return {
            ...props,
            children: content,
            icon:
              typeof props.icon === 'string'
                ? props.icon
                : DEFAULT_CALLOUT_ICON,
            type,
          };
        },
        encode: ({ encodeAttributes, encodePhrasing, node }) => {
          const { children, type: _, ...rest } = node;

          return {
            attributes: encodeAttributes(rest),
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
        icon: property.string({
          default: DEFAULT_CALLOUT_ICON,
          omitDefault: false,
        }),
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
