import { DeserializeNode } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';

export interface GetNodeDeserializerRule {
  /**
   * Required node names to deserialize the element.
   * Set '*' to allow any node name.
   */
  nodeNames?: string | string[];

  /**
   * Required className to deserialized the element.
   */
  className?: string;

  /**
   * Required style to deserialize the element. Each value should be a (list of) string.
   */
  style?: Partial<
    Record<keyof CSSStyleDeclaration, string | string[] | undefined>
  >;

  /**
   * Required attribute name or name + value
   */
  attribute?: string | { [key: string]: string | string[] };
}

export interface GetNodeDeserializerOptions {
  type: string;

  /**
   * Slate node creator from HTML element.
   */
  node: (el: HTMLElement) => { [key: string]: any } | undefined;

  /**
   * List of html attributes to store with the node
   */
  attributes?: string[];

  /**
   * List of rules the element needs to follow to be deserialized to a slate node.
   */
  rules: GetNodeDeserializerRule[];

  /**
   * Whether or not to include deserialized children on this node
   */
  withoutChildren?: boolean;
}

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const getNodeDeserializer = ({
  type,
  node,
  attributes,
  rules,
  withoutChildren,
}: GetNodeDeserializerOptions) => {
  const deserializers: DeserializeNode[] = [];

  rules.forEach(({ nodeNames = '*', style, className, attribute }) => {
    nodeNames = castArray<string>(nodeNames);

    nodeNames.forEach((nodeName) => {
      deserializers.push({
        type,
        withoutChildren,
        deserialize: (el) => {
          if (
            nodeNames.length &&
            !nodeNames.includes(el.nodeName) &&
            nodeName !== '*'
          )
            return;

          if (className && !el.classList.contains(className)) return;

          if (style) {
            for (const [key, value] of Object.entries(style)) {
              const values = castArray<string>(value);

              if (!values.includes(el.style[key])) return;
            }
          }

          if (attribute) {
            if (typeof attribute === 'string') {
              if (!el.getAttributeNames().includes(attribute)) return;
            } else {
              for (const [key, value] of Object.entries(attribute)) {
                const values = castArray<string>(value);
                const attr = el.getAttribute(key);

                if (!attr || !values.includes(attr)) return;
              }
            }
          }

          const htmlAttributes = {};
          if (attributes) {
            const attributeNames = el.getAttributeNames();
            for (const attr of attributes) {
              if (attributeNames.includes(attr))
                htmlAttributes[attr] = el.getAttribute(attr);
            }
          }

          const slateNode = node(el);
          if (slateNode && Object.keys(htmlAttributes).length)
            slateNode.attributes = htmlAttributes;
          return slateNode;
        },
      });
    });
  });

  return deserializers;
};
