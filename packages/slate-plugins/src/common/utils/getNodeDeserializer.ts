import { DeserializeNode } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';

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
  rules,
}: GetNodeDeserializerOptions) => {
  const deserializers: DeserializeNode[] = [];

  rules.forEach(({ nodeNames = '*', style, className }) => {
    nodeNames = castArray<string>(nodeNames);

    nodeNames.forEach((nodeName) => {
      deserializers.push({
        type,
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

          return node(el);
        },
      });
    });
  });

  return deserializers;
};
