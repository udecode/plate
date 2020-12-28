import castArray from "lodash/castArray";
import { DeserializeNode } from "../../../core/src";

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

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
}

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const getNodeDeserializer = ({
  type,
  node,
  attributes,
  rules,
}: GetNodeDeserializerOptions) => {
  const deserializers: DeserializeNode[] = [];

  rules.forEach(({ nodeNames = "*", style, className }) => {
    nodeNames = castArray<string>(nodeNames);

    nodeNames.forEach((nodeName) => {
      deserializers.push({
        type,
        deserialize: (el) => {
          if (
            nodeNames.length &&
            !nodeNames.includes(el.nodeName) &&
            nodeName !== "*"
          )
            return;

          if (className && !el.classList.contains(className)) return;

          if (style) {
            for (const [key, value] of Object.entries(style)) {
              const values = castArray<string>(value);

              if (!values.includes(el.style[key])) return;
            }
          }

          const htmlAttributes = {};
          if (attributes) {
            const attributeNames = el.getAttributeNames();
            for (const attribute of attributes) {
              if (attributeNames.includes(attribute))
                htmlAttributes[attribute] = el.getAttribute(attribute);
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
